# Bearing Condition Monitoring: Progress and Team Guide

Offline analysis of recorded vibration data to decide whether a motor bearing is healthy, and if not, which part is damaged.

> This is **offline analysis of recorded data**. It is not real-time monitoring. Do not call it real-time, AI or predictive maintenance in the report or slides.

---

## 1. The idea in simple words

- A damaged bearing part makes a tiny knock every time a ball rolls over the damage.
- How often the knocks happen depends only on the **bearing size** and the **motor speed**, so we can **calculate** that rate before looking at any data.
- We then check whether the real signal has a peak at the calculated rate. If it does, we know where the damage is.
- **Nothing is trained or learned.** The decision is made from physics and clear rules.

### The four frequencies (at about 1797 rpm)

| Name | Meaning | Value | Fault it points to |
|---|---|---|---|
| BPFO | Balls passing a point on the outer ring | about 107.4 Hz | Outer race |
| BPFI | Balls passing a point on the inner ring | about 162.2 Hz | Inner race |
| BSF (we use 2 x BSF) | Ball spin rate (a ball defect hits both rings each spin) | about 141.2 Hz | Ball |
| FTF | Cage rotation rate | about 11.9 Hz | Sidebands / cage |

They come from the formulas below, using n = 9 balls, d = 0.3126 in, D = 1.537 in, contact angle 0:

```
BPFO = (n/2) * fr * (1 - d/D)
BPFI = (n/2) * fr * (1 + d/D)
BSF  = (D/(2d)) * fr * (1 - (d/D)^2)
FTF  = (fr/2) * (1 - d/D)
```

`fr` is shaft frequency = rpm / 60.

### Why the envelope spectrum

A knock is very short, so it makes the bearing housing ring like a bell at a few kHz. The energy sits there, so a normal FFT shows little at 107 Hz. The knock rate is hidden in how the ringing rises and falls. **Envelope analysis** recovers it:

1. Band-pass filter around the ringing (we use 2000-5000 Hz).
2. Take the envelope (the outline of the bursts) with the Hilbert transform.
3. Remove the mean and take the FFT of the envelope.

It is the same idea as an AM radio receiver. Showing that the plain FFT fails and the envelope spectrum works is our strongest technical point.

---

## 2. Data

CWRU Bearing Data Center, 12 kHz drive-end data. Source: https://engineering.case.edu/bearingdatacenter/download-data-file

| File | Condition |
|---|---|
| 97.mat | Healthy |
| 105.mat | Inner race fault |
| 118.mat | Ball fault |
| 130.mat | Outer race fault |

- Signal variable: `X###_DE_time`. Speed variable: `X###RPM` (about 1796 to 1797).
- All four are 12 kHz. We checked 97 (healthy) from the shaft peak at about 30 Hz, so **no resampling is needed**.
- **The `.mat` files are not on GitHub** (they are in `.gitignore`). Each person downloads them once into `matlab/data/raw/`, keeping the file names.

---

## 3. What is done so far

### Setup
- Folder structure, `.gitignore`, README.
- Inspection script `matlab/scripts/inspectCWRUFiles.m` (lists the variables inside each file).

### MATLAB functions (one job each)

| File | Job | Status |
|---|---|---|
| `src/pipeline/defaultConfig.m` | Every tunable number in one place | Done |
| `src/io/loadCWRUData.m` | Opens a `.mat` file, returns signal, fs, rpm | Done and tested |
| `src/preprocessing/preprocessSignal.m` | Removes offset and drift. No normalising and no smoothing, on purpose | Done and tested |
| `src/preprocessing/segmentSignal.m` | Cuts the record into overlapping 1 s pieces (about 19 per record) | Done and tested |
| `src/bearing/getBearingGeometry.m` | Bearing dimensions (SKF 6205) | Done and tested |
| `src/bearing/calculateBearingFrequencies.m` | BPFO, BPFI, BSF, FTF from geometry and rpm | Done and tested |
| `src/envelope/calculateEnvelopeSpectrum.m` | Band-pass, Hilbert envelope, FFT | Done and tested |
| `scripts/demoEnvelope.m` | Plots the envelope spectrum of all 4 files with the predicted frequencies marked | Done and tested |
| `src/features/calculateTimeFeatures.m` | RMS, peak, crest factor, kurtosis, skewness per segment | Written, not yet run |
| `src/spectral/calculateFFT.m` | Plain FFT, to show the fault is not visible here | Written, not yet run |
| `src/diagnosis/compareFaultFrequencies.m` | Looks for a peak near each predicted frequency and measures how far it stands above the noise | Written, not yet run |
| `src/diagnosis/diagnoseBearing.m` | Turns the evidence into a verdict (Healthy, Outer, Inner, Ball, Uncertain) | Written, not yet run |
| `src/pipeline/analyzeSignal.m`, `runPipeline.m`, `exportResultJson.m` | Run everything and write one `result.json` per record | Written, not yet run |
| `scripts/runAllStarter.m` | Runs all 4 records and writes JSON to `backend/sample_results/` | Written, not yet run |

