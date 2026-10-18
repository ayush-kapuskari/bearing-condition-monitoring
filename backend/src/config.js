const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const repoRoot = path.resolve(__dirname, '..', '..');
const sampleResultsDir = path.resolve(__dirname, '..', 'sample_results');
const storageDir = path.resolve(__dirname, '..', 'storage');
const uploadsDir = path.resolve(storageDir, 'uploads');
const resultsDir = path.resolve(storageDir, 'results');
const jobsDir = path.resolve(storageDir, 'jobs');
const matlabScriptsDir = path.resolve(repoRoot, 'matlab', 'scripts');

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  matlabBin: process.env.MATLAB_BIN || 'matlab',
  matlabTimeoutMs: parseInt(process.env.MATLAB_TIMEOUT_MS, 10) || 180000,
  maxUploadMb: parseInt(process.env.MAX_UPLOAD_MB, 10) || 50,
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  paths: {
    repoRoot,
    sampleResultsDir,
    storageDir,
    uploadsDir,
    resultsDir,
    jobsDir,
    matlabScriptsDir
  }
};
