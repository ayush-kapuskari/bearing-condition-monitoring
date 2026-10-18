import React from 'react';
import VerdictBadge from '../evidence/VerdictBadge';

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
    <section className="bg-[#202027] border border-[#353540] rounded-xl p-5 shadow-lg relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-96 h-28 bg-gradient-to-l from-[#A100FF]/10 via-[#22D3EE]/5 to-transparent pointer-events-none rounded-tr-xl" />

      {/* Top row: Verdict & Ground Truth */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#353540] relative z-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#A5A5B5]">
            Diagnostic Verdict:
          </span>
          <VerdictBadge label={verdictLabel} abnormal={diagnosis.abnormal} />

          {knownCondition ? (
            <div className="flex items-center gap-2 pl-3 border-l border-[#353540] text-xs font-mono">
              <span className="text-[#6E6E82] uppercase text-[10px]">Ground Truth:</span>
              <span className="font-semibold text-[#F5F5FA] bg-[#191920] px-2 py-0.5 rounded border border-[#353540]">
                {knownCondition}
              </span>
              {conditionMatch === 'match' && (
                <span className="text-[#4ADE80] font-bold bg-[#4ADE80]/10 px-2 py-0.5 rounded border border-[#4ADE80]/30 shadow-[0_0_8px_rgba(74,222,128,0.2)]">
                  ✓ MATCH
                </span>
              )}
              {conditionMatch === 'mismatch' && (
                <span className="text-[#FB7185] font-bold bg-[#FB7185]/10 px-2 py-0.5 rounded border border-[#FB7185]/30 shadow-[0_0_8px_rgba(251,113,133,0.2)]">
                  ✕ MISMATCH
                </span>
              )}
              {conditionMatch === 'indeterminate' && (
                <span className="text-[#FBBF24] font-medium bg-[#FBBF24]/10 px-2 py-0.5 rounded border border-[#FBBF24]/30">
                  ⚠ UNCERTAIN
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-3 border-l border-[#353540] text-xs font-mono">
              <span className="text-[#6E6E82]">SOURCE:</span>
              <span className="font-semibold text-[#22D3EE] bg-[#191920] px-2 py-0.5 rounded border border-[#353540]">
                User Upload
              </span>
            </div>
          )}
        </div>

        {/* Evidence Score — Explicitly NEVER presented as a probability or percentage */}
        <div className="flex items-center gap-2.5 bg-[#191920] border border-[#A100FF]/40 shadow-[0_0_12px_rgba(161,0,255,0.2)] rounded-lg px-3.5 py-1.5">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#A5A5B5]">
              Evidence Score
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-mono font-bold text-[#F5F5FA] tabular-nums">
                {confidence !== null && confidence !== undefined
                  ? Number(confidence).toFixed(2)
                  : '—'}
              </span>
              <span className="text-[10px] font-mono text-[#6E6E82]">/ 1.00</span>
            </div>
          </div>
          <div className="w-1.5 h-6 bg-[#A100FF] rounded-full opacity-70"></div>
        </div>
      </div>

      {/* Bottom row: Instrumentation Parameters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-4 text-xs font-mono relative z-10">
        <div className="p-2.5 rounded-lg bg-[#191920]/70 border border-[#353540]/60">
          <span className="block text-[#6E6E82] uppercase text-[10px] tracking-wider mb-0.5">File Name</span>
          <span className="font-semibold text-[#F5F5FA] truncate block" title={meta.fileName}>
            {meta.fileName || '—'}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-[#191920]/70 border border-[#353540]/60">
          <span className="block text-[#6E6E82] uppercase text-[10px] tracking-wider mb-0.5">Shaft Speed</span>
          <span className="font-semibold text-[#22D3EE] tabular-nums block">
            {meta.rpm ? `${meta.rpm} rpm` : '—'}
          </span>
          {meta.rpmSource && (
            <span className="text-[#6E6E82] text-[9px] block">({meta.rpmSource})</span>
          )}
        </div>

        <div className="p-2.5 rounded-lg bg-[#191920]/70 border border-[#353540]/60">
          <span className="block text-[#6E6E82] uppercase text-[10px] tracking-wider mb-0.5">Sampling Freq (fs)</span>
          <span className="font-semibold text-[#F5F5FA] tabular-nums block">
            {meta.fs ? `${meta.fs.toLocaleString()} Hz` : '—'}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-[#191920]/70 border border-[#353540]/60">
          <span className="block text-[#6E6E82] uppercase text-[10px] tracking-wider mb-0.5">Duration</span>
          <span className="font-semibold text-[#F5F5FA] tabular-nums block">
            {meta.durationSec ? `${Number(meta.durationSec).toFixed(2)} s` : '—'}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-[#191920]/70 border border-[#353540]/60">
          <span className="block text-[#6E6E82] uppercase text-[10px] tracking-wider mb-0.5">Window Segments</span>
          <span className="font-semibold text-[#F5F5FA] tabular-nums block">
            {meta.nSegments ? `${meta.nSegments} segments` : '—'}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-[#191920]/70 border border-[#353540]/60">
          <span className="block text-[#6E6E82] uppercase text-[10px] tracking-wider mb-0.5">Bearing Type</span>
          <span className="font-semibold text-[#A100FF] truncate block" title={meta.bearing}>
            {meta.bearing || 'SKF 6205'}
          </span>
        </div>
      </div>
    </section>
  );
}
