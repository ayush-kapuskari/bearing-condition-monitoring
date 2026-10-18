import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getRecords, getAnalysis, uploadAnalysis, getJobStatus } from '../services/api';

export default function Analyze() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
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
        setUploadError('Motor speed (rpm) must be a number between 100 and 10000.');
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

  const getConditionBadge = (condition) => {
    if (!condition) {
      return (
        <span className="px-2 py-0.5 text-xs font-mono uppercase bg-zinc-100 text-zinc-700 border border-zinc-300">
          User Upload
        </span>
      );
    }
    const isHealthy = condition.toLowerCase().includes('healthy');
    return (
      <span
        className={`px-2 py-0.5 text-xs font-mono font-semibold uppercase border ${
          isHealthy
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
            : 'bg-red-50 text-red-800 border-red-300'
        }`}
      >
        {isHealthy ? '[NORMAL]' : '[FAULT]'} {condition}
      </span>
    );
  };

  const getConditionDetails = (id) => {
    switch (id) {
      case '97':
        return 'Baseline normal operation at ~1797 rpm. 0 HP load, intact rolling elements and raceways.';
      case '105':
        return 'Drive-end bearing inner race defect (0.007" depth), motor speed ~1797 rpm.';
      case '118':
        return 'Drive-end bearing ball element defect (0.007" depth), motor speed ~1797 rpm.';
      case '130':
        return 'Drive-end bearing outer race defect centered at 6 o\'clock position (0.007" depth), ~1797 rpm.';
      default:
        return 'User uploaded vibration recording processed with offline MATLAB pipeline.';
    }
  };

  const bundledRecords = records.filter((r) => r.source === 'bundled' || ['97', '105', '118', '130'].includes(r.id));
  const uploadedRecords = records.filter((r) => r.source === 'upload');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-zinc-300 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-sm sm:text-base font-mono font-bold uppercase tracking-wider text-zinc-900">
              Vibration Record Selection & DSP Evaluation
            </h1>
            <p className="text-xs font-mono text-zinc-500 mt-0.5">
              Select an offline accelerometer dataset from the CWRU benchmark archive or upload your own .mat recording.
            </p>
          </div>
          <div className="text-xs font-mono text-zinc-600 bg-zinc-100 border border-zinc-200 px-3 py-1 self-start sm:self-auto">
            Mode: {isBackendOffline ? 'Offline Stored Dataset' : 'Connected to Express & MATLAB'}
          </div>
        </div>

        {/* Backend Offline Warning Banner */}
        {isBackendOffline && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-300 text-xs font-mono text-amber-900 flex items-start gap-2">
            <span className="font-bold select-none">[NOTICE]:</span>
            <span>
              Backend offline: showing bundled results only. Live upload is disabled until the backend service is started on port 5000.
            </span>
          </div>
        )}
      </div>

      {/* Live Upload Panel */}
      <section className="bg-white border border-zinc-300 p-5 font-mono">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              Analyze Your Own File
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              CWRU drive-end data (SKF 6205). If the file has no RPM variable, enter the speed.
            </p>
          </div>
          <span className="text-[10px] text-zinc-400 uppercase">MATLAB -batch execution</span>
        </div>

        {/* Active Job Progress Panel */}
        {activeJob && (
          <div className="mt-4 p-4 border border-zinc-300 bg-zinc-50 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-zinc-800 uppercase tracking-wide">
                Analysis Job: {activeJob.id}
              </span>
              <span
                className={`px-2 py-0.5 text-[10px] uppercase border ${
                  activeJob.status === 'processing'
                    ? 'bg-blue-50 text-blue-800 border-blue-300 animate-pulse'
                    : activeJob.status === 'done'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : activeJob.status === 'failed'
                    ? 'bg-red-50 text-red-800 border-red-300'
                    : 'bg-zinc-100 text-zinc-700 border-zinc-300'
                }`}
              >
                [{activeJob.status.toUpperCase()}]
              </span>
            </div>

            <div className="text-xs text-zinc-600">
              {activeJob.status === 'queued' && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-zinc-400 border-t-zinc-800 animate-spin" />
                  <span>Queued: Waiting for worker availability...</span>
                </div>
              )}

              {activeJob.status === 'processing' && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-800 font-medium">
                    <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent animate-spin" />
                    <span>Processing: MATLAB is analysing the signal, this can take up to a minute</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 pl-5">
                    Elapsed time: {activeJob.elapsedSec} seconds (filtering 2-5 kHz band, Hilbert envelope, peak detection)
                  </div>
                </div>
              )}

              {activeJob.status === 'done' && (
                <div className="text-emerald-700 font-medium">
                  ✓ Analysis completed successfully. Redirecting to instrument dashboard...
                </div>
              )}

              {activeJob.status === 'failed' && (
                <div className="space-y-2">
                  <div className="text-red-700 font-medium">
                    ✕ Analysis Error: {activeJob.error}
                  </div>
                  <button
                    onClick={() => setActiveJob(null)}
                    className="px-3 py-1 bg-zinc-900 text-white text-xs border border-zinc-900 hover:bg-zinc-800"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload Form */}
        <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (!isBackendOffline) setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (isBackendOffline) return;
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileChange(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => {
              if (!isBackendOffline && fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
            className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
              isBackendOffline
                ? 'bg-zinc-100 border-zinc-300 opacity-60 cursor-not-allowed'
                : isDragging
                ? 'border-zinc-800 bg-zinc-100'
                : selectedFile
                ? 'border-emerald-500 bg-emerald-50/30'
                : 'border-zinc-300 hover:border-zinc-500 bg-zinc-50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".mat"
              disabled={isBackendOffline || Boolean(activeJob && activeJob.status === 'processing')}
              onChange={(e) => handleFileChange(e.target.files[0])}
              className="hidden"
            />
            {selectedFile ? (
              <div className="space-y-1">
                <span className="text-xs font-bold text-zinc-900 block truncate">
                  Selected: {selectedFile.name}
                </span>
                <span className="text-[11px] text-zinc-500 block tabular-nums">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB — Click to choose different file
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-xs text-zinc-700 block">
                  Drag and drop a CWRU <span className="font-bold">.mat</span> file here, or click to browse
                </span>
                <span className="text-[10px] text-zinc-400 block">
                  Maximum file size: 50 MB. Accepts Level 5 or 7.3 MAT-files.
                </span>
              </div>
            )}
          </div>

          {/* Optional Form Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                Motor speed (rpm) <span className="text-zinc-400 font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                min="100"
                max="10000"
                step="1"
                placeholder="Auto-detected from file (e.g. 1797)"
                value={rpmInput}
                disabled={isBackendOffline || Boolean(activeJob && activeJob.status === 'processing')}
                onChange={(e) => setRpmInput(e.target.value)}
                className="w-full text-xs font-mono p-2 border border-zinc-300 bg-white focus:outline-none focus:border-zinc-800 disabled:bg-zinc-100"
              />
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                Leave blank if the .mat file contains an RPM variable.
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                Original sampling rate
              </label>
              <select
                value={fsInput}
                disabled={isBackendOffline || Boolean(activeJob && activeJob.status === 'processing')}
                onChange={(e) => setFsInput(e.target.value)}
                className="w-full text-xs font-mono p-2 border border-zinc-300 bg-white focus:outline-none focus:border-zinc-800 disabled:bg-zinc-100"
              >
                <option value="12000">12,000 Hz (CWRU Drive End standard)</option>
                <option value="48000">48,000 Hz (CWRU Drive End high-rate)</option>
              </select>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                Sampling rate is not stored inside CWRU MAT-files.
              </span>
            </div>
          </div>

          {/* Upload Error Message */}
          {uploadError && (
            <div className="p-2.5 bg-red-50 border border-red-300 text-xs text-red-800">
              {uploadError}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isBackendOffline || !selectedFile || Boolean(activeJob && activeJob.status === 'processing')}
              className={`px-4 py-2 text-xs font-mono font-bold border transition-colors ${
                isBackendOffline || !selectedFile || Boolean(activeJob && activeJob.status === 'processing')
                  ? 'bg-zinc-200 text-zinc-400 border-zinc-300 cursor-not-allowed'
                  : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'
              }`}
            >
              Upload and analyze
            </button>
          </div>
        </form>
      </section>

      {/* Error state for general record fetch */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-300 text-xs font-mono text-red-900">
          <div className="flex items-center gap-2 font-bold mb-1">
            <span className="w-2 h-2 bg-red-600 inline-block" />
            <span>DATA ACCESS ERROR</span>
          </div>
          <p>{error}</p>
        </div>
      )}

      {/* Bundled Records Catalog */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800">
            Bundled Reference Records
          </h2>
          <span className="text-[11px] font-mono text-zinc-500">
            Pre-computed CWRU benchmark files
          </span>
        </div>

        {loading ? (
          <div className="bg-white border border-zinc-300 p-12 text-center font-mono">
            <div className="inline-block w-6 h-6 border-2 border-zinc-300 border-t-zinc-800 animate-spin mb-3" />
            <p className="text-xs text-zinc-600 uppercase tracking-wider">
              Loading record catalog...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bundledRecords.map((rec) => {
              const isSelected = analyzingId === rec.id;
              return (
                <div
                  key={rec.id}
                  className="bg-white border border-zinc-300 p-5 flex flex-col justify-between hover:border-zinc-500 transition-colors font-mono"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-zinc-200">
                      <div>
                        <span className="text-[10px] uppercase text-zinc-400 block tracking-wider">
                          Record ID #{rec.id}
                        </span>
                        <h3 className="text-sm font-bold text-zinc-900">
                          {rec.fileName}
                        </h3>
                      </div>
                      {getConditionBadge(rec.knownCondition)}
                    </div>

                    <div className="py-3 text-xs text-zinc-600 space-y-1">
                      <p>{getConditionDetails(rec.id)}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-200 flex items-center justify-between">
                    <div className="text-[11px] text-zinc-500">
                      Bearing: <span className="text-zinc-800 font-semibold">SKF 6205</span>
                    </div>
                    <button
                      onClick={() => handleSelectRecord(rec.id)}
                      disabled={analyzingId !== null}
                      className={`px-3 py-1.5 text-xs font-semibold border transition-colors ${
                        isSelected
                          ? 'bg-zinc-800 text-white border-zinc-900 cursor-wait'
                          : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'
                      }`}
                    >
                      {isSelected ? 'Loading Analysis...' : 'View Analysis ->'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Uploaded Analyses (if any exist) */}
      {uploadedRecords.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800">
              Recent Uploaded Analyses
            </h2>
            <span className="text-[11px] font-mono text-zinc-500">
              Completed user uploads stored on server ({uploadedRecords.length})
            </span>
          </div>

          <div className="bg-white border border-zinc-300 overflow-x-auto font-mono text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-100 text-zinc-700 border-b border-zinc-300">
                  <th className="py-2.5 px-3 font-semibold uppercase text-[11px]">Upload ID</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-[11px]">Original File</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-[11px]">Status</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-[11px]">Processed At</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-[11px] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {uploadedRecords.map((up) => (
                  <tr key={up.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-zinc-900">{up.id}</td>
                    <td className="py-2.5 px-3 text-zinc-700">{up.fileName}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold uppercase">
                        DONE
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-500 tabular-nums">
                      {up.finishedAt ? new Date(up.finishedAt).toLocaleString() : 'Recent'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        to={`/analyses/${up.id}`}
                        className="inline-block px-2.5 py-1 text-xs bg-zinc-900 text-white border border-zinc-900 hover:bg-zinc-800"
                      >
                        View Analysis &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
