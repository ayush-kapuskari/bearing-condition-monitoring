const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('./config');

class MatlabRunner {
  constructor() {
    this.queue = [];
    this.currentJob = null;
    this.matlabStatus = {
      available: false,
      version: null,
      checking: true
    };
  }

  /**
   * Initialize directories, perform cleanup, recover orphaned jobs,
   * and asynchronously probe MATLAB availability.
   */
  init() {
    const { sampleResultsDir, storageDir, uploadsDir, resultsDir, jobsDir } = config.paths;

    // Create required directories
    [sampleResultsDir, storageDir, uploadsDir, resultsDir, jobsDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Clean up files older than 24 hours
    this.cleanupOldFiles();

    // Mark any interrupted/orphaned jobs as failed
    this.recoverJobs();

    // Probe MATLAB availability in background (does not block server startup)
    this.checkMatlabAvailability();
  }

  /**
   * Remove upload results, uploaded files, and jobs older than 24 hours.
   */
  cleanupOldFiles() {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const dirsToClean = [config.paths.uploadsDir, config.paths.resultsDir, config.paths.jobsDir];

    dirsToClean.forEach((dir) => {
      try {
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          if (stat.mtimeMs < oneDayAgo) {
            fs.unlinkSync(filePath);
          }
        });
      } catch (err) {
        console.error(`[Cleaner] Error cleaning ${dir}:`, err.message);
      }
    });
  }

  /**
   * On startup mark any job left in "processing" or "queued" as "failed".
   */
  recoverJobs() {
    try {
      const files = fs.readdirSync(config.paths.jobsDir);
      files.forEach((file) => {
        if (!file.endsWith('.json')) return;
        const jobPath = path.join(config.paths.jobsDir, file);
        try {
          const job = JSON.parse(fs.readFileSync(jobPath, 'utf8'));
          if (job.status === 'processing' || job.status === 'queued') {
            job.status = 'failed';
            job.error = 'Server restarted';
            job.finishedAt = new Date().toISOString();
            fs.writeFileSync(jobPath, JSON.stringify(job, null, 2), 'utf8');
          }
        } catch {
          // ignore corrupted job files
        }
      });
    } catch (err) {
      console.error('[Recovery] Error recovering jobs:', err.message);
    }
  }

  /**
   * Background probe for MATLAB availability using `matlab -batch "disp(version)"` with 90s timeout.
   */
  checkMatlabAvailability() {
    console.log('[MATLAB] Checking availability using:', config.matlabBin);
    let timedOut = false;
    let stdoutData = '';

    const child = spawn(config.matlabBin, ['-batch', 'disp(version)'], {
      cwd: config.paths.repoRoot,
      windowsHide: true
    });

    const timeout = setTimeout(() => {
      timedOut = true;
      this.killProcess(child.pid);
      this.matlabStatus = {
        available: false,
        version: null,
        checking: false
      };
      console.warn('[MATLAB] Availability probe timed out after 90s.');
    }, 90000);

    child.stdout.on('data', (d) => {
      stdoutData += d.toString();
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      if (!timedOut) {
        this.matlabStatus = {
          available: false,
          version: null,
          checking: false
        };
        console.warn('[MATLAB] Not available:', err.message);
      }
    });

    child.on('close', (code) => {
      clearTimeout(timeout);
      if (timedOut) return;

      if (code === 0) {
        // Extract version line e.g. "26.2.0.3386108 (R2026b)"
        const lines = stdoutData.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        const versionLine = lines.find((l) => /\(R\d{4}[ab]\)/i.test(l)) || lines[lines.length - 1] || 'Detected';
        this.matlabStatus = {
          available: true,
          version: versionLine,
          checking: false
        };
        console.log(`[MATLAB] Ready. Version: ${versionLine}`);
      } else {
        this.matlabStatus = {
          available: false,
          version: null,
          checking: false
        };
        console.warn(`[MATLAB] Availability probe exited with code ${code}`);
      }
    });
  }

  /**
   * Enqueue a job into the in-memory FIFO queue and persist its status.
   */
  enqueueJob(job) {
    this.saveJob(job);
    this.queue.push(job);
    this.processNext();
  }

  /**
   * Persist a job to backend/storage/jobs/<id>.json
   */
  saveJob(job) {
    const jobPath = path.join(config.paths.jobsDir, `${job.id}.json`);
    fs.writeFileSync(jobPath, JSON.stringify(job, null, 2), 'utf8');
  }

  /**
   * Retrieve job status from disk
   */
  getJob(id) {
    // If it's the currently running job in memory
    if (this.currentJob && this.currentJob.id === id) {
      return this.currentJob;
    }
    // Check queue
    const queued = this.queue.find((j) => j.id === id);
    if (queued) return queued;

    // Check disk
    const jobPath = path.join(config.paths.jobsDir, `${id}.json`);
    if (fs.existsSync(jobPath)) {
      try {
        return JSON.parse(fs.readFileSync(jobPath, 'utf8'));
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Return queue statistics
   */
  getQueueStats() {
    return {
      running: this.currentJob ? 1 : 0,
      waiting: this.queue.length
    };
  }

  /**
   * Process the next job in the FIFO queue (runs ONE MATLAB job at a time).
   */
  async processNext() {
    if (this.currentJob || this.queue.length === 0) {
      return;
    }

    const job = this.queue.shift();
    this.currentJob = job;

    job.status = 'processing';
    job.startedAt = new Date().toISOString();
    this.saveJob(job);

    const inputPath = path.join(config.paths.uploadsDir, `${job.id}.mat`);
    const outputPath = path.join(config.paths.resultsDir, `${job.id}.json`);

    try {
      await this.runMatlab(job, inputPath, outputPath);
    } catch (err) {
      console.error(`[Job ${job.id}] Execution error:`, err.message);
    } finally {
      // Remove uploaded .mat file after analysis finishes (keep result JSON)
      if (fs.existsSync(inputPath)) {
        try {
          fs.unlinkSync(inputPath);
        } catch (unlinkErr) {
          console.warn(`[Job ${job.id}] Could not delete temporary upload file:`, unlinkErr.message);
        }
      }

      this.currentJob = null;
      // Continue to next queued job
      setImmediate(() => this.processNext());
    }
  }

  /**
   * Spawn MATLAB process to execute analyzeUploadedFile
   */
  runMatlab(job, inputPath, outputPath) {
    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const env = {
        ...process.env,
        MATLABPATH: config.paths.matlabScriptsDir,
        BEARING_INPUT: inputPath,
        BEARING_OUTPUT: outputPath,
        BEARING_RPM: job.rpm ? String(job.rpm) : '',
        BEARING_FS: String(job.fs || 12000)
      };

      console.log(`[Job ${job.id}] Starting MATLAB process...`);
      const child = spawn(config.matlabBin, ['-batch', 'analyzeUploadedFile'], {
        cwd: config.paths.repoRoot,
        env,
        windowsHide: true
      });

      const timer = setTimeout(() => {
        timedOut = true;
        console.warn(`[Job ${job.id}] Exceeded timeout of ${config.matlabTimeoutMs} ms. Terminating process.`);
        this.killProcess(child.pid);
        job.status = 'failed';
        job.error = `MATLAB analysis timed out after ${Math.round(config.matlabTimeoutMs / 1000)} seconds`;
        job.finishedAt = new Date().toISOString();
        this.saveJob(job);
        resolve();
      }, config.matlabTimeoutMs);

      child.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
        if (stdout.length > 50000) stdout = stdout.slice(-20000);
      });

      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
        if (stderr.length > 50000) stderr = stderr.slice(-20000);
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        if (!timedOut) {
          job.status = 'failed';
          job.error = `Failed to launch MATLAB process: ${err.message}`;
          job.finishedAt = new Date().toISOString();
          this.saveJob(job);
          resolve();
        }
      });

      child.on('close', (code) => {
        clearTimeout(timer);
        if (timedOut) return;

        console.log(`[Job ${job.id}] MATLAB exited with code ${code}`);

        // A job succeeds only if exit code is 0 AND output file exists and is valid JSON
        if (code === 0 && fs.existsSync(outputPath)) {
          try {
            const rawContent = fs.readFileSync(outputPath, 'utf8');
            const parsed = JSON.parse(rawContent);

            // Preserve original upload file name in metadata if available
            if (job.originalFileName && parsed.meta) {
              parsed.meta.fileName = job.originalFileName;
              fs.writeFileSync(outputPath, JSON.stringify(parsed), 'utf8');
            }

            job.status = 'done';
            job.finishedAt = new Date().toISOString();
            job.error = null;
            this.saveJob(job);
            resolve();
            return;
          } catch (jsonErr) {
            console.error(`[Job ${job.id}] Output JSON parsing failed:`, jsonErr.message);
          }
        }

        // Handle failure
        job.status = 'failed';
        job.finishedAt = new Date().toISOString();
        job.error = this.extractCleanErrorMessage(stderr, stdout);
        this.saveJob(job);
        resolve();
      });
    });
  }

  /**
   * Terminate process on Windows or POSIX safely
   */
  killProcess(pid) {
    if (!pid) return;
    if (process.platform === 'win32') {
      exec(`taskkill /pid ${pid} /T /F`, (err) => {
        if (err) console.warn(`[MatlabRunner] taskkill failed:`, err.message);
      });
    } else {
      try {
        process.kill(pid, 'SIGKILL');
      } catch (err) {
        console.warn(`[MatlabRunner] process.kill failed:`, err.message);
      }
    }
  }

  /**
   * Extract human-readable failure message from stderr/stdout
   */
  extractCleanErrorMessage(stderr, stdout) {
    const combined = `${stderr}\n${stdout}`;

    if (combined.includes('No *_DE_time variable') || combined.includes('noSignal')) {
      return 'No drive-end signal variable (*_DE_time) found in this file';
    }
    if (combined.includes('RPM is missing') || combined.includes('noRpm')) {
      return 'RPM is missing: please enter the motor speed';
    }
    if (combined.includes('Corrupt MAT-file') || combined.includes('Invalid MAT-file')) {
      return 'The uploaded file is not a valid or readable MAT-file';
    }

    // Keep the last ~2000 characters
    const trimmed = (stderr.trim() || stdout.trim()).slice(-2000);
    // Filter out common license / trial banners if possible
    const cleanLines = trimmed
      .split('\n')
      .filter((line) => !line.includes('Trial License') && !line.includes('Academic License'))
      .map((l) => l.trim())
      .filter(Boolean);

    return cleanLines.slice(-3).join(' ') || 'MATLAB processing failed with an unknown error.';
  }
}

const runner = new MatlabRunner();
module.exports = runner;
