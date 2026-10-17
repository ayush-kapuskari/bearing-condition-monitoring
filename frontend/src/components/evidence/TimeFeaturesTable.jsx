import React from 'react';
import { formatNumber } from '../../utils/formatters';

export default function TimeFeaturesTable({ timeFeatures = {} }) {
  const record = timeFeatures.record || {};
  const perSegment = timeFeatures.perSegment || {};

  const metrics = [
    {
      key: 'rms',
      name: 'RMS (Root Mean Square)',
      symbol: 'RMS',
      unit: 'm/s²',
      desc: 'Overall vibration energy level of the recorded signal',
      val: record.rms
    },
    {
      key: 'peak',
      name: 'Peak Amplitude',
      symbol: 'X_peak',
      unit: 'm/s²',
      desc: 'Maximum absolute deviation from zero vibration',
      val: record.peak
    },
    {
      key: 'peakToPeak',
      name: 'Peak-to-Peak Amplitude',
      symbol: 'X_p-p',
      unit: 'm/s²',
      desc: 'Difference between extreme positive and negative peaks',
      val: record.peakToPeak
    },
    {
      key: 'crestFactor',
      name: 'Crest Factor',
      symbol: 'CF',
      unit: 'ratio',
      desc: 'Peak / RMS ratio (elevated values indicate sharp impulsive spikes)',
      val: record.crestFactor
    },
    {
      key: 'kurtosis',
      name: 'Kurtosis',
      symbol: 'Kurt',
      unit: 'dimensionless',
      desc: '4th statistical moment; Gaussian healthy baseline ~3.0, >3.5 indicates impacts',
      val: record.kurtosis,
      highlight: record.kurtosis > 3.5
    },
    {
      key: 'skewness',
      name: 'Skewness',
      symbol: 'Skew',
      unit: 'dimensionless',
      desc: '3rd statistical moment measuring asymmetry around the mean',
      val: record.skewness
    },
    {
      key: 'std',
      name: 'Standard Deviation',
      symbol: 'σ',
      unit: 'm/s²',
      desc: 'Statistical dispersion of dynamic acceleration fluctuations',
      val: record.std
    }
  ];

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-zinc-100 text-zinc-700 border-b border-zinc-300">
              <th className="py-2.5 px-3 font-semibold uppercase text-[11px]">Feature Parameter</th>
              <th className="py-2.5 px-3 font-semibold uppercase text-[11px]">Symbol</th>
              <th className="py-2.5 px-3 font-semibold uppercase text-[11px]">Units</th>
              <th className="py-2.5 px-3 font-semibold uppercase text-[11px] text-right">Record Value</th>
              <th className="py-2.5 px-3 font-semibold uppercase text-[11px]">Physical Meaning</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {metrics.map((m) => (
              <tr
                key={m.key}
                className={`transition-colors ${
                  m.highlight ? 'bg-amber-50/70 font-medium' : 'bg-white hover:bg-zinc-50'
                }`}
              >
                <td className="py-2.5 px-3 font-semibold text-zinc-900">{m.name}</td>
                <td className="py-2.5 px-3 text-zinc-600 italic">{m.symbol}</td>
                <td className="py-2.5 px-3 text-zinc-500">{m.unit}</td>
                <td className="py-2.5 px-3 text-right font-bold tabular-nums text-zinc-900">
                  {formatNumber(m.val, 3)}
                  {m.highlight && (
                    <span className="ml-1.5 text-[10px] text-amber-700 uppercase">[ELEVATED]</span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-zinc-500 text-[11px]">{m.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {perSegment.rms && Array.isArray(perSegment.rms) && (
        <div className="p-3 bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-600 flex justify-between items-center">
          <span>Number of 1-second evaluated segments:</span>
          <span className="font-bold text-zinc-900 tabular-nums">
            {perSegment.rms.length} segments analyzed across duration
          </span>
        </div>
      )}
    </div>
  );
}
