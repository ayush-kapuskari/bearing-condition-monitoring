const express = require('express');
const fs = require('fs');
const path = require('path');
const config = require('../config');

const router = express.Router();

const BUNDLED_CONFIG = [
  { id: '97', fileName: '97.mat', knownCondition: 'Healthy' },
  { id: '105', fileName: '105.mat', knownCondition: 'Inner Race' },
  { id: '118', fileName: '118.mat', knownCondition: 'Ball' },
  { id: '130', fileName: '130.mat', knownCondition: 'Outer Race' }
];

router.get('/records', (req, res) => {
  try {
    // 1. Bundled records from backend/sample_results
    const bundledRecords = [];
    BUNDLED_CONFIG.forEach((rec) => {
      const jsonPath = path.join(config.paths.sampleResultsDir, `${rec.id}.json`);
      if (fs.existsSync(jsonPath)) {
        bundledRecords.push({
          id: rec.id,
          fileName: rec.fileName,
          knownCondition: rec.knownCondition,
          source: 'bundled',
          status: 'done'
        });
      }
    });

    // 2. Completed uploaded records from backend/storage/jobs
    const uploadedRecords = [];
    if (fs.existsSync(config.paths.jobsDir)) {
      const jobFiles = fs.readdirSync(config.paths.jobsDir);
      jobFiles.forEach((file) => {
        if (!file.endsWith('.json')) return;
        const jobPath = path.join(config.paths.jobsDir, file);
        try {
          const job = JSON.parse(fs.readFileSync(jobPath, 'utf8'));
          if (job.status === 'done') {
            // Also ensure the actual result JSON exists
            const resultPath = path.join(config.paths.resultsDir, `${job.id}.json`);
            if (fs.existsSync(resultPath)) {
              uploadedRecords.push({
                id: job.id,
                fileName: job.originalFileName || `${job.id}.mat`,
                knownCondition: null,
                source: 'upload',
                status: 'done',
                finishedAt: job.finishedAt || job.createdAt || 0
              });
            }
          }
        } catch {
          // ignore corrupted job files
        }
      });
    }

    // Sort uploaded records newest first
    uploadedRecords.sort((a, b) => new Date(b.finishedAt) - new Date(a.finishedAt));

    // Combine bundled and uploaded records
    res.json([...bundledRecords, ...uploadedRecords]);
  } catch (err) {
    res.status(500).json({ error: `Failed to load records list: ${err.message}` });
  }
});

module.exports = router;
