import React from 'react';
import Plot from './PlotlyComponent';

export default function SimpleLineChart({
  x = [],
  y = [],
  xTitle = 'X',
  yTitle = 'Y',
  lineColor = '#22D3EE',
  caption = '',
  height = 340,
  hoverTemplate = 'X: %{x:.3f}<br>Y: %{y:.4f}<extra></extra>'
}) {
  return (
    <div className="w-full">
      <div className="w-full rounded-lg overflow-hidden bg-[#181820] border border-[#353540]/60" style={{ height: `${height}px` }}>
        <Plot
          data={[
            {
              x: x,
              y: y,
              type: 'scatter',
              mode: 'lines',
              line: { color: lineColor, width: 1.4 },
              hovertemplate: hoverTemplate
            }
          ]}
          layout={{
            autosize: true,
            margin: { l: 55, r: 25, t: 20, b: 50 },
            xaxis: {
              title: { text: xTitle, font: { family: 'JetBrains Mono, monospace', size: 11, color: '#A5A5B5' } },
              showgrid: true,
              gridcolor: '#282833',
              zeroline: true,
              zerolinecolor: '#353540',
              tickfont: { family: 'JetBrains Mono, monospace', size: 10, color: '#A5A5B5' }
            },
            yaxis: {
              title: { text: yTitle, font: { family: 'JetBrains Mono, monospace', size: 11, color: '#A5A5B5' } },
              showgrid: true,
              gridcolor: '#282833',
              zeroline: true,
              zerolinecolor: '#353540',
              tickfont: { family: 'JetBrains Mono, monospace', size: 10, color: '#A5A5B5' }
            },
            plot_bgcolor: '#15151B',
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

      {caption && (
        <div className="mt-2.5 p-3 rounded-lg bg-[#202027] border border-[#353540] text-xs font-mono text-[#A5A5B5] flex items-start gap-2">
          <span className="text-[#22D3EE] font-bold uppercase select-none">[NOTE]:</span>
          <span>{caption}</span>
        </div>
      )}
    </div>
  );
}

