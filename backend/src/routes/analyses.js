const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('../config');
const matlabRunner = require('../matlabRunner');

const router = express.Router();

// Multer storage: save into uploads folder with a temporary name, rename upon validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.paths.uploadsDir);
  },
  filename: (req, file, cb) => {
    const tempName = `tmp_${crypto.randomBytes(8).toString('hex')}.mat`;
    cb(null, tempName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.maxUploadMb * 1024 * 1024
  }
});

const BUNDLED_IDS = ['97', '105', '118', '130'];

/**
 * Validate MAT-file binary header:
 * - Level 5 MAT-files start with "MATLAB 5.0 MAT-file"
 * - Level 7.3 MAT-files start with HDF5 magic number \x89HDF
 */
function isValidMatFile(filePath) {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(32);
    const bytesRead = fs.readSync(fd, buffer, 0, 32, 0);
    fs.closeSync(fd);

    if (bytesRead < 4) return false;

    // HDF5 magic signature: 0x89, 0x48, 0x44, 0x46 (\x89HDF)
    if (buffer[0] === 0x89 && buffer[1] === 0x48 && buffer[2] === 0x44 && buffer[3] === 0x46) {
      return true;
    }

    const headerStr = buffer.toString('utf8');
    if (headerStr.startsWith('MATLAB 5.0 MAT-file') || headerStr.startsWith('MATLAB 7.3 MAT-file')) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * GET /api/analyses/:id/status
 */
router.get('/analyses/:id/status', (req, res) => {
  const { id } = req.params;

  if (BUNDLED_IDS.includes(id)) {
    const bundledPath = path.join(config.paths.sampleResultsDir, `${id}.json`);
    if (fs.existsSync(bundledPath)) {
      return res.json({
        id,
        status: 'done',
        startedAt: null,
        finishedAt: null
      });
    }
    return res.status(404).json({ error: 'Record not found' });
  }

  const job = matlabRunner.getJob(id);
  if (!job) {
    return res.status(404).json({ error: 'Record not found' });
  }

  res.json({
    id: job.id,
    status: job.status,
    startedAt: job.startedAt || null,
    finishedAt: job.finishedAt || null,
    ...(job.error ? { error: job.error } : {})
  });
});

/**
 * GET /api/analyses/:id
 */
router.get('/analyses/:id', (req, res) => {
  const { id } = req.params;

  // 1. Check bundled results
  if (BUNDLED_IDS.includes(id)) {
    const jsonPath = path.join(config.paths.sampleResultsDir, `${id}.json`);
    if (fs.existsSync(jsonPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        return res.json(data);
      } catch (err) {
        return res.status(500).json({ error: `Corrupted bundled record: ${err.message}` });
      }
    }
    return res.status(404).json({ error: 'Record not found' });
  }

  // 2. Check uploaded analysis
  const job = matlabRunner.getJob(id);
  if (!job) {
    return res.status(404).json({ error: 'Record not found' });
  }

  if (job.status === 'queued' || job.status === 'processing') {
    return res.status(409).json({
      error: 'Analysis is still in progress',
      status: job.status
    });
  }

  if (job.status === 'failed') {
    return res.status(409).json({
      error: job.error || 'Analysis failed',
      status: 'failed'
    });
  }

  // Job is done: read result JSON
  const resultPath = path.join(config.paths.resultsDir, `${id}.json`);
  if (!fs.existsSync(resultPath)) {
    return res.status(404).json({ error: 'Record not found' });
  }

  try {
    const data = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: `Corrupted analysis result: ${err.message}` });
  }
});

/**
 * POST /api/analyses
 * Accepts multipart/form-data: file, optional rpm, optional fs
 */
router.post('/analyses', upload.single('file'), (req, res) => {
  // If MATLAB is not available on server, reject with 503
  if (!matlabRunner.matlabStatus.available) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(503).json({ error: 'MATLAB is not available on the server' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  const tempFilePath = req.file.path;

  // Validation: Check file extension
  const ext = path.extname(req.file.originalname).toLowerCase();
  if (ext !== '.mat') {
    fs.unlinkSync(tempFilePath);
    return res.status(400).json({ error: 'File must have a .mat extension' });
  }

  // Validation: Check binary MAT-file header
  if (!isValidMatFile(tempFilePath)) {
    fs.unlinkSync(tempFilePath);
    return res.status(400).json({
      error: 'Uploaded file does not appear to be a valid MATLAB .mat file'
    });
  }

  // Validation: Optional RPM (between 100 and 10000)
  let validatedRpm = null;
  if (req.body.rpm !== undefined && req.body.rpm !== null && String(req.body.rpm).trim() !== '') {
    const parsedRpm = Number(req.body.rpm);
    if (isNaN(parsedRpm) || parsedRpm < 100 || parsedRpm > 10000) {
      fs.unlinkSync(tempFilePath);
      return res.status(400).json({
        error: 'Motor speed (rpm) must be a number between 100 and 10000'
      });
    }
    validatedRpm = parsedRpm;
  }

  // Validation: Optional fs (only 12000 or 48000 allowed, default 12000)
  let validatedFs = 12000;
  if (req.body.fs !== undefined && req.body.fs !== null && String(req.body.fs).trim() !== '') {
    const parsedFs = Number(req.body.fs);
    if (parsedFs !== 12000 && parsedFs !== 48000) {
      fs.unlinkSync(tempFilePath);
      return res.status(400).json({
        error: 'Sampling frequency must be either 12000 or 48000 Hz'
      });
    }
    validatedFs = parsedFs;
  }

  // Generate server-side id: u_<12 random hex>
  const id = `u_${crypto.randomBytes(6).toString('hex')}`;
  const targetMatPath = path.join(config.paths.uploadsDir, `${id}.mat`);

  try {
    fs.renameSync(tempFilePath, targetMatPath);
  } catch (err) {
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    return res.status(500).json({ error: `Failed to store upload: ${err.message}` });
  }

  // Create job structure
  const job = {
    id,
    originalFileName: req.file.originalname,
    rpm: validatedRpm,
    fs: validatedFs,
    status: 'queued',
    createdAt: new Date().toISOString(),
    startedAt: null,
    finishedAt: null,
    error: null
  };

  // Enqueue job into FIFO runner
  matlabRunner.enqueueJob(job);

  res.status(202).json({
    id,
    status: 'queued'
  });
});

module.exports = router;
