import React from 'react';
import { normalizeReasons } from '../../utils/formatters';

export default function ScoreBars({ scores = {}, diagnosis = {} }) {
  const outerScore = typeof scores.outer === 'number' ? scores.outer : 0;
  const innerScore = typeof scores.inner === 'number' ? scores.inner : 0;
  const ballScore = typeof scores.ball === 'number' ? scores.ball : 0;

  const threshold = 0.30;
  const thresholdPct = threshold * 100; // 30%

  const families = [
    {
      id: 'outer',
      label: 'Outer Race Evidence',
      sublabel: 'BPFO harmonics & envelope peak match',
      score: outerScore,
      barGradient: 'from-[#E000A8] to-[#ff3bb7]',
      color: '#E000A8'
    },
    {
      id: 'inner',
      label: 'Inner Race Evidence',
      sublabel: 'BPFI harmonics & envelope peak match',
      score: innerScore,
      barGradient: 'from-[#22D3EE] to-[#38BDF8]',
      color: '#22D3EE'
    },
    {
      id: 'ball',
      label: 'Ball Defect Evidence',
      sublabel: '2×BSF harmonics & envelope peak match',
      score: ballScore,
      barGradient: 'from-[#A100FF] to-[#c147ff]',
      color: '#A100FF'
    }
  ];

  const reasonsList = normalizeReasons(diagnosis.reasons);
  const isAbnormalKurtosis = Number(diagnosis.kurtosis) > 3.5;

  return (
    <div className="bg-[#202027] border border-[#353540] rounded-xl p-5 shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Evidence Score Bars */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#353540]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#A100FF] animate-pulse"></span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#A100FF]">
                  Decision Metric
                </span>
              </div>
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#F5F5FA]">
                Fault Family Evidence Scores
              </h3>
              <p className="text-xs text-[#A5A5B5] mt-0.5">
                Normalized score metric (0.00 to 1.00) vs Decision Threshold (0.30)
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono text-[#F5F5FA] bg-[#191920] border border-[#353540] px-2.5 py-1 rounded-md font-semibold">
                Threshold: <span className="text-[#22D3EE]">{threshold.toFixed(2)}</span>
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            {families.map((fam) => {
              const scorePct = Math.min(100, Math.max(0, fam.score * 100));
              const exceeds = fam.score >= threshold;

              return (
                <div key={fam.id} className="font-mono bg-[#191920] p-3 rounded-lg border border-[#353540]/60 space-y-2">
                  <div className="flex justify-between items-baseline text-xs">
                    <div>
                      <span className="font-bold text-[#F5F5FA] block">{fam.label}</span>
                      <span className="text-[10px] text-[#6E6E82]">{fam.sublabel}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                        exceeds
                          ? 'bg-[#FB7185]/15 text-[#FB7185] border-[#FB7185]/40 shadow-[0_0_8px_rgba(251,113,133,0.2)]'
                          : 'bg-[#202027] text-[#6E6E82] border-[#353540]'
                      }`}>
                        {exceeds ? 'EXCEEDS THRESHOLD' : 'BELOW THRESHOLD'}
                      </span>
                      <span className="font-bold tabular-nums text-[#F5F5FA] text-sm min-w-12 text-right">
                        {fam.score.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Meter Track with threshold marker */}
                  <div className="relative h-4 bg-[#111116] rounded-full border border-[#353540] w-full overflow-hidden">
                    {/* Score Fill */}
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        exceeds
                          ? `bg-gradient-to-r ${fam.barGradient}`
                          : 'bg-[#353540]'
                      }`}
                      style={{ 
                        width: `${scorePct}%`,
                        boxShadow: exceeds ? `0 0 12px ${fam.color}` : 'none'
                      }}
                    />

                    {/* Decision Threshold Line at 30% */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_4px_#fff] z-10"
                      style={{ left: `${thresholdPct}%` }}
                      title="Decision Threshold = 0.30"
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-[#6E6E82] pt-0.5">
                    <span>0.00 (No evidence)</span>
                    <span className="text-[#22D3EE] font-bold" style={{ marginLeft: '-15px' }}>
                      | 0.30 Threshold
                    </span>
                    <span>1.00 (Max)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Diagnostic Reasons Log & Kurtosis */}
        <div className="lg:border-l lg:border-[#353540] lg:pl-6 space-y-4">
          <div className="pb-3 border-b border-[#353540]">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#22D3EE] animate-pulse"></span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#22D3EE]">
                Deterministic Rule Log
              </span>
            </div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#F5F5FA]">
              DSP Decision Rationale
            </h3>
            <p className="text-xs text-[#A5A5B5] mt-0.5">
              Rule evaluation log based on kinematic spectral evidence and signal kurtosis
            </p>
          </div>

          <div className="space-y-3">
            {reasonsList.length === 0 ? (
              <p className="text-xs font-mono text-[#6E6E82] italic py-4">
                No specific decision criteria logged for this record.
              </p>
            ) : (
              <ul className="space-y-2.5 text-xs font-mono">
                {reasonsList.map((reason, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 bg-[#191920] border border-[#353540] rounded-lg p-3 text-[#F5F5FA]"
                  >
                    <span className="text-[#22D3EE] font-bold select-none shrink-0">[{idx + 1}]</span>
                    <span className="leading-relaxed">{reason}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Kurtosis metric indicator */}
            {diagnosis.kurtosis !== undefined && diagnosis.kurtosis !== null && (
              <div className="mt-4 p-3.5 rounded-lg bg-[#191920] border border-[#353540] text-xs font-mono space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#A5A5B5] uppercase text-[10px] tracking-wider">
                    Signal Kurtosis Metric
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    isAbnormalKurtosis
                      ? 'bg-[#FB7185]/15 text-[#FB7185] border-[#FB7185]/40'
                      : 'bg-[#4ADE80]/15 text-[#4ADE80] border-[#4ADE80]/40'
                  }`}>
                    {isAbnormalKurtosis ? 'IMPULSIVE / ELEVATED (> 3.5)' : 'NORMAL GAUSSIAN (~3.0)'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-[#F5F5FA] tabular-nums">
                    {Number(diagnosis.kurtosis).toFixed(3)}
                  </span>
                  <span className="text-[11px] text-[#6E6E82]">
                    (Healthy undamaged bearing signals exhibit Gaussian kurtosis ~3.0)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
