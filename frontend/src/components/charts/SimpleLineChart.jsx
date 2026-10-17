import React from 'react';
import Plot from './PlotlyComponent';

export default function SimpleLineChart({
  x = [],
  y = [],
  xTitle = 'X',
  yTitle = 'Y',
  lineColor = '#2563eb',
  caption = '',
  height = 320,
  hoverTemplate = 'X: %{x:.3f}<br>Y: %{y:.4f}<extra></extra>'
}) {
  return (
    <div className="w-full">
      <div className="w-full" style={{ height: `${height}px` }}>
        <Plot
          data={[
            {
              x: x,
              y: y,
              type: 'scatter',
              mode: 'lines',
              line: { color: lineColor, width: 1.2 },
              hovertemplate: hoverTemplate
            }
          ]}
          layout={{
            autosize: true,
            margin: { l: 50, r: 25, t: 15, b: 45 },
            xaxis: {
              title: { text: xTitle, font: { family: 'monospace', size: 11, color: '#3f3f46' } },
              showgrid: true,
              gridcolor: '#f0f0f1',
              zeroline: true,
              zerolinecolor: '#d4d4d8',
              tickfont: { family: 'monospace', size: 10 }
            },
            yaxis: {
              title: { text: yTitle, font: { family: 'monospace', size: 11, color: '#3f3f46' } },
              showgrid: true,
              gridcolor: '#f0f0f1',
              zeroline: true,
              zerolinecolor: '#d4d4d8',
              tickfont: { family: 'monospace', size: 10 }
            },
            plot_bgcolor: '#ffffff',
            paper_bgcolor: '#ffffff'
          }}
          config={{
            responsive: true,
            displayModeBar: true,
            displaylogo: false
          }}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler={true}
        />
      </div>

      {caption && (
        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 text-xs font-mono text-amber-900">
          <span className="font-semibold uppercase">[Observation Note]:</span> {caption}
        </div>
      )}
    </div>
  );
}
