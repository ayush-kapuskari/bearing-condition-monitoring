# DSP-Based Bearing Condition Monitoring

A Digital Signal Processing (DSP) system for offline analysis of recorded motor bearing vibration data to detect localized defects and identify fault locations (Outer Race, Inner Race, or Ball) against theoretical kinematic models.

Benchmark datasets originate from the **Case Western Reserve University (CWRU) Bearing Data Center**.

> **Note on System Nature:** This system conducts **offline analysis of recorded data**. All diagnostic classifications are derived deterministically using classical DSP (bandpass filtering, Hilbert demodulation, envelope spectrum FFT) and kinematic bearing formulas.

---

## Architecture

The system uses a 3-tier architecture with **no database / no MongoDB**:

- **Signal Processing Engine**: Desktop **MATLAB (R2019a or newer)** with Signal Processing Toolbox. Runs in batch mode (`matlab -batch "analyzeUploadedFile"`) to execute the deterministic DSP pipeline on uploaded CWRU `.mat` files.
- **Backend API**: **Node.js + Express 5** (CommonJS) serving stored JSON results and coordinating an in-memory FIFO queue for MATLAB analysis jobs.
- **Frontend Dashboard**: **React 18 + Vite + Tailwind CSS + Plotly.js** delivering an engineering instrument panel with interactive envelope spectrum family toggles, kinematic tolerance bands, harmonic evidence matrices, and statistical metrics.

---

## Prerequisites

1. **Node.js**: v18+ (tested on Node v22).
2. **MATLAB**: Desktop MATLAB (R2019a or newer) with Signal Processing Toolbox installed on the machine running the backend.
   - *Note on Live Upload:* Live upload requires desktop MATLAB to execute `matlab -batch`. If MATLAB is not installed or unavailable, the backend gracefully serves the 4 pre-computed bundled reference records (`97`, `105`, `118`, `130`).

---

## Setup & Running

### 1. Backend

```bash
cd backend

# Copy configuration template
cp .env.example .env

# Install dependencies (express, cors, multer, dotenv)
npm install

# Start Express server on http://localhost:5000
npm run dev
```

Configuration parameters in `backend/.env`:
- `PORT`: Server port (default: `5000`)
- `MATLAB_BIN`: Path or command for MATLAB executable (default: `matlab` or full path `C:\Program Files\MATLAB\R2026b\bin\matlab.exe`)
- `MATLAB_TIMEOUT_MS`: Execution timeout per job in milliseconds (default: `180000`)
- `MAX_UPLOAD_MB`: Maximum uploaded `.mat` file size in MB (default: `50`)
- `FRONTEND_ORIGIN`: Allowed origin for CORS (default: `http://localhost:5173`)

### 2. Frontend

```bash
cd frontend

# Copy environment configuration
cp .env.example .env

# Install dependencies
npm install

# Start Vite dev server on http://localhost:5173
npm run dev
```

Configuration in `frontend/.env`:
- `VITE_API_URL`: Backend API URL (default: `http://localhost:5000`)
- `VITE_USE_BACKEND_API`: Set to `true` to connect to Express backend; falls back to static files if server is unreachable.

---

## API Reference

All requests and responses use JSON format, except the upload endpoint which accepts `multipart/form-data`.

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/health` | Health check, queue stats, and MATLAB availability probe | `200` |
| `GET` | `/api/records` | List of bundled records and completed uploaded records | `200` |
| `GET` | `/api/analyses/:id` | Full analysis JSON for record ID | `200`, `404` (not found), `409` (processing/failed) |
| `GET` | `/api/analyses/:id/status` | Job execution status (`queued`, `processing`, `done`, `failed`) | `200`, `404` |
| `POST` | `/api/analyses` | Upload `.mat` file with optional `rpm` and `fs` (12000 or 48000) | `202` (queued), `400` (invalid input), `413` (too large), `503` (MATLAB unavailable) |

---

## Testing Sequence (PowerShell)

You can verify the backend endpoints using PowerShell:

```powershell
# 1. Health check (verifies MATLAB availability and queue state)
Invoke-RestMethod http://localhost:5000/api/health | ConvertTo-Json

# 2. Get list of records (bundled 97, 105, 118, 130 + completed uploads)
Invoke-RestMethod http://localhost:5000/api/records | Format-Table id, fileName, knownCondition, source, status

# 3. Retrieve analysis for bundled record 130
$res = Invoke-RestMethod http://localhost:5000/api/analyses/130
Write-Host "Verdict: $($res.diagnosis.label), Score: $($res.diagnosis.confidence)"

# 4. Upload a raw CWRU .mat file for background analysis
$upload = curl.exe -s -X POST -F "file=@matlab/data/raw/130.mat" -F "fs=12000" http://localhost:5000/api/analyses | ConvertFrom-Json
$jobId = $upload.id
Write-Host "Queued Job ID: $jobId"

# 5. Poll status until finished
do {
    Start-Sleep -Seconds 2
    $status = Invoke-RestMethod "http://localhost:5000/api/analyses/$jobId/status"
    Write-Host "Status: $($status.status)"
} while ($status.status -eq 'queued' -or $status.status -eq 'processing')

# 6. Fetch newly computed analysis result
$newResult = Invoke-RestMethod "http://localhost:5000/api/analyses/$jobId"
Write-Host "Completed Verdict: $($newResult.diagnosis.label)"
```

---

## Characteristic Kinematics Frequencies

Frequencies are calculated for SKF 6205 bearings ($n = 9$ balls, $d = 0.3126\text{ in}$, $D = 1.537\text{ in}$, contact angle $\theta = 0^\circ$, shaft speed $f_r = \text{rpm} / 60$):

- **BPFO (Outer Race)**: $(n / 2) \cdot f_r \cdot [1 - (d / D)]$
- **BPFI (Inner Race)**: $(n / 2) \cdot f_r \cdot [1 + (d / D)]$
- **$2 \times \text{BSF}$ (Ball)**: $(D / d) \cdot f_r \cdot [1 - (d / D)^2]$
- **FTF (Cage)**: $(f_r / 2) \cdot [1 - (d / D)]$