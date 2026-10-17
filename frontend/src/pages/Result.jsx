import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnalysis, BUNDLED_RECORDS } from '../services/api';
import StatusStrip from '../components/layout/StatusStrip';
import EnvelopeChart from '../components/charts/EnvelopeChart';
import EvidenceTable from '../components/evidence/EvidenceTable';
import ScoreBars from '../components/charts/ScoreBars';
import SimpleLineChart from '../components/charts/SimpleLineChart';
import TimeFeaturesTable from '../components/evidence/TimeFeaturesTable';

export default function Result() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('timeSignal'); // 'timeSignal' | 'fft' | 'timeFeatures'

  // Look up known condition from the bundled record catalog
  const recordInfo = BUNDLED_RECORDS.find((r) => String(r.id) === String(id));
  const knownCondition = recordInfo ? recordInfo.knownCondition : '';

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getAnalysis(id)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || `Failed to load analysis for record ${id}`);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border border-zinc-300 p-12 text-center font-mono">
          <div className="inline-block w-6 h-6 border-2 border-zinc-300 border-t-zinc-800 animate-spin mb-3" />
          <p className="text-xs text-zinc-600 uppercase tracking-wider">
            Loading analysis data for Record #{id}...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4 font-mono">
        <div className="p-4 bg-red-50 border border-red-300 text-xs text-red-900">
          <div className="font-bold flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-red-600 inline-block" />
            <span>ANALYSIS DATA UNAVAILABLE</span>
          </div>
          <p>{error || 'The requested analysis record does not exist.'}</p>
        </div>

        <Link
          to="/"
          className="inline-block px-3 py-1.5 bg-zinc-900 text-white text-xs border border-zinc-900 hover:bg-zinc-800"
        >
          &larr; Return to Record Selection
        </Link>
      </div>
    );
  }

  const {
    meta = {},
    diagnosis = {},
    envelope = {},
    theory = {},
    evidence = [],
    scores = {},
    signal = {},
    fft = {},
    timeFeatures = {}
  } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Navigation breadcrumb & Record Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="text-zinc-500 hover:text-zinc-900 underline underline-offset-2"
          >
            &larr; Record List
          </Link>
          <span className="text-zinc-300">/</span>
          <span className="font-semibold text-zinc-800">
            Analysis Report: Record {id} ({meta.fileName || `${id}.mat`})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500">Quick Switch:</span>
          {BUNDLED_RECORDS.map((r) => (
            <Link
              key={r.id}
              to={`/analyses/${r.id}`}
              className={`px-2 py-0.5 border text-[11px] ${
                String(r.id) === String(id)
                  ? 'bg-zinc-900 text-white border-zinc-900 font-bold'
                  : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100'
              }`}
            >
              {r.id}
            </Link>
          ))}
        </div>
      </div>

      {/* a. Status Strip */}
      <StatusStrip
        meta={meta}
        diagnosis={diagnosis}
        knownCondition={knownCondition}
      />

      {/* b. Main Plot: Envelope Spectrum */}
      <EnvelopeChart
        envelope={envelope}
        theory={theory}
        evidence={evidence}
      />

      {/* c. Evidence Table */}
      <EvidenceTable evidence={evidence} />

      {/* d. Score Bars & Reasons List */}
      <ScoreBars
        scores={scores}
        diagnosis={diagnosis}
      />

      {/* e. Tabs for Supporting Views */}
      <section className="bg-white border border-zinc-300 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800">
              Supporting Signal Diagnostics
            </h3>
            <p className="text-[11px] font-mono text-zinc-500">
              Raw time domain excerpt, plain frequency spectrum, and statistical features
            </p>
          </div>

          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('timeSignal')}
              className={`px-3 py-1 text-xs font-mono border transition-colors ${
                activeTab === 'timeSignal'
                  ? 'bg-zinc-900 text-white border-zinc-900 font-semibold'
                  : 'bg-zinc-50 text-zinc-700 border-zinc-300 hover:bg-zinc-100'
              }`}
            >
              Time Signal
            </button>
            <button
              onClick={() => setActiveTab('fft')}
              className={`px-3 py-1 text-xs font-mono border transition-colors ${
                activeTab === 'fft'
                  ? 'bg-zinc-900 text-white border-zinc-900 font-semibold'
                  : 'bg-zinc-50 text-zinc-700 border-zinc-300 hover:bg-zinc-100'
              }`}
            >
              Plain FFT
            </button>
            <button
              onClick={() => setActiveTab('timeFeatures')}
              className={`px-3 py-1 text-xs font-mono border transition-colors ${
                activeTab === 'timeFeatures'
                  ? 'bg-zinc-900 text-white border-zinc-900 font-semibold'
                  : 'bg-zinc-50 text-zinc-700 border-zinc-300 hover:bg-zinc-100'
              }`}
            >
              Time Features
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="mt-4">
          {activeTab === 'timeSignal' && (
            <div>
              <div className="text-[11px] font-mono text-zinc-500 mb-2">
                Accelerated vibration waveform excerpt (t = 0 to {(signal.t?.[signal.t.length - 1] || 0.05).toFixed(3)} s)
              </div>
              <SimpleLineChart
                x={signal.t || []}
                y={signal.x || []}
                xTitle="Time (s)"
                yTitle="Vibration Acceleration (m/s²)"
                lineColor="#0284c7"
                hoverTemplate="Time: %{x:.4f} s<br>Acceleration: %{y:.3f} m/s²<extra></extra>"
              />
            </div>
          )}

          {activeTab === 'fft' && (
            <div>
              <div className="text-[11px] font-mono text-zinc-500 mb-2">
                Direct Fast Fourier Transform (FFT) of the raw unprocessed vibration signal
              </div>
              <SimpleLineChart
                x={fft.f || []}
                y={fft.amp || []}
                xTitle="Frequency (Hz)"
                yTitle="Spectral Amplitude"
                lineColor="#4f46e5"
                caption="The plain FFT does not clearly show the fault frequencies. The envelope spectrum does."
                hoverTemplate="Frequency: %{x:.1f} Hz<br>Amplitude: %{y:.4f}<extra></extra>"
              />
            </div>
          )}

          {activeTab === 'timeFeatures' && (
            <TimeFeaturesTable timeFeatures={timeFeatures} />
          )}
        </div>
      </section>
    </div>
  );
}
