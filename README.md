# DSP-Based Bearing Condition Monitoring

A Digital Signal Processing (DSP) based bearing condition monitoring and fault signature analysis system using vibration signals from the Case Western Reserve University (CWRU) Bearing Dataset.

The project combines MATLAB-based signal processing with a Python FastAPI backend and a React-based frontend to provide an interactive bearing health monitoring system.

---

## 1. Project Overview

Bearings are critical components in rotating machinery such as motors, pumps, generators, and industrial machines.

Bearing defects generate characteristic patterns in vibration signals.

This project analyzes vibration signals and identifies characteristic bearing fault frequencies using Digital Signal Processing techniques.

The system uses:

- Time-domain analysis
- Fast Fourier Transform (FFT)
- Power Spectral Density (PSD)
- Short-Time Fourier Transform (STFT)
- Band-pass filtering
- Hilbert transform
- Envelope analysis
- Envelope spectrum
- Bearing characteristic frequency analysis
- Peak detection
- Physics-based fault diagnosis

The final results are presented through a full-stack web application.

---

## 2. Problem Statement

Develop a DSP-based system for bearing condition monitoring using vibration signals.

The system preprocesses vibration signals and applies time-domain and frequency-domain techniques such as FFT, PSD, STFT, and envelope analysis to identify characteristic bearing fault frequencies.

The detected frequency components are compared with theoretical bearing fault frequencies to assess the bearing condition and distinguish between normal and faulty bearing conditions.

The results are presented through an interactive web-based dashboard.

---

## 3. Main Objective

The main objective is to develop a system that can:

1. Load vibration signals from the CWRU bearing dataset.
2. Preprocess the vibration signal.
3. Analyze the signal in the time domain.
4. Analyze the signal using FFT.
5. Analyze the signal using PSD.
6. Analyze time-varying frequency content using STFT.
7. Perform envelope analysis.
8. Calculate theoretical bearing fault frequencies.
9. Detect characteristic peaks in the measured signal.
10. Compare measured peaks with theoretical frequencies.
11. Determine the probable bearing condition.
12. Display the complete analysis through a web dashboard.

---

## 4. Project Architecture

The system is divided into three major layers:

```text
                CWRU .MAT DATA
                       |
                       v
              MATLAB DSP ENGINE
                       |
          +------------+------------+
          |            |            |
          v            v            v
     Time Domain      FFT          PSD
          |                         |
          +------------+------------+
                       |
                      STFT
                       |
                       v
              Band-Pass Filtering
                       |
                       v
               Hilbert Transform
                       |
                       v
                  Envelope
                       |
                       v
              Envelope Spectrum
                       |
                       v
                Peak Detection
                       |
                       v
          BPFO / BPFI / BSF / FTF
                       |
                       v
              Fault Diagnosis
                       |
                       v
                  JSON Result
                       |
                       v
              Python FastAPI
                  Backend
                       |
                       v
               React Frontend
                       |
                       v
             Monitoring Dashboard