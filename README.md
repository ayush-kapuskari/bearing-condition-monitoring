# DSP-Based Bearing Condition Monitoring

A Digital Signal Processing (DSP) based system for **bearing condition monitoring and fault signature analysis** using vibration signals from the **Case Western Reserve University (CWRU) Bearing Dataset**.

The project analyzes vibration signals from rotating machinery bearings and identifies characteristic bearing fault frequencies using MATLAB-based DSP techniques. The processed results will be presented through a full-stack web application built using the MERN stack.

---

## 1. Project Overview

Bearings are critical components in rotating machines such as motors, pumps, generators, and industrial equipment.

Bearing defects produce characteristic patterns in vibration signals. By applying Digital Signal Processing techniques to these vibration signals, it is possible to identify abnormal frequency components associated with different bearing faults.

This project aims to develop a complete system that:

- Processes vibration signals from bearing datasets
- Performs time-domain and frequency-domain analysis
- Detects characteristic bearing fault frequencies
- Compares detected frequencies with theoretical fault frequencies
- Determines the probable bearing condition
- Stores analysis results
- Presents the results through an interactive web interface

The core signal processing and fault analysis will be implemented using **MATLAB**, while the web application will use the **MERN stack**.

---

## 2. Problem Statement

Develop a DSP-based bearing condition monitoring system that analyzes vibration signals from rotating machinery and identifies characteristic bearing fault signatures.

The system will apply techniques such as:

- Time-domain analysis
- Fast Fourier Transform (FFT)
- Power Spectral Density (PSD)
- Short-Time Fourier Transform (STFT)
- Band-pass filtering
- Hilbert Transform
- Envelope analysis
- Envelope spectrum analysis
- Peak detection
- Bearing characteristic frequency analysis

The detected frequency components will be compared with theoretical bearing fault frequencies such as:

- BPFO — Ball Pass Frequency Outer Race
- BPFI — Ball Pass Frequency Inner Race
- BSF — Ball Spin Frequency
- FTF — Fundamental Train Frequency

The final analysis will be presented through a full-stack web application.

---

## 3. Dataset

The project will initially use the:

**Case Western Reserve University (CWRU) Bearing Dataset**

The dataset contains vibration measurements from bearings under different operating and fault conditions.

The dataset includes signals corresponding to conditions such as:

- Normal bearing condition
- Inner race fault
- Outer race fault
- Ball fault

Different operating loads and motor conditions are available in the dataset.

The exact subset of files used by the project will be documented after dataset selection and validation.

---

## 4. DSP Processing Pipeline

The overall signal processing pipeline is:

```text
CWRU Vibration Signal
        |
        v
Data Loading
        |
        v
Preprocessing
        |
        v
Time-Domain Analysis
        |
        +-------------------+
        |                   |
        v                   v
       FFT                 PSD
        |                   |
        +---------+---------+
                  |
                  v
             STFT Analysis
                  |
                  v
          Resonance / Band
          Selection
                  |
                  v
          Band-Pass Filtering
                  |
                  v
          Hilbert Transform
                  |
                  v
          Envelope Extraction
                  |
                  v
         Envelope Spectrum
                  |
                  v
          Peak Detection
                  |
                  v
      Characteristic Frequency
             Comparison
                  |
                  v
        Fault Identification
                  |
                  v
         Bearing Condition