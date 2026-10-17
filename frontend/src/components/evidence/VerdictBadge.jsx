import React from 'react';

export default function VerdictBadge({ label, abnormal }) {
  const normLabel = (label || 'Uncertain').trim();

  let statusConfig = {
    category: 'FAULT',
    bg: 'bg-red-50',
    border: 'border-red-400',
    text: 'text-red-800',
    dot: 'bg-red-600',
    prefix: 'FAULT DETECTED: '
  };

  if (normLabel.toLowerCase().includes('healthy')) {
    statusConfig = {
      category: 'HEALTHY',
      bg: 'bg-emerald-50',
      border: 'border-emerald-400',
      text: 'text-emerald-800',
      dot: 'bg-emerald-600',
      prefix: 'NORMAL: '
    };
  } else if (normLabel.toLowerCase().includes('uncertain')) {
    statusConfig = {
      category: 'UNCERTAIN',
      bg: 'bg-amber-50',
      border: 'border-amber-400',
      text: 'text-amber-800',
      dot: 'bg-amber-600',
      prefix: 'INDETERMINATE: '
    };
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 text-xs sm:text-sm font-mono font-semibold uppercase border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text}`}
      role="status"
      aria-label={`Bearing verdict: ${normLabel}`}
    >
      <span className={`w-2 h-2 rounded-none ${statusConfig.dot}`} aria-hidden="true" />
      <span>[{statusConfig.category}]</span>
      <span>{normLabel}</span>
    </div>
  );
}
