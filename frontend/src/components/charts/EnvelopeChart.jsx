import React, { useState, useMemo } from 'react';
import Plot from './PlotlyComponent';

export default function EnvelopeChart({ envelope = {}, theory = {}, evidence = [] }) {
  // Family visibility toggles
  const [showOuter, setShowOuter] = useState(true);
  const [showInner, setShowInner] = useState(true);
  const [showBall, setShowBall] = useState(true);
  const [showCage, setShowCage] = useState(true);

  const envF = envelope.f || [];
  const envAmp = envelope.amp || [];

  // Helper to interpolate or find amplitude at a given frequency
  const getAmpAt = (targetF) => {
    if (!envF.length || !envAmp.length || targetF === null || targetF === undefined) return 0;
    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < envF.length; i++) {
      const diff = Math.abs(envF[i] - targetF);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }
    return envAmp[closestIdx] || 0;
  };

  // Base trace: Envelope Spectrum
  const traces = useMemo(() => {
    const list = [
      {
        x: envF,
        y: envAmp,
        type: 'scatter',
        mode: 'lines',
        name: 'Envelope Spectrum (0-600 Hz)',
        line: { color: '#09090b', width: 1.2 },
        hovertemplate: 'Frequency: %{x:.2f} Hz<br>Envelope Amplitude: %{y:.4f}<extra></extra>'
      }
    ];

    // Matched peak dots
    const matchedRows = (evidence || []).filter(e => e.matched && e.fDetected !== null && e.fDetected !== undefined);

    const outerMatched = matchedRows.filter(e => e.fault === 'outer');
    const innerMatched = matchedRows.filter(e => e.fault === 'inner');
    const ballMatched = matchedRows.filter(e => e.fault === 'ball');

    if (showOuter && outerMatched.length > 0) {
      list.push({
        x: outerMatched.map(e => e.fDetected),
        y: outerMatched.map(e => getAmpAt(e.fDetected)),
        type: 'scatter',
        mode: 'markers',
        name: 'Detected BPFO Peak',
        marker: { size: 9, color: '#dc2626', symbol: 'circle', line: { color: '#ffffff', width: 1.5 } },
        text: outerMatched.map(e => `Detected ${e.harmonic}x BPFO: ${e.fDetected.toFixed(2)} Hz<br>SNR: ${e.snrDb ? e.snrDb.toFixed(1) : '—'} dB`),
        hoverinfo: 'text'
      });
    }

    if (showInner && innerMatched.length > 0) {
      list.push({
        x: innerMatched.map(e => e.fDetected),
        y: innerMatched.map(e => getAmpAt(e.fDetected)),
        type: 'scatter',
        mode: 'markers',
        name: 'Detected BPFI Peak',
        marker: { size: 9, color: '#2563eb', symbol: 'diamond', line: { color: '#ffffff', width: 1.5 } },
        text: innerMatched.map(e => `Detected ${e.harmonic}x BPFI: ${e.fDetected.toFixed(2)} Hz<br>SNR: ${e.snrDb ? e.snrDb.toFixed(1) : '—'} dB`),
        hoverinfo: 'text'
      });
    }

    if (showBall && ballMatched.length > 0) {
      list.push({
        x: ballMatched.map(e => e.fDetected),
        y: ballMatched.map(e => getAmpAt(e.fDetected)),
        type: 'scatter',
        mode: 'markers',
        name: 'Detected 2xBSF Peak',
        marker: { size: 9, color: '#7c3aed', symbol: 'square', line: { color: '#ffffff', width: 1.5 } },
        text: ballMatched.map(e => `Detected ${e.harmonic}x 2BSF: ${e.fDetected.toFixed(2)} Hz<br>SNR: ${e.snrDb ? e.snrDb.toFixed(1) : '—'} dB`),
        hoverinfo: 'text'
      });
    }

    return list;
  }, [envF, envAmp, evidence, showOuter, showInner, showBall]);

  // Shapes: Vertical lines & shaded tolerance windows (+/- 1% around fundamentals)
  const { shapes, annotations } = useMemo(() => {
    const s = [];
    const a = [];

    // Shaft frequency
    const shaft = theory.shaft;
    if (shaft) {
      s.push({
        type: 'line',
        x0: shaft,
        x1: shaft,
        y0: 0,
        y1: 1,
        yref: 'paper',
        line: { color: '#71717a', width: 1, dash: 'dot' }
      });
      a.push({
        x: shaft,
        y: 1,
        yref: 'paper',
        text: `Shaft (${shaft.toFixed(1)} Hz)`,
        showarrow: false,
        font: { size: 9, color: '#52525b', family: 'monospace' },
        yshift: 10
      });
    }

    // Outer Race (BPFO)
    const bpfo = theory.bpfo;
    if (showOuter && bpfo) {
      // 1% tolerance window around fundamental
      s.push({
        type: 'rect',
        x0: bpfo * 0.99,
        x1: bpfo * 1.01,
        y0: 0,
        y1: 1,
        yref: 'paper',
        fillcolor: 'rgba(220, 38, 38, 0.12)',
        line: { width: 0 }
      });

      // Harmonics 1x, 2x, 3x
      [1, 2, 3].forEach((harm) => {
        const f = bpfo * harm;
        if (f <= 600) {
          s.push({
            type: 'line',
            x0: f,
            x1: f,
            y0: 0,
            y1: 1,
            yref: 'paper',
            line: { color: '#dc2626', width: harm === 1 ? 1.5 : 1, dash: harm === 1 ? 'solid' : 'dash' }
          });
          a.push({
            x: f,
            y: 0.98,
            yref: 'paper',
            text: harm === 1 ? `BPFO ${f.toFixed(1)}` : `${harm}x BPFO`,
            showarrow: false,
            font: { size: 9, color: '#dc2626', family: 'monospace' },
            yshift: harm === 1 ? -4 : -16
          });
        }
      });
    }

    // Inner Race (BPFI)
    const bpfi = theory.bpfi;
    if (showInner && bpfi) {
      // 1% tolerance window around fundamental
      s.push({
        type: 'rect',
        x0: bpfi * 0.99,
        x1: bpfi * 1.01,
        y0: 0,
        y1: 1,
        yref: 'paper',
        fillcolor: 'rgba(37, 99, 235, 0.12)',
        line: { width: 0 }
      });

      [1, 2, 3].forEach((harm) => {
        const f = bpfi * harm;
        if (f <= 600) {
          s.push({
            type: 'line',
            x0: f,
            x1: f,
            y0: 0,
            y1: 1,
            yref: 'paper',
            line: { color: '#2563eb', width: harm === 1 ? 1.5 : 1, dash: harm === 1 ? 'solid' : 'dash' }
          });
          a.push({
            x: f,
            y: 0.90,
            yref: 'paper',
            text: harm === 1 ? `BPFI ${f.toFixed(1)}` : `${harm}x BPFI`,
            showarrow: false,
            font: { size: 9, color: '#2563eb', family: 'monospace' },
            yshift: 0
          });
        }
      });
    }

    // Ball Fault (2x BSF)
    const bsf2 = theory.bsf2 || (theory.bsf ? theory.bsf * 2 : null);
    if (showBall && bsf2) {
      // 1% tolerance window around fundamental
      s.push({
        type: 'rect',
        x0: bsf2 * 0.99,
        x1: bsf2 * 1.01,
        y0: 0,
        y1: 1,
        yref: 'paper',
        fillcolor: 'rgba(124, 58, 237, 0.12)',
        line: { width: 0 }
      });

      [1, 2, 3].forEach((harm) => {
        const f = bsf2 * harm;
        if (f <= 600) {
          s.push({
            type: 'line',
            x0: f,
            x1: f,
            y0: 0,
            y1: 1,
            yref: 'paper',
            line: { color: '#7c3aed', width: harm === 1 ? 1.5 : 1, dash: harm === 1 ? 'solid' : 'dash' }
          });
          a.push({
            x: f,
            y: 0.82,
            yref: 'paper',
            text: harm === 1 ? `2xBSF ${f.toFixed(1)}` : `${harm}x (2BSF)`,
            showarrow: false,
            font: { size: 9, color: '#7c3aed', family: 'monospace' },
            yshift: 0
          });
        }
      });
    }

    // Cage / FTF
    const ftf = theory.ftf;
    if (showCage && ftf) {
      // 1% tolerance window around fundamental
      s.push({
        type: 'rect',
        x0: ftf * 0.99,
        x1: ftf * 1.01,
        y0: 0,
        y1: 1,
        yref: 'paper',
        fillcolor: 'rgba(217, 119, 6, 0.12)',
        line: { width: 0 }
      });

      s.push({
        type: 'line',
        x0: ftf,
        x1: ftf,
        y0: 0,
        y1: 1,
        yref: 'paper',
        line: { color: '#d97706', width: 1.2, dash: 'dash' }
      });
      a.push({
        x: ftf,
        y: 0.74,
        yref: 'paper',
        text: `FTF ${ftf.toFixed(1)}`,
        showarrow: false,
        font: { size: 9, color: '#d97706', family: 'monospace' },
        yshift: 0
      });
    }

    return { shapes: s, annotations: a };
  }, [theory, showOuter, showInner, showBall, showCage]);

  const maxAmp = envAmp.length > 0 ? Math.max(...envAmp) : 0.3;
  const yUpper = Math.max(0.05, maxAmp * 1.15);

  return (
    <div className="bg-white border border-zinc-300 p-4">
      {/* Header and Toggle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
        <div>
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800">
            Envelope Spectrum (Demodulated 2000–5000 Hz Band)
          </h2>
          <p className="text-[11px] font-mono text-zinc-500">
            X-axis: Frequency (0 to 600 Hz) | Y-axis: Envelope Amplitude (a.u.) | Shaded boxes: ±1% tolerance windows
          </p>
        </div>

        {/* Family Toggles */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <label className="flex items-center gap-1.5 cursor-pointer bg-zinc-50 border border-zinc-200 px-2 py-1">
            <input
              type="checkbox"
              checked={showOuter}
              onChange={(e) => setShowOuter(e.target.checked)}
              className="accent-red-600 rounded-none w-3.5 h-3.5"
            />
            <span className="w-2.5 h-0.5 bg-red-600 inline-block" />
            <span className="text-zinc-800 font-medium">Outer (BPFO)</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer bg-zinc-50 border border-zinc-200 px-2 py-1">
            <input
              type="checkbox"
              checked={showInner}
              onChange={(e) => setShowInner(e.target.checked)}
              className="accent-blue-600 rounded-none w-3.5 h-3.5"
            />
            <span className="w-2.5 h-0.5 bg-blue-600 inline-block" />
            <span className="text-zinc-800 font-medium">Inner (BPFI)</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer bg-zinc-50 border border-zinc-200 px-2 py-1">
            <input
              type="checkbox"
              checked={showBall}
              onChange={(e) => setShowBall(e.target.checked)}
              className="accent-purple-600 rounded-none w-3.5 h-3.5"
            />
            <span className="w-2.5 h-0.5 bg-purple-600 inline-block" />
            <span className="text-zinc-800 font-medium">Ball (2xBSF)</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer bg-zinc-50 border border-zinc-200 px-2 py-1">
            <input
              type="checkbox"
              checked={showCage}
              onChange={(e) => setShowCage(e.target.checked)}
              className="accent-amber-600 rounded-none w-3.5 h-3.5"
            />
            <span className="w-2.5 h-0.5 bg-amber-600 inline-block" />
            <span className="text-zinc-800 font-medium">Cage (FTF)</span>
          </label>
        </div>
      </div>

      {/* Plot Container */}
      <div className="w-full h-80 sm:h-96 mt-2">
        <Plot
          data={traces}
          layout={{
            autosize: true,
            margin: { l: 50, r: 25, t: 25, b: 45 },
            xaxis: {
              title: { text: 'Frequency (Hz)', font: { family: 'monospace', size: 11, color: '#3f3f46' } },
              range: [0, 600],
              showgrid: true,
              gridcolor: '#f0f0f1',
              zeroline: true,
              zerolinecolor: '#d4d4d8',
              tickfont: { family: 'monospace', size: 10 }
            },
            yaxis: {
              title: { text: 'Envelope Amplitude', font: { family: 'monospace', size: 11, color: '#3f3f46' } },
              range: [0, yUpper],
              showgrid: true,
              gridcolor: '#f0f0f1',
              zeroline: true,
              zerolinecolor: '#d4d4d8',
              tickfont: { family: 'monospace', size: 10 }
            },
            shapes: shapes,
            annotations: annotations,
            showlegend: false,
            hovermode: 'closest',
            plot_bgcolor: '#ffffff',
            paper_bgcolor: '#ffffff'
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
    </div>
  );
}
