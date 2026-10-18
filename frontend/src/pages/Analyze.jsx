import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getRecords, getAnalysis, uploadAnalysis, getJobStatus, BUNDLED_RECORDS } from '../services/api';

export default function Analyze() {
  const navigate = useNavigate();
  const [records, setRecords] = useState(BUNDLED_RECORDS);
  const [isBackendOffline, setIsBackendOffline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [error, setError] = useState(null);

  // Upload Form State
  const [selectedFile, setSelectedFile] = useState(null);
  const [rpmInput, setRpmInput] = useState('');
  const [fsInput, setFsInput] = useState('12000');
  const [uploadError, setUploadError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeJob, setActiveJob] = useState(null); // { id, status, startedAt, error, elapsedSec }

  const pollIntervalRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchRecordList = () => {
    getRecords()
      .then(({ records: data, isOffline }) => {
        setRecords(data);
        setIsBackendOffline(Boolean(isOffline));
        setLoading(false);
      })
      .catch((err) => {
        setError(`Failed to retrieve record list: ${err.message}`);
        setIsBackendOffline(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRecordList();
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Poll active job status
  useEffect(() => {
    if (!activeJob || activeJob.status === 'done' || activeJob.status === 'failed') {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    const poll = async () => {
      try {
        const res = await getJobStatus(activeJob.id);
        const elapsed = activeJob.startedAt
          ? Math.max(0, Math.round((Date.now() - new Date(activeJob.startedAt).getTime()) / 1000))
          : activeJob.elapsedSec + 2;

        if (res.status === 'done') {
          setActiveJob((prev) => ({ ...prev, status: 'done', elapsedSec: elapsed }));
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          fetchRecordList();
          // Navigate to result
          setTimeout(() => {
            navigate(`/analyses/${activeJob.id}`);
          }, 800);
        } else if (res.status === 'failed') {
          setActiveJob((prev) => ({
            ...prev,
            status: 'failed',
            error: res.error || 'MATLAB processing failed.',
            elapsedSec: elapsed
          }));
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          fetchRecordList();
        } else {
          setActiveJob((prev) => ({
            ...prev,
            status: res.status,
            startedAt: res.startedAt || prev.startedAt,
            elapsedSec: elapsed
          }));
        }
      } catch (err) {
        console.warn('[Polling Error]', err.message);
      }
    };

    pollIntervalRef.current = setInterval(poll, 2000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [activeJob?.id, activeJob?.status]);

  const handleSelectRecord = async (recordId) => {
    setError(null);
    setAnalyzingId(recordId);

    try {
      await getAnalysis(recordId);
      navigate(`/analyses/${recordId}`);
    } catch (err) {
      setError(`Record ${recordId} analysis could not be loaded: ${err.message}`);
      setAnalyzingId(null);
    }
  };

  const handleFileChange = (file) => {
    setUploadError(null);
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Client-side validation: .mat extension
    if (!file.name.toLowerCase().endsWith('.mat')) {
      setUploadError('Invalid file format. Only CWRU MATLAB (.mat) files are accepted.');
      setSelectedFile(null);
      return;
    }

    // Client-side validation: max size 50 MB
    if (file.size > 50 * 1024 * 1024) {
      setUploadError('File size exceeds 50 MB limit.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadError(null);

    if (!selectedFile) {
      setUploadError('Please select a .mat file to analyze.');
      return;
    }

    // Validate optional RPM
    let rpmVal = null;
    if (rpmInput.trim() !== '') {
      const parsed = Number(rpmInput);
      if (isNaN(parsed) || parsed < 100 || parsed > 10000) {
        setUploadError('Motor speed (rpm) must be a number between 100 and 10,000.');
        return;
      }
      rpmVal = parsed;
    }

    try {
      const res = await uploadAnalysis(selectedFile, { rpm: rpmVal, fs: fsInput });
      setActiveJob({
        id: res.id,
        status: res.status,
        fileName: selectedFile.name,
        startedAt: null,
        elapsedSec: 0,
        error: null
      });
      // Reset file input
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setUploadError(err.message || 'Failed to submit file for analysis.');
    }
  };

  const isProcessing = Boolean(activeJob && (activeJob.status === 'processing' || activeJob.status === 'queued'));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-[#202027] border border-[#353540] rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#353540]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#A100FF] animate-pulse"></span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#22D3EE]">
                Signal Acquisition & Processing
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold font-sans text-[#F5F5FA]">
              Upload & Analyze Vibration Accelerometer Data
            </h1>
            <p className="text-xs text-[#A5A5B5] mt-0.5">
              Feed raw CWRU drive-end bearing MAT-files into the offline MATLAB DSP pipeline for automated envelope analysis.
            </p>
          </div>

          <div className="text-xs font-mono px-3 py-1.5 rounded-lg bg-[#191920] border border-[#353540] text-[#A5A5B5] self-start sm:self-auto flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isBackendOffline ? 'bg-[#FBBF24]' : 'bg-[#4ADE80]'}`} />
            <span>Mode: {isBackendOffline ? 'Offline Stored Dataset' : 'Connected to Express & MATLAB'}</span>
          </div>
        </div>

        {/* Backend Offline Warning Banner */}
        {isBackendOffline && (
          <div className="mt-4 p-3.5 rounded-lg bg-[#FBBF24]/10 border border-[#FBBF24]/30 text-xs font-mono text-[#FBBF24] flex items-start gap-2.5">
            <span className="text-base select-none leading-none">⚠</span>
            <div>
              <span className="font-bold tracking-wider">[OFFLINE NOTICE]: </span>
              Backend is currently offline. Showing bundled results only. Live upload and background MATLAB batch processing are disabled until the backend service is started on port 5000.
            </div>
          </div>
        )}
      </div>

      {/* Main Upload Area Section */}
      <section className="bg-[#202027] border border-[#353540] rounded-xl p-6 shadow-xl font-sans">
        <div className="flex items-center justify-between pb-4 border-b border-[#353540]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#A100FF] to-[#22D3EE] flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#F5F5FA] font-mono">
                Analyze Vibration Recording (.mat)
              </h2>
              <p className="text-xs text-[#A5A5B5]">
                Accepts CWRU drive-end format (SKF 6205 bearing). Level 5 or 7.3 MAT-files.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#22D3EE] uppercase px-2 py-0.5 rounded bg-[#22D3EE]/10 border border-[#22D3EE]/30">
            MATLAB Batch Engine
          </span>
        </div>

        {/* Active Job Progress Card */}
        {activeJob && (
          <div className="mt-5 p-4 rounded-xl border border-[#353540] bg-[#191920] space-y-3 shadow-inner">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#F5F5FA] font-bold tracking-wide">
                Active Job ID: <span className="text-[#22D3EE]">{activeJob.id}</span>
              </span>
              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                  activeJob.status === 'processing'
                    ? 'bg-[#22D3EE]/10 text-[#22D3EE] border-[#22D3EE]/40 animate-pulse'
                    : activeJob.status === 'done'
                    ? 'bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/40'
                    : activeJob.status === 'failed'
                    ? 'bg-[#FB7185]/10 text-[#FB7185] border-[#FB7185]/40'
                    : 'bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/40'
                }`}
              >
                [{activeJob.status.toUpperCase()}]
              </span>
            </div>

            <div className="text-xs font-mono">
              {activeJob.status === 'queued' && (
                <div className="flex items-center gap-3 text-[#A5A5B5]">
                  <div className="w-4 h-4 border-2 border-[#353540] border-t-[#22D3EE] rounded-full animate-spin" />
                  <span>Queued: Waiting for worker availability...</span>
                </div>
              )}

              {activeJob.status === 'processing' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-[#22D3EE] font-medium">
                    <div className="w-4 h-4 border-2 border-[#22D3EE]/30 border-t-[#22D3EE] rounded-full animate-spin" />
                    <span>Processing: MATLAB is analysing the signal, this can take up to a minute</span>
                  </div>
                  <div className="text-[11px] text-[#A5A5B5] pl-7 space-y-0.5">
                    <div>Elapsed time: <span className="text-[#F5F5FA] font-bold">{activeJob.elapsedSec} seconds</span></div>
                    <div className="text-[#6E6E82]">Steps: Detrending &rarr; Bandpass filter (2-5 kHz) &rarr; Hilbert demodulation &rarr; Kinematic matching</div>
                  </div>
                </div>
              )}

              {activeJob.status === 'done' && (
                <div className="text-[#4ADE80] font-medium flex items-center gap-2">
                  <span>✓</span>
                  <span>Analysis completed successfully. Redirecting to scientific dashboard...</span>
                </div>
              )}

              {activeJob.status === 'failed' && (
                <div className="space-y-3">
                  <div className="text-[#FB7185] font-medium flex items-center gap-2">
                    <span>✕</span>
                    <span>Analysis Error: {activeJob.error}</span>
                  </div>
                  <button
                    onClick={() => setActiveJob(null)}
                    className="px-3 py-1.5 bg-[#202027] text-[#F5F5FA] text-xs font-mono rounded border border-[#353540] hover:border-[#FB7185] transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload Form */}
        <form onSubmit={handleUploadSubmit} className="mt-5 space-y-5">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (!isBackendOffline && !isProcessing) setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (isBackendOffline || isProcessing) return;
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileChange(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => {
              if (!isBackendOffline && !isProcessing && fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
            className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all ${
              isBackendOffline || isProcessing
                ? 'bg-[#191920]/50 border-[#353540] opacity-50 cursor-not-allowed'
                : isDragging
                ? 'border-[#22D3EE] bg-[#22D3EE]/5 shadow-[0_0_20px_rgba(34,211,238,0.25)]'
                : selectedFile
                ? 'border-[#4ADE80] bg-[#4ADE80]/5'
                : 'border-[#353540] hover:border-[#A100FF] bg-[#191920] hover:bg-[#1f1f27] cursor-pointer'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".mat"
              disabled={isBackendOffline || isProcessing}
              onChange={(e) => handleFileChange(e.target.files[0])}
              className="hidden"
            />

            {selectedFile ? (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#4ADE80]/10 border border-[#4ADE80]/30 text-[#4ADE80] flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="space-y-0.5">
                  <span className="text-sm font-bold font-mono text-[#F5F5FA] block truncate max-w-md mx-auto">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs font-mono text-[#22D3EE] block tabular-nums">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB &bull; Ready for upload
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (fileInputRef.current) fileInputRef.current.click();
                  }}
                  className="mt-2 text-xs font-mono text-[#A5A5B5] hover:text-[#F5F5FA] underline"
                >
                  Choose a different file
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#202027] border border-[#353540] text-[#A5A5B5] flex items-center justify-center mx-auto group-hover:text-[#22D3EE] transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-medium text-[#F5F5FA] block">
                    Drag and drop a CWRU <span className="text-[#22D3EE] font-mono font-bold">.mat</span> file here, or
                  </span>
                  <button
                    type="button"
                    disabled={isBackendOffline || isProcessing}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (fileInputRef.current) fileInputRef.current.click();
                    }}
                    className="mt-1 px-3 py-1 rounded bg-[#202027] hover:bg-[#282833] text-xs font-mono text-[#A5A5B5] hover:text-[#F5F5FA] border border-[#353540] transition-colors inline-block"
                  >
                    Browse files
                  </button>
                </div>
                <div className="text-[11px] font-mono text-[#6E6E82]">
                  Maximum file size: 50 MB &bull; Accepted: Level 5 or 7.3 MAT-files
                </div>
              </div>
            )}
          </div>

          {/* Configuration Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#A5A5B5] mb-1.5">
                Motor speed (rpm) <span className="text-[#6E6E82] font-normal lowercase">(optional)</span>
              </label>
              <input
                type="number"
                min="100"
                max="10000"
                step="1"
                placeholder="Auto-detected from file (e.g. 1797)"
                value={rpmInput}
                disabled={isBackendOffline || isProcessing}
                onChange={(e) => setRpmInput(e.target.value)}
                className="w-full text-xs p-3 rounded-lg border border-[#353540] bg-[#191920] text-[#F5F5FA] placeholder-[#6E6E82] focus:outline-none focus:border-[#A100FF] focus:shadow-[0_0_10px_rgba(161,0,255,0.3)] disabled:opacity-50 transition-all"
              />
              <span className="text-[10px] text-[#6E6E82] block mt-1">
                Leave blank if the .mat file contains an RPM variable.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#A5A5B5] mb-1.5">
                Original sampling rate
              </label>
              <select
                value={fsInput}
                disabled={isBackendOffline || isProcessing}
                onChange={(e) => setFsInput(e.target.value)}
                className="w-full text-xs p-3 rounded-lg border border-[#353540] bg-[#191920] text-[#F5F5FA] focus:outline-none focus:border-[#A100FF] focus:shadow-[0_0_10px_rgba(161,0,255,0.3)] disabled:opacity-50 transition-all"
              >
                <option value="12000">12,000 Hz (CWRU Drive End standard)</option>
                <option value="48000">48,000 Hz (CWRU Drive End high-rate)</option>
              </select>
              <span className="text-[10px] text-[#6E6E82] block mt-1">
                Sampling rate is not stored inside CWRU MAT-files.
              </span>
            </div>
          </div>

          {/* Validation Error Banner */}
          {uploadError && (
            <div className="p-3.5 rounded-lg bg-[#FB7185]/10 border border-[#FB7185]/40 text-xs font-mono text-[#FB7185] flex items-center gap-2">
              <span>✕</span>
              <span>{uploadError}</span>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-[#353540]">
            <span className="text-xs font-mono text-[#6E6E82]">
              Background execution via MATLAB worker
            </span>

            <button
              type="submit"
              disabled={isBackendOffline || !selectedFile || isProcessing}
              className={`px-5 py-2.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all ${
                isBackendOffline || !selectedFile || isProcessing
                  ? 'bg-[#191920] text-[#6E6E82] border border-[#353540] cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#A100FF] to-[#E000A8] hover:from-[#8e00e0] hover:to-[#c70094] text-white border border-[#A100FF] shadow-[0_0_20px_rgba(161,0,255,0.4)]'
              }`}
            >
              {isProcessing ? 'Processing in MATLAB...' : 'Upload & Run DSP Analysis'}
            </button>
          </div>
        </form>
      </section>

      {/* Quick Compare: Reference Benchmark Records Catalog */}
      <section className="bg-[#202027] border border-[#353540] rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-[#353540]">
          <div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#F5F5FA]">
              Or Explore Pre-Computed Benchmark Records
            </h3>
            <p className="text-xs text-[#A5A5B5] mt-0.5">
              Instant access to verified CWRU reference tests without uploading
            </p>
          </div>
          <Link
            to="/"
            className="text-xs font-mono text-[#22D3EE] hover:underline"
          >
            View Full Dashboard &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {BUNDLED_RECORDS.map((rec) => (
            <button
              key={rec.id}
              onClick={() => handleSelectRecord(rec.id)}
              disabled={analyzingId !== null}
              className="p-3 rounded-lg bg-[#191920] border border-[#353540] hover:border-[#A100FF] text-left transition-all group"
            >
              <div className="text-[10px] font-mono text-[#6E6E82]">Record #{rec.id}</div>
              <div className="text-xs font-mono font-bold text-[#F5F5FA] group-hover:text-[#22D3EE] transition-colors">
                {rec.fileName}
              </div>
              <div className="text-[11px] font-mono text-[#A5A5B5] mt-1">
                {rec.knownCondition}
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
