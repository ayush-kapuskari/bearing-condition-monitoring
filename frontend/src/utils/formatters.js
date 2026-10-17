/**
 * Defensive formatters for bearing condition monitoring data.
 * Guarantees that null, undefined, NaN, or unexpected types never crash the UI.
 */

export function formatNumber(val, decimals = 2, unit = '') {
  if (val === null || val === undefined || isNaN(Number(val))) {
    return '—';
  }
  const formatted = Number(val).toFixed(decimals);
  return unit ? `${formatted} ${unit}` : formatted;
}

export function formatHz(val, decimals = 1) {
  return formatNumber(val, decimals, 'Hz');
}

export function formatPct(val, decimals = 2) {
  if (val === null || val === undefined || isNaN(Number(val))) {
    return '—';
  }
  return `${Number(val).toFixed(decimals)}%`;
}

export function formatDb(val, decimals = 1) {
  return formatNumber(val, decimals, 'dB');
}

export function formatRpm(val) {
  if (val === null || val === undefined || isNaN(Number(val))) {
    return '—';
  }
  return `${Math.round(Number(val))} rpm`;
}

/**
 * Normalizes reasons from diagnosis object:
 * Reasons can arrive as an array, a single string, or null/undefined.
 */
export function normalizeReasons(reasons) {
  if (!reasons) return [];
  if (Array.isArray(reasons)) {
    return reasons.filter(r => Boolean(r));
  }
  if (typeof reasons === 'string') {
    return [reasons];
  }
  return [String(reasons)];
}

/**
 * Normalizes any numerical array (e.g. perSegment fields)
 */
export function normalizeArray(arr) {
  if (!arr) return [];
  if (Array.isArray(arr)) return arr;
  return [arr];
}
