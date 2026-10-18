import React, { useState, useEffect } from 'react';

export default function MiniWaveformPreview({ recordId, strokeColor = '#22D3EE', height = 48 }) {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch(`/sample_results/${recordId}.json`)
      .then((res) => {
        if (!res.ok) throw new Error('File not found');
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        const raw = data.signal?.x || [];
        if (raw.length === 0) {
          setLoading(false);
          return;
        }
        // Downsample to 120 points for smooth SVG rendering
        const targetCount = 120;
        const step = Math.max(1, Math.floor(raw.length / targetCount));
        const downsampled = [];
        for (let i = 0; i < raw.length && downsampled.length < targetCount; i += step) {
          downsampled.push(raw[i]);
        }
        setPoints(downsampled);
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [recordId]);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center bg-[#191920]/60 rounded border border-[#353540]/40" style={{ height: `${height}px` }}>
        <div className="w-4 h-4 border-2 border-[#353540] border-t-[#22D3EE] rounded-full animate-spin" />
      </div>
    );
  }

  if (points.length < 2) {
    return null;
  }

  // Calculate SVG polyline coordinates
  const width = 280;
  const minVal = Math.min(...points);
  const maxVal = Math.max(...points);
  const range = maxVal - minVal || 1;
  const padding = 4;
  const availableH = height - padding * 2;

  const coords = points.map((val, idx) => {
    const x = (idx / (points.length - 1)) * width;
    const normY = (val - minVal) / range;
    const y = height - padding - normY * availableH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const polylinePoints = coords.join(' ');
  const areaPath = `M 0,${height} L ${coords.join(' L ')} L ${width},${height} Z`;

  return (
    <div className="w-full overflow-hidden rounded bg-[#15151B] border border-[#353540]/60 p-1 relative group">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`sparkGrad-${recordId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {/* Shaded Area under curve */}
        <path d={areaPath} fill={`url(#sparkGrad-${recordId})`} />
        {/* Waveform Line */}
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={polylinePoints}
        />
      </svg>
      <div className="absolute bottom-1 right-2 text-[9px] font-mono text-[#6E6E82] opacity-75">
        Waveform Preview
      </div>
    </div>
  );
}
