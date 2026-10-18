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

  // Base trace: Demodulated Envelope Spectrum in electric cyan (#22D3EE)
  const traces = useMemo(() => {
    const list = [
      {
        x: envF,
        y: envAmp,
        type: 'scatter',
        mode: 'lines',
        name: 'Envelope Spectrum (0–600 Hz)',
        line: { color: '#22D3EE', width: 1.5 },
        hovertemplate: 'Frequency: %{x:.2f} Hz<br>Envelope Amplitude: %{y:.4f}<extra></extra>'
      }
    ];

    // Matched peak dots from genuine evidence
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
        marker: { size: 9, color: '#E000A8', symbol: 'circle', line: { color: '#F5F5FA', width: 1.5 } },
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
        marker: { size: 9, color: '#38BDF8', symbol: 'diamond', line: { color: '#F5F5FA', width: 1.5 } },
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
        name: 'Detected 2×BSF Peak',
        marker: { size: 9, color: '#A100FF', symbol: 'square', line: { color: '#F5F5FA', width: 1.5 } },
        text: ballMatched.map(e => `Detected ${e.harmonic}x 2BSF: ${e.fDetected.toFixed(2)} Hz<br>SNR: ${e.snrDb ? e.snrDb.toFixed(1) : '—'} dB`),
        hoverinfo: 'text'
      });
    }

    return list;
  }, [envF, envAmp, evidence, showOuter, showInner, showBall]);

  // Shapes: Vertical lines & shaded tolerance windows (±1% around kinematic fundamentals)
  const { shapes, annotations } = useMemo(() => {
    const s = [];
    const a = [];

    // Shaft fundamental
    const shaft = theory.shaft;
    if (shaft) {
      s.push({
        type: 'line',
        x0: shaft,
        x1: shaft,
        y0: 0,
        y1: 1,
        yref: 'paper',
        line: { color: '#6E6E82', width: 1, dash: 'dot' }
      });
      a.push({
        x: shaft,
        y: 1,
        yref: 'paper',
        text: `Shaft (${shaft.toFixed(1)} Hz)`,
        showarrow: false,
        font: { size: 9, color: '#A5A5B5', family: 'JetBrains Mono, monospace' },
        yshift: 10
      });
    }

    // Outer Race (BPFO) in Neon Magenta (#E000A8)
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
        fillcolor: 'rgba(224, 0, 168, 0.15)',
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
            line: { color: '#E000A8', width: harm === 1 ? 1.5 : 1, dash: harm === 1 ? 'solid' : 'dash' }
          });
          a.push({
            x: f,
            y: 0.98,
            yref: 'paper',
            text: harm === 1 ? `BPFO ${f.toFixed(1)}` : `${harm}x BPFO`,
            showarrow: false,
            font: { size: 9, color: '#E000A8', family: 'JetBrains Mono, monospace' },
            yshift: harm === 1 ? -4 : -16
          });
        }
      });
    }

    // Inner Race (BPFI) in Cyan/Sky (#38BDF8)
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
        fillcolor: 'rgba(56, 189, 248, 0.15)',
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
            line: { color: '#38BDF8', width: harm === 1 ? 1.5 : 1, dash: harm === 1 ? 'solid' : 'dash' }
          });
          a.push({
            x: f,
            y: 0.90,
            yref: 'paper',
            text: harm === 1 ? `BPFI ${f.toFixed(1)}` : `${harm}x BPFI`,
            showarrow: false,
            font: { size: 9, color: '#38BDF8', family: 'JetBrains Mono, monospace' },
            yshift: 0
          });
        }
      });
    }

    // Ball Fault (2×BSF) in Electric Purple (#A100FF)
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
        fillcolor: 'rgba(161, 0, 255, 0.15)',
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
            line: { color: '#A100FF', width: harm === 1 ? 1.5 : 1, dash: harm === 1 ? 'solid' : 'dash' }
          });
          a.push({
            x: f,
            y: 0.82,
            yref: 'paper',
            text: harm === 1 ? `2×BSF ${f.toFixed(1)}` : `${harm}x (2BSF)`,
            showarrow: false,
            font: { size: 9, color: '#A100FF', family: 'JetBrains Mono, monospace' },
            yshift: 0
          });
        }
      });
    }

    // Cage (FTF) in Amber (#FBBF24)
    const ftf = theory.ftf;
    if (showCage && ftf) {
      s.push({
        type: 'rect',
        x0: ftf * 0.99,
        x1: ftf * 1.01,
        y0: 0,
        y1: 1,
        yref: 'paper',
        fillcolor: 'rgba(251, 191, 36, 0.15)',
        line: { width: 0 }
      });

      s.push({
        type: 'line',
        x0: ftf,
        x1: ftf,
        y0: 0,
        y1: 1,
        yref: 'paper',
        line: { color: '#FBBF24', width: 1.2, dash: 'dash' }
      });
      a.push({
        x: ftf,
        y: 0.74,
        yref: 'paper',
        text: `FTF ${ftf.toFixed(1)}`,
        showarrow: false,
        font: { size: 9, color: '#FBBF24', family: 'JetBrains Mono, monospace' },
        yshift: 0
      });
    }

    return { shapes: s, annotations: a };
  }, [theory, showOuter, showInner, showBall, showCage]);

  const maxAmp = envAmp.length > 0 ? Math.max(...envAmp) : 0.3;
  const yUpper = Math.max(0.05, maxAmp * 1.15);

  return (
    <div className="bg-[#202027] border border-[#353540] rounded-xl p-5 shadow-lg space-y-4">
      {/* Header and Toggle Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#353540]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#22D3EE] animate-pulse"></span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#22D3EE]">
              Primary Kinematic Detector
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-bold font-mono uppercase tracking-wider text-[#F5F5FA]">
            Demodulated Envelope Spectrum (2,000–5,000 Hz Resonant Band)
          </h2>
          <p className="text-xs text-[#A5A5B5] mt-0.5">
            X-axis: Frequency (0 to 600 Hz) &bull; Cyan trace: Demodulated envelope &bull; Shaded bands: ±1% kinematic tolerance windows
          </p>
        </div>

        {/* Family Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <label className={`flex items-center gap-2 cursor-pointer px-2.5 py-1.5 rounded-lg border transition-all ${
            showOuter
              ? 'bg-[#E000A8]/15 border-[#E000A8]/50 text-[#F5F5FA] shadow-[0_0_10px_rgba(224,0,168,0.2)]'
              : 'bg-[#191920] border-[#353540] text-[#6E6E82]'
          }`}>
            <input
              type="checkbox"
              checked={showOuter}
              onChange={(e) => setShowOuter(e.target.checked)}
              className="accent-[#E000A8] rounded w-3.5 h-3.5"
            />
            <span className="w-2.5 h-1 bg-[#E000A8] rounded-full inline-block" />
            <span className="font-semibold">Outer (BPFO)</span>
          </label>

          <label className={`flex items-center gap-2 cursor-pointer px-2.5 py-1.5 rounded-lg border transition-all ${
            showInner
              ? 'bg-[#38BDF8]/15 border-[#38BDF8]/50 text-[#F5F5FA] shadow-[0_0_10px_rgba(56,189,248,0.2)]'
              : 'bg-[#191920] border-[#353540] text-[#6E6E82]'
          }`}>
            <input
              type="checkbox"
              checked={showInner}
              onChange={(e) => setShowInner(e.target.checked)}
              className="accent-[#38BDF8] rounded w-3.5 h-3.5"
            />
            <span className="w-2.5 h-1 bg-[#38BDF8] rounded-full inline-block" />
            <span className="font-semibold">Inner (BPFI)</span>
          </label>

          <label className={`flex items-center gap-2 cursor-pointer px-2.5 py-1.5 rounded-lg border transition-all ${
            showBall
              ? 'bg-[#A100FF]/15 border-[#A100FF]/50 text-[#F5F5FA] shadow-[0_0_10px_rgba(161,0,255,0.2)]'
              : 'bg-[#191920] border-[#353540] text-[#6E6E82]'
          }`}>
            <input
              type="checkbox"
              checked={showBall}
              onChange={(e) => setShowBall(e.target.checked)}
              className="accent-[#A100FF] rounded w-3.5 h-3.5"
            />
            <span className="w-2.5 h-1 bg-[#A100FF] rounded-full inline-block" />
            <span className="font-semibold">Ball (2×BSF)</span>
          </label>

          <label className={`flex items-center gap-2 cursor-pointer px-2.5 py-1.5 rounded-lg border transition-all ${
            showCage
              ? 'bg-[#FBBF24]/15 border-[#FBBF24]/50 text-[#F5F5FA] shadow-[0_0_10px_rgba(251,191,36,0.2)]'
              : 'bg-[#191920] border-[#353540] text-[#6E6E82]'
          }`}>
            <input
              type="checkbox"
              checked={showCage}
              onChange={(e) => setShowCage(e.target.checked)}
              className="accent-[#FBBF24] rounded w-3.5 h-3.5"
            />
            <span className="w-2.5 h-1 bg-[#FBBF24] rounded-full inline-block" />
            <span className="font-semibold">Cage (FTF)</span>
          </label>
        </div>
      </div>

      {/* Plot Container */}
      <div className="w-full h-80 sm:h-96 rounded-lg overflow-hidden bg-[#181820] border border-[#353540]/60">
        <Plot
          data={traces}
          layout={{
            autosize: true,
            margin: { l: 55, r: 25, t: 30, b: 50 },
            xaxis: {
              title: { text: 'Frequency (Hz)', font: { family: 'JetBrains Mono, monospace', size: 11, color: '#A5A5B5' } },
              range: [0, 600],
              showgrid: true,
              gridcolor: '#282833',
              zeroline: true,
              zerolinecolor: '#353540',
              tickfont: { family: 'JetBrains Mono, monospace', size: 10, color: '#A5A5B5' }
            },
            yaxis: {
              title: { text: 'Envelope Amplitude', font: { family: 'JetBrains Mono, monospace', size: 11, color: '#A5A5B5' } },
              range: [0, yUpper],
              showgrid: true,
              gridcolor: '#282833',
              zeroline: true,
              zerolinecolor: '#353540',
              tickfont: { family: 'JetBrains Mono, monospace', size: 10, color: '#A5A5B5' }
            },
            shapes: shapes,
            annotations: annotations,
            showlegend: false,
            hovermode: 'closest',
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
    </div>
  );
}
