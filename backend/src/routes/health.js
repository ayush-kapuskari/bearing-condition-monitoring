const express = require('express');
const matlabRunner = require('../matlabRunner');

const router = express.Router();

router.get('/health', (req, res) => {
  const queueStats = matlabRunner.getQueueStats();
  res.json({
    status: 'ok',
    matlab: {
      available: matlabRunner.matlabStatus.available,
      ...(matlabRunner.matlabStatus.version ? { version: matlabRunner.matlabStatus.version } : {})
    },
    queue: queueStats
  });
});

module.exports = router;
