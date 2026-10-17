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
      barColor: outerScore >= threshold ? 'bg-red-600' : 'bg-zinc-400'
    },
    {
      id: 'inner',
      label: 'Inner Race Evidence',
      sublabel: 'BPFI harmonics & envelope peak match',
      score: innerScore,
      barColor: innerScore >= threshold ? 'bg-red-600' : 'bg-zinc-400'
    },
    {
      id: 'ball',
      label: 'Ball Defect Evidence',
      sublabel: '2xBSF harmonics & envelope peak match',
      score: ballScore,
      barColor: ballScore >= threshold ? 'bg-red-600' : 'bg-zinc-400'
    }
  ];

  const reasonsList = normalizeReasons(diagnosis.reasons);

  return (
    <div className="bg-white border border-zinc-300 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Evidence Score Bars */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800">
                Fault Family Evidence Scores
              </h3>
              <p className="text-[11px] font-mono text-zinc-500">
                Normalized evidence score (0.00 to 1.00) vs Decision Threshold (0.30)
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono text-zinc-600 bg-zinc-100 border border-zinc-300 px-2 py-0.5 font-semibold">
                Threshold: {threshold.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-4 mt-4">
            {families.map((fam) => {
              const scorePct = Math.min(100, Math.max(0, fam.score * 100));
              const exceeds = fam.score >= threshold;

              return (
                <div key={fam.id} className="font-mono">
                  <div className="flex justify-between items-baseline text-xs mb-1">
                    <span className="font-semibold text-zinc-800">{fam.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.2 border ${
                        exceeds
                          ? 'bg-red-50 text-red-700 border-red-300 font-bold'
                          : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                      }`}>
                        {exceeds ? 'EXCEEDS THRESHOLD' : 'BELOW THRESHOLD'}
                      </span>
                      <span className="font-bold tabular-nums text-zinc-900 w-12 text-right">
                        {fam.score.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Meter Track with threshold marker */}
                  <div className="relative h-5 bg-zinc-100 border border-zinc-300 w-full overflow-hidden">
                    {/* Score Fill */}
                    <div
                      className={`h-full transition-all duration-300 ${fam.barColor}`}
                      style={{ width: `${scorePct}%` }}
                    />

                    {/* Decision Threshold Line at 30% */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-zinc-900 z-10"
                      style={{ left: `${thresholdPct}%` }}
                      title="Decision Threshold = 0.30"
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-zinc-400 mt-0.5">
                    <span>0.00</span>
                    <span className="text-zinc-600 font-semibold" style={{ marginLeft: '-10px' }}>
                      | 0.30
                    </span>
                    <span>1.00</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Diagnostic Reasons */}
        <div className="lg:border-l lg:border-zinc-200 lg:pl-6">
          <div className="pb-3 border-b border-zinc-200">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800">
              DSP Decision Rationale
            </h3>
            <p className="text-[11px] font-mono text-zinc-500">
              Deterministic rule evaluation log based on spectral evidence and signal kurtosis
            </p>
          </div>

          <div className="mt-4">
            {reasonsList.length === 0 ? (
              <p className="text-xs font-mono text-zinc-500 italic py-2">
                No specific decision criteria logged.
              </p>
            ) : (
              <ul className="space-y-2 text-xs font-mono">
                {reasonsList.map((reason, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 bg-zinc-50 border border-zinc-200 p-2 text-zinc-800"
                  >
                    <span className="text-zinc-400 font-mono select-none">[{idx + 1}]</span>
                    <span className="leading-relaxed">{reason}</span>
                  </li>
                ))}
              </ul>
            )}

            {diagnosis.kurtosis !== undefined && diagnosis.kurtosis !== null && (
              <div className="mt-3 text-[11px] font-mono text-zinc-500 bg-zinc-100 p-2 border border-zinc-200 flex justify-between items-center">
                <span>Kurtosis metric:</span>
                <span className="font-semibold text-zinc-800 tabular-nums">
                  {Number(diagnosis.kurtosis).toFixed(3)}
                  {Number(diagnosis.kurtosis) > 3.5 ? ' (Impulsive / Abnormal)' : ' (Normal Gaussian baseline ~3.0)'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
