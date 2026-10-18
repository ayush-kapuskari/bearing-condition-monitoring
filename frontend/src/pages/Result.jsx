import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnalysis, BUNDLED_RECORDS } from '../services/api';
import StatusStrip from '../components/layout/StatusStrip';
import EnvelopeChart from '../components/charts/EnvelopeChart';
import EvidenceTable from '../components/evidence/EvidenceTable';
import ScoreBars from '../components/charts/ScoreBars';
import SimpleLineChart from '../components/charts/SimpleLineChart';
import SpectrogramChart from '../components/charts/SpectrogramChart';
import TimeFeaturesTable from '../components/evidence/TimeFeaturesTable';

export default function Result() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Available diagnostic views: 'timeSignal' | 'fft' | 'psd' | 'stft' | 'timeFeatures'
  const [activeTab, setActiveTab] = useState('timeSignal');

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
      <div className="py-16 flex flex-col items-center justify-center">
        <div className="bg-[#202027] border border-[#353540] rounded-xl p-10 text-center font-mono max-w-md w-full shadow-2xl space-y-4">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-[#A100FF]/20 animate-ping" />
            <div className="w-12 h-12 rounded-full border-2 border-[#353540] border-t-[#22D3EE] animate-spin" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F5F5FA] uppercase tracking-wider">
              Retrieving Analysis Workspace
            </h3>
            <p className="text-xs text-[#A5A5B5] mt-1">
              Loading demodulated spectra & kinematic matrices for Record #{id}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-12 space-y-4 font-mono max-w-xl mx-auto">
        <div className="p-5 rounded-xl bg-[#FB7185]/10 border border-[#FB7185]/40 text-xs text-[#FB7185] space-y-2">
          <div className="font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FB7185]" />
            <span>ANALYSIS DATA UNAVAILABLE</span>
          </div>
          <p className="text-[#A5A5B5] leading-relaxed">
            {error || 'The requested analysis record does not exist or has not been computed.'}
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#202027] hover:bg-[#282833] text-[#F5F5FA] text-xs font-mono border border-[#353540] transition-colors"
        >
          &larr; Return to Overview Dashboard
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
    psd = {},
    stft = {},
    timeFeatures = {}
  } = data;

  const hasPsd = Boolean(psd.f && psd.f.length);
  const hasStft = Boolean(stft.magDb && stft.magDb.length);

  const tabs = [
    { id: 'timeSignal', label: 'Time Signal', badge: 'Waveform' },
    { id: 'fft', label: 'Plain FFT', badge: 'Spectrum' },
    ...(hasPsd ? [{ id: 'psd', label: 'Welch PSD', badge: 'Power Density' }] : []),
    ...(hasStft ? [{ id: 'stft', label: 'STFT Spectrogram', badge: '2D Heatmap' }] : []),
    { id: 'timeFeatures', label: 'Time Features', badge: 'Statistics' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Quick Switch Bar */}
      <div className="bg-[#202027] border border-[#353540] rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-md">
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="text-[#A5A5B5] hover:text-[#22D3EE] transition-colors flex items-center gap-1"
          >
            <span>&larr;</span>
            <span>Dashboard</span>
          </Link>
          <span className="text-[#353540]">/</span>
          <span className="text-[#F5F5FA] font-semibold">
            Analysis Report: <span className="text-[#22D3EE]">{meta.fileName || `${id}.mat`}</span>
          </span>
        </div>

        {/* Quick Record Switcher */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#6E6E82] text-[11px] mr-1 hidden sm:inline">Compare:</span>
          {BUNDLED_RECORDS.map((r) => (
            <Link
              key={r.id}
              to={`/analyses/${r.id}`}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                String(r.id) === String(id)
                  ? 'bg-gradient-to-r from-[#A100FF] to-[#E000A8] text-white font-bold shadow-[0_0_10px_rgba(161,0,255,0.4)] border border-[#A100FF]'
                  : 'bg-[#191920] text-[#A5A5B5] hover:text-[#F5F5FA] border border-[#353540] hover:border-[#A100FF]/50'
              }`}
            >
              #{r.id}
            </Link>
          ))}
        </div>
      </div>

      {/* 1. Status Strip Banner: Verdict, Ground Truth, Evidence Score (Strict Non-Percentage), Parameters */}
      <StatusStrip
        meta={meta}
        diagnosis={diagnosis}
        knownCondition={knownCondition}
      />

      {/* 2. Primary Scientific Plot: Demodulated Envelope Spectrum with BPFO, BPFI, 2xBSF markers */}
      <EnvelopeChart
        envelope={envelope}
        theory={theory}
        evidence={evidence}
      />

      {/* 3. Supporting Signal Diagnostics Workspace (Tabs: Time Waveform, Plain FFT, Welch PSD, STFT, Features) */}
      <section className="bg-[#202027] border border-[#353540] rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#353540]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#A100FF] animate-pulse"></span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#22D3EE]">
                Auxiliary Signal Views
              </span>
            </div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#F5F5FA]">
              Supporting Signal Visualisations & Diagnostics
            </h3>
            <p className="text-xs text-[#A5A5B5] mt-0.5">
              Inspect time-domain vibration waveform, raw FFT, Welch PSD, time-frequency STFT, and moments
            </p>
          </div>

          {/* Diagnostic Tabs */}
          <div className="flex flex-wrap gap-1.5 self-start sm:self-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#A100FF] to-[#E000A8] text-white font-bold border border-[#A100FF] shadow-[0_0_12px_rgba(161,0,255,0.35)]'
                    : 'bg-[#191920] text-[#A5A5B5] hover:text-[#F5F5FA] border border-[#353540] hover:bg-[#282833]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab View Contents */}
        <div className="pt-1">
          {/* View 1: Time Domain Vibration Waveform */}
          {activeTab === 'timeSignal' && (
            <div className="space-y-2">
              <div className="text-xs font-mono text-[#A5A5B5]">
                Raw accelerated vibration waveform excerpt &bull; t = 0 to {(signal.t?.[signal.t.length - 1] || 0.05).toFixed(3)} s &bull; 12,000 samples/sec
              </div>
              <SimpleLineChart
                x={signal.t || []}
                y={signal.x || []}
                xTitle="Time (s)"
                yTitle="Vibration Acceleration (m/s²)"
                lineColor="#22D3EE"
                hoverTemplate="Time: %{x:.4f} s<br>Acceleration: %{y:.3f} m/s²<extra></extra>"
                caption="Time-domain vibration shows overall energy and impact spikes. Note how defect shocks become increasingly impulsive for inner/outer race flaws."
              />
            </div>
          )}

          {/* View 2: Plain FFT Magnitude Spectrum */}
          {activeTab === 'fft' && (
            <div className="space-y-2">
              <div className="text-xs font-mono text-[#A5A5B5]">
                Direct Fast Fourier Transform (FFT) of the raw unprocessed vibration signal (0 to 6,000 Hz)
              </div>
              <SimpleLineChart
                x={fft.f || []}
                y={fft.amp || []}
                xTitle="Frequency (Hz)"
                yTitle="Spectral Amplitude"
                lineColor="#38BDF8"
                hoverTemplate="Frequency: %{x:.1f} Hz<br>Amplitude: %{y:.4f}<extra></extra>"
                caption="The plain FFT is dominated by low-frequency shaft harmonics and high-frequency structural resonances. Bearing fault frequencies (BPFO, BPFI) are buried in background noise without envelope demodulation."
              />
            </div>
          )}

          {/* View 3: Welch Power Spectral Density (PSD) */}
          {activeTab === 'psd' && hasPsd && (
            <div className="space-y-2">
              <div className="text-xs font-mono text-[#A5A5B5]">
                Welch's Averaged Power Spectral Density (PSD) &bull; Logarithmic Power Scale (dB/Hz)
              </div>
              <SimpleLineChart
                x={psd.f || []}
                y={psd.pxxDb || []}
                xTitle="Frequency (Hz)"
                yTitle="Power Spectral Density (dB/Hz)"
                lineColor="#A100FF"
                hoverTemplate="Frequency: %{x:.1f} Hz<br>PSD: %{y:.2f} dB/Hz<extra></extra>"
                caption="Welch PSD computes the distribution of vibration power over frequency using windowed segment averaging to suppress variance."
              />
            </div>
          )}

          {/* View 4: Short-Time Fourier Transform (STFT Spectrogram) */}
          {activeTab === 'stft' && hasStft && (
            <div className="space-y-2">
              <div className="text-xs font-mono text-[#A5A5B5]">
                Short-Time Fourier Transform (STFT) 2D Spectrogram &bull; Frequency vs Time vs Power (dB)
              </div>
              <SpectrogramChart stft={stft} />
            </div>
          )}

          {/* View 5: Statistical Time Features */}
          {activeTab === 'timeFeatures' && (
            <TimeFeaturesTable timeFeatures={timeFeatures} />
          )}
        </div>
      </section>

      {/* 4. Automated Harmonic Peak Detection Evidence Table */}
      <EvidenceTable evidence={evidence} />

      {/* 5. DSP Decision Rationale & Fault Family Evidence Meters */}
      <ScoreBars
        scores={scores}
        diagnosis={diagnosis}
      />
    </div>
  );
}
