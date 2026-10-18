import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getRecords, getAnalysis, BUNDLED_RECORDS } from '../services/api';
import MiniWaveformPreview from '../components/charts/MiniWaveformPreview';

export default function Overview() {
  const navigate = useNavigate();
  const [records, setRecords] = useState(BUNDLED_RECORDS);
  const [isBackendOffline, setIsBackendOffline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getRecords()
      .then(({ records: data, isOffline }) => {
        if (!isMounted) return;
        setRecords(data);
        setIsBackendOffline(Boolean(isOffline));
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(`Failed to retrieve record list: ${err.message}`);
        setIsBackendOffline(true);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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

  // Record metadata configuration for the 4 reference records
  const referenceCardsData = [
    {
      id: '97',
      fileName: '97.mat',
      title: 'Healthy Baseline Operation',
      condition: 'Healthy',
      statusType: 'healthy',
      rpm: '1796 rpm',
      loadHp: '0 HP',
      faultFreq: 'N/A (Normal baseline)',
      strokeColor: '#4ADE80',
      description: 'Baseline normal operation at ~1796 rpm. 0 HP load, intact rolling elements and undamaged inner/outer raceways.',
      icon: (
        <svg className="w-5 h-5 text-[#4ADE80]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      id: '105',
      fileName: '105.mat',
      title: 'Inner Raceway Flaw (BPFI)',
      condition: 'Inner Race Fault',
      statusType: 'fault',
      rpm: '1797 rpm',
      loadHp: '0 HP',
      faultFreq: 'BPFI ≈ 162.2 Hz',
      strokeColor: '#FB7185',
      description: 'Drive-end bearing inner race defect (0.007" depth electro-discharge flaw), motor speed ~1797 rpm with strong shaft sidebands.',
      icon: (
        <svg className="w-5 h-5 text-[#FB7185]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="9" strokeWidth={2} />
          <circle cx="12" cy="12" r="4" strokeWidth={2} strokeDasharray="3 2" />
          <path strokeLinecap="round" strokeWidth={2.5} d="M12 7v2m0 6v2" />
        </svg>
      )
    },
    {
      id: '118',
      fileName: '118.mat',
      title: 'Ball Element Defect (2×BSF)',
      condition: 'Uncertain',
      statusType: 'uncertain',
      rpm: '1797 rpm',
      loadHp: '0 HP',
      faultFreq: '2×BSF ≈ 141.1 Hz',
      strokeColor: '#FBBF24',
      description: 'Drive-end bearing rolling ball defect (0.007" depth). Impact energy disperses across rotational path resulting in low SNR and indeterminate verdict.',
      icon: (
        <svg className="w-5 h-5 text-[#FBBF24]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    {
      id: '130',
      fileName: '130.mat',
      title: 'Outer Raceway Flaw (BPFO)',
      condition: 'Outer Race Fault',
      statusType: 'fault',
      rpm: '1797 rpm',
      loadHp: '0 HP',
      faultFreq: 'BPFO ≈ 107.3 Hz',
      strokeColor: '#E000A8',
      description: 'Drive-end bearing outer race defect centered at 6 o\'clock load zone (0.007" depth). Severe periodic shock impacts with high SNR.',
      icon: (
        <svg className="w-5 h-5 text-[#E000A8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="9" strokeWidth={2} />
          <circle cx="12" cy="12" r="4" strokeWidth={2} />
          <path strokeLinecap="round" strokeWidth={2.5} d="M3 12h3m12 0h3" />
        </svg>
      )
    }
  ];

  const uploadedRecords = records.filter((r) => r.source === 'upload');

  return (
    <div className="space-y-6">
      {/* Hero Welcome / System Status Banner */}
      <section className="bg-gradient-to-r from-[#202027] via-[#202027] to-[#191920] border border-[#353540] rounded-xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#A100FF]/15 via-[#22D3EE]/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-[#A100FF]/20 text-[#22D3EE] border border-[#A100FF]/40">
                DSP INSTRUMENT v1.0
              </span>
              <span className="text-xs font-mono text-[#A5A5B5]">
                CWRU Benchmark Archive
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5F5FA]">
              Bearing Condition Monitoring & DSP Diagnostic Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-[#A5A5B5] max-w-2xl leading-relaxed">
              Offline digital signal processing interface for rolling-element bearing fault detection.
              Evaluates mechanical resonance bandpass filtering, Hilbert envelope demodulation, and kinematic tolerance windows.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <Link
              to="/analyze"
              className="px-4 py-2.5 rounded-lg text-xs font-mono font-semibold text-white bg-gradient-to-r from-[#A100FF] to-[#E000A8] hover:from-[#8e00e0] hover:to-[#c70094] border border-[#A100FF] shadow-[0_0_15px_rgba(161,0,255,0.35)] flex items-center justify-center gap-2 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Analyze New File</span>
            </Link>
            <Link
              to="/methodology"
              className="px-4 py-2.5 rounded-lg text-xs font-mono font-medium text-[#F5F5FA] bg-[#191920] hover:bg-[#282833] border border-[#353540] flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>View Methodology</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Offline notice if backend is unreachable */}
        {isBackendOffline && (
          <div className="mt-4 p-3 rounded-lg bg-[#FBBF24]/10 border border-[#FBBF24]/30 text-xs font-mono text-[#FBBF24] flex items-start gap-2.5">
            <span className="text-base leading-none select-none">⚠</span>
            <div>
              <span className="font-bold uppercase tracking-wider">[BACKEND OFFLINE NOTICE]: </span>
              Displaying pre-computed CWRU bundled records. Offline MATLAB batch uploads are inactive until the backend server is initiated.
            </div>
          </div>
        )}
      </section>

      {/* 4 Summary Metrics Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Records */}
        <div className="bg-[#202027] border border-[#353540] rounded-xl p-4 shadow-md relative overflow-hidden group hover:border-[#A100FF]/50 transition-all">
          <div className="flex items-center justify-between text-[#A5A5B5] mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Total Records</span>
            <div className="w-7 h-7 rounded-lg bg-[#191920] border border-[#353540] flex items-center justify-center text-[#22D3EE]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#F5F5FA]">4</span>
            <span className="text-[11px] font-mono text-[#6E6E82]">Reference files</span>
          </div>
          <div className="text-[11px] text-[#A5A5B5] font-sans mt-1">
            SKF 6205 CWRU baseline dataset
          </div>
        </div>

        {/* Card 2: Healthy Verified */}
        <div className="bg-[#202027] border border-[#353540] rounded-xl p-4 shadow-md relative overflow-hidden group hover:border-[#4ADE80]/50 transition-all">
          <div className="flex items-center justify-between text-[#A5A5B5] mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#4ADE80]">Healthy Normal</span>
            <div className="w-7 h-7 rounded-lg bg-[#4ADE80]/10 border border-[#4ADE80]/30 flex items-center justify-center text-[#4ADE80] shadow-[0_0_10px_rgba(74,222,128,0.2)]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#4ADE80]">1</span>
            <span className="text-[11px] font-mono text-[#6E6E82]">Record (97.mat)</span>
          </div>
          <div className="text-[11px] text-[#A5A5B5] font-sans mt-1">
            No defect harmonics detected
          </div>
        </div>

        {/* Card 3: Faults Detected */}
        <div className="bg-[#202027] border border-[#353540] rounded-xl p-4 shadow-md relative overflow-hidden group hover:border-[#FB7185]/50 transition-all">
          <div className="flex items-center justify-between text-[#A5A5B5] mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#FB7185]">Fault-Labelled</span>
            <div className="w-7 h-7 rounded-lg bg-[#FB7185]/10 border border-[#FB7185]/30 flex items-center justify-center text-[#FB7185] shadow-[0_0_10px_rgba(251,113,133,0.2)]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#FB7185]">2</span>
            <span className="text-[11px] font-mono text-[#6E6E82]">BPFO & BPFI faults</span>
          </div>
          <div className="text-[11px] text-[#A5A5B5] font-sans mt-1">
            105.mat (Inner) & 130.mat (Outer)
          </div>
        </div>

        {/* Card 4: Uncertain Result */}
        <div className="bg-[#202027] border border-[#353540] rounded-xl p-4 shadow-md relative overflow-hidden group hover:border-[#FBBF24]/50 transition-all">
          <div className="flex items-center justify-between text-[#A5A5B5] mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#FBBF24]">Uncertain Record</span>
            <div className="w-7 h-7 rounded-lg bg-[#FBBF24]/10 border border-[#FBBF24]/30 flex items-center justify-center text-[#FBBF24]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#FBBF24]">1</span>
            <span className="text-[11px] font-mono text-[#6E6E82]">Record (118.mat)</span>
          </div>
          <div className="text-[11px] text-[#A5A5B5] font-sans mt-1">
            Low ball impact SNR below 0.30
          </div>
        </div>
      </section>

      {/* Error state if record fetch fails */}
      {error && (
        <div className="p-4 rounded-xl bg-[#FB7185]/10 border border-[#FB7185]/40 text-xs font-mono text-[#FB7185]">
          <span className="font-bold uppercase tracking-wider">[ERROR]: </span>
          {error}
        </div>
      )}

      {/* Bundled Reference Records Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#353540]">
          <div>
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[#F5F5FA] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22D3EE] animate-pulse"></span>
              Bundled Reference Records
            </h2>
            <p className="text-xs text-[#A5A5B5] font-sans">
              4 pre-computed CWRU benchmark test cases with distinct physical fault conditions
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#6E6E82] self-start sm:self-auto">
            Bearing: SKF 6205 | fs = 12,000 Hz
          </span>
        </div>

        {loading ? (
          <div className="bg-[#202027] border border-[#353540] rounded-xl p-12 text-center font-mono">
            <div className="inline-block w-8 h-8 border-2 border-[#353540] border-t-[#22D3EE] rounded-full animate-spin mb-3" />
            <p className="text-xs text-[#A5A5B5] uppercase tracking-wider">
              Loading benchmark catalog...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {referenceCardsData.map((rec) => {
              const isSelected = analyzingId === rec.id;

              return (
                <div
                  key={rec.id}
                  className="bg-[#202027] border border-[#353540] hover:border-[#A100FF]/60 rounded-xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-[0_0_20px_rgba(161,0,255,0.2)] group"
                >
                  <div className="space-y-3">
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#353540]">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#191920] border border-[#353540] flex items-center justify-center shrink-0 group-hover:border-[#A100FF]/50 transition-colors">
                          {rec.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6E6E82]">
                              ID #{rec.id}
                            </span>
                            <span className="text-xs font-mono font-bold text-[#22D3EE]">
                              {rec.fileName}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-[#F5F5FA] font-sans tracking-tight">
                            {rec.title}
                          </h3>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`px-2.5 py-1 text-[11px] font-mono font-bold uppercase rounded-md border shrink-0 ${
                          rec.statusType === 'healthy'
                            ? 'bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/30 shadow-[0_0_10px_rgba(74,222,128,0.2)]'
                            : rec.statusType === 'fault'
                            ? 'bg-[#FB7185]/10 text-[#FB7185] border-[#FB7185]/30 shadow-[0_0_10px_rgba(251,113,133,0.2)]'
                            : 'bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/30'
                        }`}
                      >
                        {rec.condition}
                      </span>
                    </div>

                    {/* Metadata strip */}
                    <div className="grid grid-cols-3 gap-2 text-xs font-mono py-1">
                      <div className="p-2 rounded bg-[#191920] border border-[#353540]/60">
                        <span className="text-[10px] text-[#6E6E82] uppercase block">Motor Speed</span>
                        <span className="text-[#F5F5FA] font-semibold">{rec.rpm}</span>
                      </div>
                      <div className="p-2 rounded bg-[#191920] border border-[#353540]/60">
                        <span className="text-[10px] text-[#6E6E82] uppercase block">Fault Freq</span>
                        <span className="text-[#22D3EE] font-semibold truncate block">{rec.faultFreq}</span>
                      </div>
                      <div className="p-2 rounded bg-[#191920] border border-[#353540]/60">
                        <span className="text-[10px] text-[#6E6E82] uppercase block">Bearing</span>
                        <span className="text-[#A100FF] font-semibold">SKF 6205</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[#A5A5B5] leading-relaxed font-sans">
                      {rec.description}
                    </p>

                    {/* Genuine Downsampled Waveform Preview */}
                    <div className="pt-1">
                      <MiniWaveformPreview recordId={rec.id} strokeColor={rec.strokeColor} height={52} />
                    </div>
                  </div>

                  {/* Card Footer: Action */}
                  <div className="pt-4 mt-3 border-t border-[#353540] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#6E6E82]">
                      12,000 samples/sec
                    </span>

                    <button
                      onClick={() => handleSelectRecord(rec.id)}
                      disabled={analyzingId !== null}
                      className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-[#191920] text-[#A5A5B5] border border-[#353540] cursor-wait'
                          : 'bg-gradient-to-r from-[#A100FF] to-[#E000A8] hover:from-[#8e00e0] hover:to-[#c70094] text-white border border-[#A100FF] shadow-[0_0_15px_rgba(161,0,255,0.3)] hover:shadow-[0_0_20px_rgba(224,0,168,0.5)]'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Opening Analysis...</span>
                        </>
                      ) : (
                        <>
                          <span>View Scientific Analysis</span>
                          <span>&rarr;</span>
                        </>
                      )}
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
        <section className="space-y-3 pt-4">
          <div className="flex items-center justify-between border-b border-[#353540] pb-2">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F5F5FA]">
              Recent Uploaded Analyses
            </h2>
            <span className="text-[11px] font-mono text-[#A5A5B5]">
              Server analyses ({uploadedRecords.length})
            </span>
          </div>

          <div className="bg-[#202027] border border-[#353540] rounded-xl overflow-hidden font-mono text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#191920] text-[#A5A5B5] border-b border-[#353540]">
                  <th className="py-3 px-4 font-semibold uppercase text-[11px]">Upload ID</th>
                  <th className="py-3 px-4 font-semibold uppercase text-[11px]">Original File</th>
                  <th className="py-3 px-4 font-semibold uppercase text-[11px]">Status</th>
                  <th className="py-3 px-4 font-semibold uppercase text-[11px]">Processed At</th>
                  <th className="py-3 px-4 font-semibold uppercase text-[11px] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#353540]">
                {uploadedRecords.map((up) => (
                  <tr key={up.id} className="hover:bg-[#282833] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#F5F5FA]">{up.id}</td>
                    <td className="py-3 px-4 text-[#22D3EE]">{up.fileName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-[10px] bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/30 rounded font-bold uppercase">
                        DONE
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#A5A5B5] tabular-nums">
                      {up.finishedAt ? new Date(up.finishedAt).toLocaleString() : 'Recent'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/analyses/${up.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded bg-[#A100FF] hover:bg-[#8e00e0] text-white font-medium border border-[#A100FF] transition-all"
                      >
                        View &rarr;
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
