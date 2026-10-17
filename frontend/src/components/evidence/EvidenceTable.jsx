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
        return 'Ball Defect (2xBSF)';
      default:
        return fault || '—';
    }
  };

  return (
    <div className="bg-white border border-zinc-300 p-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800">
            Harmonic Peak Detection Evidence
          </h3>
          <p className="text-[11px] font-mono text-zinc-500">
            Automated peak matching against theoretical kinematics within ±1% window
          </p>
        </div>
        <div className="text-[11px] font-mono text-zinc-500">
          Total harmonics evaluated: {evidence.length}
        </div>
      </div>

      <div className="overflow-x-auto mt-3">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-zinc-100 text-zinc-700 border-b border-zinc-300">
              <th className="py-2 px-3 font-semibold uppercase text-[11px]">Fault Family</th>
              <th className="py-2 px-3 font-semibold uppercase text-[11px]">Harmonic</th>
              <th className="py-2 px-3 font-semibold uppercase text-[11px] text-right">Theory (Hz)</th>
              <th className="py-2 px-3 font-semibold uppercase text-[11px] text-right">Detected (Hz)</th>
              <th className="py-2 px-3 font-semibold uppercase text-[11px] text-right">Error (Hz)</th>
              <th className="py-2 px-3 font-semibold uppercase text-[11px] text-right">Error (%)</th>
              <th className="py-2 px-3 font-semibold uppercase text-[11px] text-right">Peak / Noise (dB)</th>
              <th className="py-2 px-3 font-semibold uppercase text-[11px] text-center">Matched</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {evidence.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-4 text-center text-zinc-500">
                  No evidence data available.
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
                        ? 'bg-red-50/70 text-zinc-900 font-medium'
                        : 'bg-white text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    <td className="py-2 px-3">
                      <span className="flex items-center gap-1.5">
                        {isMatched && (
                          <span className="w-1.5 h-1.5 rounded-none bg-red-600 inline-block" />
                        )}
                        <span>{getFamilyLabel(row.fault)}</span>
                      </span>
                    </td>
                    <td className="py-2 px-3 font-medium">
                      {row.harmonic ? `${row.harmonic}x` : '1x'}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {formatHz(row.fTheory, 2)}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {row.fDetected !== null && row.fDetected !== undefined ? (
                        <span className={isMatched ? 'font-bold text-red-700' : ''}>
                          {formatHz(row.fDetected, 2)}
                        </span>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {row.errorHz !== null && row.errorHz !== undefined ? (
                        <span>{row.errorHz > 0 ? `+${row.errorHz.toFixed(2)}` : row.errorHz.toFixed(2)} Hz</span>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {row.errorPct !== null && row.errorPct !== undefined ? (
                        <span>{formatPct(row.errorPct, 2)}</span>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {row.snrDb !== null && row.snrDb !== undefined ? (
                        <span className={row.snrDb >= 10 ? 'font-bold text-zinc-900' : 'text-zinc-500'}>
                          {formatDb(row.snrDb, 1)}
                        </span>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {isMatched ? (
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase bg-red-100 text-red-800 border border-red-300">
                          YES: MATCH
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-[10px] uppercase bg-zinc-100 text-zinc-500 border border-zinc-200">
                          NO
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
