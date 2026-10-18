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
      desc: 'Overall vibration energy level of the recorded accelerometer signal',
      val: record.rms
    },
    {
      key: 'peak',
      name: 'Peak Amplitude',
      symbol: 'X_peak',
      unit: 'm/s²',
      desc: 'Maximum absolute deviation from zero dynamic acceleration',
      val: record.peak
    },
    {
      key: 'peakToPeak',
      name: 'Peak-to-Peak Amplitude',
      symbol: 'X_p-p',
      unit: 'm/s²',
      desc: 'Total excursion span between extreme positive and negative peaks',
      val: record.peakToPeak
    },
    {
      key: 'crestFactor',
      name: 'Crest Factor',
      symbol: 'CF',
      unit: 'ratio',
      desc: 'Peak / RMS ratio (elevated values indicate sharp spiky impacts)',
      val: record.crestFactor
    },
    {
      key: 'kurtosis',
      name: 'Kurtosis',
      symbol: 'Kurt',
      unit: 'dimensionless',
      desc: '4th statistical moment; Gaussian healthy baseline ~3.0, >3.5 indicates localized impacts',
      val: record.kurtosis,
      highlight: record.kurtosis > 3.5
    },
    {
      key: 'skewness',
      name: 'Skewness',
      symbol: 'Skew',
      unit: 'dimensionless',
      desc: '3rd statistical moment measuring waveform asymmetry around the mean',
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
    <div className="space-y-4 font-mono text-xs">
      <div className="overflow-x-auto rounded-lg border border-[#353540]/60">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#191920] text-[#A5A5B5] border-b border-[#353540]">
              <th className="py-3 px-4 font-semibold uppercase text-[11px]">Feature Parameter</th>
              <th className="py-3 px-4 font-semibold uppercase text-[11px]">Symbol</th>
              <th className="py-3 px-4 font-semibold uppercase text-[11px]">Units</th>
              <th className="py-3 px-4 font-semibold uppercase text-[11px] text-right">Record Value</th>
              <th className="py-3 px-4 font-semibold uppercase text-[11px]">Physical Meaning</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#353540]/60">
            {metrics.map((m) => (
              <tr
                key={m.key}
                className={`transition-colors ${
                  m.highlight
                    ? 'bg-[#FB7185]/10 text-[#F5F5FA] font-medium'
                    : 'bg-[#202027] text-[#A5A5B5] hover:bg-[#282833]'
                }`}
              >
                <td className="py-3 px-4 font-semibold text-[#F5F5FA]">{m.name}</td>
                <td className="py-3 px-4 text-[#22D3EE] italic">{m.symbol}</td>
                <td className="py-3 px-4 text-[#6E6E82]">{m.unit}</td>
                <td className="py-3 px-4 text-right font-bold tabular-nums text-[#F5F5FA]">
                  {formatNumber(m.val, 3)}
                  {m.highlight && (
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-[#FB7185]/20 text-[#FB7185] border border-[#FB7185]/40 uppercase font-bold">
                      [ELEVATED]
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-[#A5A5B5] text-[11px] font-sans">{m.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {perSegment.rms && Array.isArray(perSegment.rms) && (
        <div className="p-3.5 rounded-lg bg-[#191920] border border-[#353540] text-xs font-mono text-[#A5A5B5] flex flex-wrap justify-between items-center gap-2">
          <span>Evaluated 1-second sub-blocks (50% overlap):</span>
          <span className="font-bold text-[#22D3EE] tabular-nums">
            {perSegment.rms.length} windowed segments computed across recording
          </span>
        </div>
      )}
    </div>
  );
}
