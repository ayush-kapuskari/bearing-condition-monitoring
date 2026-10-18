import React from 'react';
import Plot from './PlotlyComponent';

export default function SpectrogramChart({ stft = {}, height = 360 }) {
  const { t = [], f = [], magDb = [] } = stft;

  if (!t.length || !f.length || !magDb.length) {
    return (
      <div className="w-full h-64 bg-[#191920] border border-[#353540] rounded-xl flex items-center justify-center text-xs font-mono text-[#6E6E82]">
        STFT Spectrogram data not available for this record.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full rounded-lg overflow-hidden bg-[#181820] border border-[#353540]/60" style={{ height: `${height}px` }}>
        <Plot
          data={[
            {
              x: t,
              y: f,
              z: magDb,
              type: 'heatmap',
              colorscale: [
                [0, '#111116'],
                [0.2, '#1e1b4b'],
                [0.4, '#4c1d95'],
                [0.6, '#A100FF'],
                [0.8, '#E000A8'],
                [1.0, '#22D3EE']
              ],
              hoverongaps: false,
              hovertemplate: 'Time: %{x:.3f} s<br>Frequency: %{y:.0f} Hz<br>Magnitude: %{z:.1f} dB<extra></extra>',
              colorbar: {
                title: { text: 'Magnitude (dB)', font: { color: '#A5A5B5', family: 'JetBrains Mono, monospace', size: 10 } },
                tickfont: { color: '#A5A5B5', family: 'JetBrains Mono, monospace', size: 9 },
                thickness: 14,
                len: 0.95
              }
            }
          ]}
          layout={{
            autosize: true,
            margin: { l: 60, r: 20, t: 20, b: 50 },
            xaxis: {
              title: { text: 'Time (s)', font: { family: 'JetBrains Mono, monospace', size: 11, color: '#A5A5B5' } },
              tickfont: { family: 'JetBrains Mono, monospace', size: 10, color: '#A5A5B5' },
              showgrid: true,
              gridcolor: '#282833'
            },
            yaxis: {
              title: { text: 'Frequency (Hz)', font: { family: 'JetBrains Mono, monospace', size: 11, color: '#A5A5B5' } },
              tickfont: { family: 'JetBrains Mono, monospace', size: 10, color: '#A5A5B5' },
              showgrid: true,
              gridcolor: '#282833'
            },
            plot_bgcolor: '#111116',
            paper_bgcolor: '#191920',
            font: { family: 'Inter, sans-serif', color: '#F5F5FA' }
          }}
          config={{
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['lasso2d', 'select2d']
          }}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler={true}
        />
      </div>

      <div className="mt-2.5 p-3 rounded-lg bg-[#202027] border border-[#353540] text-xs font-mono text-[#A5A5B5]">
        <span className="text-[#22D3EE] font-bold uppercase mr-1">[SPECTROGRAM INTERPRETATION]:</span>
        Displays time-varying spectral power distribution. Localized impact shocks create wideband vertical energy bursts across the 2,000–5,000 Hz resonance zone.
      </div>
    </div>
  );
}
