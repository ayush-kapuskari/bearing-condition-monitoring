import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecords, getAnalysis } from '../services/api';

export default function Analyze() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getRecords()
      .then((data) => {
        if (isMounted) {
          setRecords(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(`Failed to retrieve record list: ${err.message}`);
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectRecord = async (recordId) => {
    setError(null);
    setAnalyzingId(recordId);

    try {
      // Test fetching the analysis before navigating
      await getAnalysis(recordId);
      navigate(`/analyses/${recordId}`);
    } catch (err) {
      setError(`Record ${recordId} analysis could not be loaded: ${err.message}`);
      setAnalyzingId(null);
    }
  };

  const getConditionBadge = (condition) => {
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
        return 'Drive-end accelerometer vibration record from CWRU experimental test rig.';
    }
  };

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
              Select an offline accelerometer dataset from the Case Western Reserve University (CWRU) benchmark archive.
            </p>
          </div>
          <div className="text-xs font-mono text-zinc-600 bg-zinc-100 border border-zinc-200 px-3 py-1 self-start sm:self-auto">
            Mode: Offline Stored Dataset
          </div>
        </div>

        {/* Mandatory Pipeline Note */}
        <div className="mt-4 p-3 bg-zinc-50 border border-zinc-300 text-xs font-mono text-zinc-700 flex items-start gap-2">
          <span className="font-bold text-zinc-900 select-none">[NOTICE]:</span>
          <span>
            Results were computed in advance by the MATLAB pipeline. Live upload is available only in the local MATLAB version.
          </span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-300 text-xs font-mono text-red-900">
          <div className="flex items-center gap-2 font-bold mb-1">
            <span className="w-2 h-2 bg-red-600 inline-block" />
            <span>DATA ACCESS ERROR</span>
          </div>
          <p>{error}</p>
          <div className="mt-2 text-[11px] text-red-700">
            Note: For this evaluation run, record <strong>130 (Outer Race)</strong> is pre-bundled in <code className="bg-red-100 px-1 py-0.5">frontend/public/sample_results/130.json</code>.
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="bg-white border border-zinc-300 p-12 text-center">
          <div className="inline-block w-6 h-6 border-2 border-zinc-300 border-t-zinc-800 animate-spin mb-3" />
          <p className="text-xs font-mono text-zinc-600 uppercase tracking-wider">
            Loading record catalog...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {records.map((rec) => {
            const isSelected = analyzingId === rec.id;
            return (
              <div
                key={rec.id}
                className="bg-white border border-zinc-300 p-5 flex flex-col justify-between hover:border-zinc-500 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-zinc-200">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block tracking-wider">
                        Record ID #{rec.id}
                      </span>
                      <h2 className="text-sm font-mono font-bold text-zinc-900">
                        {rec.fileName}
                      </h2>
                    </div>
                    {getConditionBadge(rec.knownCondition)}
                  </div>

                  <div className="py-3 text-xs font-mono text-zinc-600 space-y-1">
                    <p>{getConditionDetails(rec.id)}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-200 flex items-center justify-between">
                  <div className="text-[11px] font-mono text-zinc-500">
                    Bearing: <span className="text-zinc-800 font-semibold">SKF 6205</span>
                  </div>
                  <button
                    onClick={() => handleSelectRecord(rec.id)}
                    disabled={analyzingId !== null}
                    className={`px-3 py-1.5 text-xs font-mono font-semibold border transition-colors ${
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
    </div>
  );
}
