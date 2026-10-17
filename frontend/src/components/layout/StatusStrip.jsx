import React from 'react';
import VerdictBadge from '../evidence/VerdictBadge';
import { formatNumber, formatPct } from '../../utils/formatters';

export default function StatusStrip({ meta = {}, diagnosis = {}, knownCondition = '' }) {
  const verdictLabel = diagnosis.label || 'Uncertain';
  const confidence = diagnosis.confidence;
  
  // Check match against known condition if provided
  let conditionMatch = null;
  if (knownCondition && verdictLabel) {
    const isHealthyKnown = knownCondition.toLowerCase().includes('healthy');
    const isHealthyVerdict = verdictLabel.toLowerCase().includes('healthy');
    const isUncertain = verdictLabel.toLowerCase().includes('uncertain');

    if (isUncertain) {
      conditionMatch = 'indeterminate';
    } else if (
      (isHealthyKnown && isHealthyVerdict) ||
      (!isHealthyKnown && verdictLabel.toLowerCase().includes(knownCondition.toLowerCase()))
    ) {
      conditionMatch = 'match';
    } else {
      conditionMatch = 'mismatch';
    }
  }

  return (
    <section className="bg-white border border-zinc-300 p-4 shadow-none">
      {/* Top row: Verdict & Ground Truth */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-zinc-200">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-mono font-medium text-zinc-500 uppercase tracking-wider">
            DSP Decision:
          </span>
          <VerdictBadge label={verdictLabel} abnormal={diagnosis.abnormal} />

          {knownCondition && (
            <div className="flex items-center gap-2 pl-3 border-l border-zinc-200 text-xs font-mono">
              <span className="text-zinc-500">KNOWN GROUND TRUTH:</span>
              <span className="font-semibold text-zinc-800 bg-zinc-100 px-2 py-0.5 border border-zinc-300">
                {knownCondition}
              </span>
              {conditionMatch === 'match' && (
                <span className="text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 border border-emerald-300">
                  MATCH
                </span>
              )}
              {conditionMatch === 'mismatch' && (
                <span className="text-red-700 font-bold bg-red-50 px-1.5 py-0.5 border border-red-300">
                  MISMATCH
                </span>
              )}
              {conditionMatch === 'indeterminate' && (
                <span className="text-amber-700 font-medium bg-amber-50 px-1.5 py-0.5 border border-amber-300">
                  UNCERTAIN
                </span>
              )}
            </div>
          )}
        </div>

        {/* Evidence score */}
        <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-300 px-3 py-1">
          <span className="text-xs font-mono text-zinc-600 uppercase">Evidence Score:</span>
          <span className="text-sm font-mono font-bold text-zinc-900 tabular-nums">
            {confidence !== null && confidence !== undefined
              ? `${Number(confidence).toFixed(2)} (${(Number(confidence) * 100).toFixed(0)}%)`
              : '—'}
          </span>
        </div>
      </div>

      {/* Bottom row: Instrumentation Parameters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-3 text-xs font-mono">
        <div>
          <span className="block text-zinc-400 uppercase text-[10px] tracking-wider">File Name</span>
          <span className="font-semibold text-zinc-800 truncate block" title={meta.fileName}>
            {meta.fileName || '—'}
          </span>
        </div>

        <div>
          <span className="block text-zinc-400 uppercase text-[10px] tracking-wider">Shaft Speed</span>
          <span className="font-semibold text-zinc-800 tabular-nums">
            {meta.rpm ? `${meta.rpm} rpm` : '—'}
          </span>
          {meta.rpmSource && (
            <span className="text-zinc-500 text-[10px] block">({meta.rpmSource})</span>
          )}
        </div>

        <div>
          <span className="block text-zinc-400 uppercase text-[10px] tracking-wider">Sampling Freq (fs)</span>
          <span className="font-semibold text-zinc-800 tabular-nums">
            {meta.fs ? `${meta.fs.toLocaleString()} Hz` : '—'}
          </span>
        </div>

        <div>
          <span className="block text-zinc-400 uppercase text-[10px] tracking-wider">Duration</span>
          <span className="font-semibold text-zinc-800 tabular-nums">
            {meta.durationSec ? `${meta.durationSec} s` : '—'}
          </span>
        </div>

        <div>
          <span className="block text-zinc-400 uppercase text-[10px] tracking-wider">Segments</span>
          <span className="font-semibold text-zinc-800 tabular-nums">
            {meta.nSegments ? `${meta.nSegments} segments` : '—'}
          </span>
        </div>

        <div>
          <span className="block text-zinc-400 uppercase text-[10px] tracking-wider">Bearing Type</span>
          <span className="font-semibold text-zinc-800 truncate block" title={meta.bearing}>
            {meta.bearing || 'SKF 6205'}
          </span>
        </div>
      </div>
    </section>
  );
}
