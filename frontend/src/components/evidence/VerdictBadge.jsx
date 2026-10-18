import React from 'react';

export default function VerdictBadge({ label, abnormal }) {
  const normLabel = (label || 'Uncertain').trim();

  let statusConfig = {
    category: 'FAULT DETECTED',
    bg: 'bg-[#FB7185]/10',
    border: 'border-[#FB7185]/40',
    text: 'text-[#FB7185]',
    dot: 'bg-[#FB7185]',
    glow: 'shadow-[0_0_12px_rgba(251,113,133,0.3)]'
  };

  if (normLabel.toLowerCase().includes('healthy')) {
    statusConfig = {
      category: 'HEALTHY BASELINE',
      bg: 'bg-[#4ADE80]/10',
      border: 'border-[#4ADE80]/40',
      text: 'text-[#4ADE80]',
      dot: 'bg-[#4ADE80]',
      glow: 'shadow-[0_0_12px_rgba(74,222,128,0.3)]'
    };
  } else if (normLabel.toLowerCase().includes('uncertain')) {
    statusConfig = {
      category: 'UNCERTAIN VERDICT',
      bg: 'bg-[#FBBF24]/10',
      border: 'border-[#FBBF24]/40',
      text: 'text-[#FBBF24]',
      dot: 'bg-[#FBBF24]',
      glow: 'shadow-[0_0_12px_rgba(251,191,36,0.3)]'
    };
  }

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-mono font-bold tracking-wide uppercase border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text} ${statusConfig.glow} transition-all`}
      role="status"
      aria-label={`Bearing verdict: ${normLabel}`}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusConfig.dot} opacity-60`}></span>
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${statusConfig.dot}`}></span>
      </span>
      <span className="text-[11px] opacity-75 font-medium">[{statusConfig.category}]</span>
      <span className="tracking-wider">{normLabel}</span>
    </div>
  );
}
