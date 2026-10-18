import React from 'react';
import { formatNumber, formatHz, formatPct, formatDb } from '../../utils/formatters';

export default function EvidenceTable({ evidence = [] }) {
  const getFamilyLabel = (fault) => {
    switch (fault) {
      case 'outer':
        return 'Outer Race (BPFO)';
      case 'inner':
        return 'Inner Race (BPFI)';
      case 'ball':
        return 'Ball Defect (2×BSF)';
      default:
        return fault || '—';
    }
  };

  const getFamilyColor = (fault) => {
    switch (fault) {
      case 'outer':
        return 'text-[#E000A8]';
      case 'inner':
        return 'text-[#38BDF8]';
      case 'ball':
        return 'text-[#A100FF]';
      default:
        return 'text-[#F5F5FA]';
    }
  };

  return (
    <div className="bg-[#202027] border border-[#353540] rounded-xl p-5 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#353540]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#E000A8] animate-pulse"></span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E000A8]">
              Automated Peak Detection
            </span>
          </div>
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#F5F5FA]">
            Harmonic Kinematic Evidence Table
          </h3>
          <p className="text-xs text-[#A5A5B5] mt-0.5">
            Automated peak matching against theoretical bearing kinematics within strict ±1% tolerance windows
          </p>
        </div>
        <div className="text-[11px] font-mono text-[#A5A5B5] bg-[#191920] px-3 py-1 rounded-lg border border-[#353540] self-start sm:self-auto">
          Harmonics Evaluated: <span className="text-[#22D3EE] font-bold">{evidence.length}</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#353540]/60">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-[#191920] text-[#A5A5B5] border-b border-[#353540]">
              <th className="py-2.5 px-3 font-semibold uppercase text-[11px]">Fault Family</th>
              <th className="py-2.5 px-3 font-semibold uppercase text-[11px]">Harmonic</th>
              <th className="py-2.5 px-3 font-semibold uppercase text-[11px] text-right">Theory (Hz)</th>
              <th className="py-2.5 px-3 font-semibold uppercase text-[11px] text-right">Detected (Hz)</th>
              <th className="py-2.5 px-3 font-semibold uppercase text-[11px] text-right">Error (Hz)</th>
              <th className="py-2.5 px-3 font-semibold uppercase text-[11px] text-right">Error (%)</th>
              <th className="py-2.5 px-3 font-semibold uppercase text-[11px] text-right">Peak / Noise (dB)</th>
              <th className="py-2.5 px-3 font-semibold uppercase text-[11px] text-center">Matched</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#353540]/60">
            {evidence.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-[#6E6E82]">
                  No harmonic evidence data recorded for this file.
                </td>
              </tr>
            ) : (
              evidence.map((row, idx) => {
                const isMatched = Boolean(row.matched);
                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isMatched
                        ? 'bg-[#E000A8]/10 text-[#F5F5FA] font-medium'
                        : 'bg-[#202027] text-[#A5A5B5] hover:bg-[#282833]'
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <span className="flex items-center gap-2">
                        {isMatched ? (
                          <span className="w-2 h-2 rounded-full bg-[#E000A8] shadow-[0_0_8px_rgba(224,0,168,0.8)] inline-block" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#6E6E82] inline-block" />
                        )}
                        <span className={`font-semibold ${getFamilyColor(row.fault)}`}>
                          {getFamilyLabel(row.fault)}
                        </span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#F5F5FA]">
                      {row.harmonic ? `${row.harmonic}x` : '1x'}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-[#A5A5B5]">
                      {formatHz(row.fTheory, 2)}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {row.fDetected !== null && row.fDetected !== undefined ? (
                        <span className={isMatched ? 'font-bold text-[#22D3EE]' : 'text-[#F5F5FA]'}>
                          {formatHz(row.fDetected, 2)}
                        </span>
                      ) : (
                        <span className="text-[#6E6E82]">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {row.errorHz !== null && row.errorHz !== undefined ? (
                        <span className="text-[#A5A5B5]">
                          {row.errorHz > 0 ? `+${row.errorHz.toFixed(2)}` : row.errorHz.toFixed(2)} Hz
                        </span>
                      ) : (
                        <span className="text-[#6E6E82]">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {row.errorPct !== null && row.errorPct !== undefined ? (
                        <span className="text-[#A5A5B5]">{formatPct(row.errorPct, 2)}</span>
                      ) : (
                        <span className="text-[#6E6E82]">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {row.snrDb !== null && row.snrDb !== undefined ? (
                        <span className={isMatched && row.snrDb >= 6 ? 'font-bold text-[#4ADE80]' : 'text-[#A5A5B5]'}>
                          {formatDb(row.snrDb, 1)}
                        </span>
                      ) : (
                        <span className="text-[#6E6E82]">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {isMatched ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#4ADE80]/15 text-[#4ADE80] border border-[#4ADE80]/30 shadow-[0_0_8px_rgba(74,222,128,0.2)]">
                          MATCHED
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-[#191920] text-[#6E6E82] border border-[#353540]">
                          NONE
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