---

## 4. Result we already have

`demoEnvelope.m` draws one panel per record, with the predicted frequencies as coloured vertical lines:

- **130 (outer race):** a very large peak sits exactly on the BPFO line at about 107 Hz, with repeats at about 214, 322, 430 and 537 Hz.
- **105 (inner race):** the biggest peak sits on the BPFI line at about 162 Hz, with repeats at about 324 and 486 Hz.
- **97 (healthy):** almost flat. Only a small shaft peak at about 30 Hz, and the vertical scale is about 100 times smaller.
- **118 (ball):** noisy with no clean peak on the 2 x BSF line. This is the hardest class in this dataset, and an **Uncertain** verdict is an acceptable result here. We report it openly.

So the physics works: the peaks appear where the formulas say they should.

---

## 5. How to set up on your laptop

1. Clone the repo.
2. Get MATLAB with **Signal Processing Toolbox** (college license, 30-day trial, or MATLAB Online at matlab.mathworks.com).
3. Download the 4 files (97, 105, 118, 130) into `matlab/data/raw/`, keeping the names.
4. In **MATLAB**, set the Current Folder to the repo root and run:
   ```matlab
   addpath(genpath('matlab/src'))
   run('matlab/scripts/demoEnvelope.m')
   ```
5. You should see 4 plots with a peak on the red BPFO line in the 130 panel.

### Mistakes we already hit (avoid them)

- **Two different windows.** The VS Code terminal (`PS C:\...>`) is PowerShell and is only for `git` and `npm`. MATLAB code goes in the **MATLAB Command Window** (`>>`). Pasting MATLAB code into PowerShell gives confusing errors.
- **Scripts and relative paths.** `run('path/script.m')` makes MATLAB switch into the script's own folder while it runs. Build paths from the script location (`mfilename('fullpath')`), not from bare relative paths.
- **Wrong text in the wrong file.** Check that each `.m` file starts with the right `function` line. In MATLAB, `type functionName` prints the file.
- After editing a function, run `rehash` and `clear functions` so MATLAB drops any cached old version.

---

## 6. What is next

1. **Run `runAllStarter.m`**, check the four verdicts and tune the thresholds in `defaultConfig.m` if needed. Expect 130 and 105 to be correct and 118 to be Uncertain or close.
2. **Backend (Express):** serve the JSON files from `backend/sample_results/`
   - `GET /api/records` lists the records
   - `GET /api/analyses/:id` returns one `result.json`
3. **Frontend (React + Vite + Plotly):** record picker, verdict badge, envelope chart with markers at BPFO, BPFI, 2 x BSF and FTF, evidence table, and an FFT tab showing the plain FFT does not reveal the fault.
4. **Methodology page:** the four formulas, the pipeline, the data source, and the statement that this is offline analysis.
5. **README, screenshots, short demo video, a few unit tests.**
6. **Only if time is left:** live upload through `matlab -batch`, STFT and PSD, the other 24 CWRU records for validation.

### Suggested split

| Area | Task |
|---|---|
| MATLAB diagnosis | Run `runAllStarter.m`, tune thresholds, explain each verdict |
| Backend | Express API serving the JSON files |
| Frontend | React dashboard with Plotly |
| Docs | README, methodology page, report figures, demo video |

---

## 7. Ground rules

- Small commits with an area prefix, for example `matlab: add envelope spectrum`, `backend: serve sample results`.
- Work on short branches and open pull requests. One other person reviews each one.
- Do not commit `matlab/data/raw/`, `node_modules/`, `.env` files or anything in `backend/storage/`.
- Every tunable number lives in `defaultConfig.m`. Do not type thresholds inside other functions.
- Every function takes `fs` as an argument. Never assume 12000 inside a function.
- Everyone should be able to explain the whole pipeline, because a viva question can go to anyone.

---

## 8. Questions you may get in the viva

- Why do BPFO, BPFI, BSF and FTF need no training?
- Why does the plain FFT not show the fault, and why does the envelope spectrum?
- Why is there no normalisation or smoothing in preprocessing?
- Why do we cut the signal into overlapping segments?
- Why can the detected peak differ slightly from the theoretical frequency?
- Why can the result be Uncertain, and why is that honest rather than a failure?
- Why is this offline analysis and not real-time monitoring?