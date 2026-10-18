/**
 * API Service for Bearing Condition Monitoring
 *
 * Communicates with the Express backend when VITE_USE_BACKEND_API=true,
 * with automatic fallback to static bundled JSON results if the backend is offline.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const USE_BACKEND_API = import.meta.env.VITE_USE_BACKEND_API === 'true';

// 4 bundled records
export const BUNDLED_RECORDS = [
  { id: '97', fileName: '97.mat', knownCondition: 'Healthy', source: 'bundled', status: 'done' },
  { id: '105', fileName: '105.mat', knownCondition: 'Inner Race', source: 'bundled', status: 'done' },
  { id: '118', fileName: '118.mat', knownCondition: 'Ball', source: 'bundled', status: 'done' },
  { id: '130', fileName: '130.mat', knownCondition: 'Outer Race', source: 'bundled', status: 'done' }
];

let backendReachable = true;

export function isBackendReachable() {
  return backendReachable;
}

/**
 * Health check
 * Returns system status, MATLAB availability, and queue counters.
 */
export async function getHealth() {
  if (USE_BACKEND_API) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      if (!res.ok) throw new Error(`Health check returned status ${res.status}`);
      const data = await res.json();
      backendReachable = true;
      return { ...data, offline: false };
    } catch (err) {
      backendReachable = false;
      return {
        status: 'offline',
        matlab: { available: false },
        queue: { running: 0, waiting: 0 },
        offline: true,
        error: err.message
      };
    }
  }

  // Pure static mode
  return {
    status: 'ok',
    matlab: { available: false },
    queue: { running: 0, waiting: 0 },
    offline: true,
    mode: 'stored'
  };
}

/**
 * Get available vibration records (bundled + completed uploads)
 */
export async function getRecords() {
  if (USE_BACKEND_API) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/records`);
      if (!res.ok) throw new Error(`Records request failed (${res.status})`);
      const data = await res.json();
      backendReachable = true;
      return { records: data, isOffline: false };
    } catch (err) {
      backendReachable = false;
      console.warn('[API] Backend unreachable. Falling back to static bundled records:', err.message);
      return { records: BUNDLED_RECORDS, isOffline: true };
    }
  }

  // Pure static mode
  return { records: BUNDLED_RECORDS, isOffline: true };
}

/**
 * Get analysis result for a record ID
 */
export async function getAnalysis(id) {
  if (USE_BACKEND_API) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/analyses/${encodeURIComponent(id)}`);
      if (res.status === 404) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Record not found');
      }
      if (res.status === 409) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Analysis in progress or failed');
      }
      if (!res.ok) {
        throw new Error(`Failed to load analysis for record ${id} (${res.status})`);
      }
      backendReachable = true;
      return await res.json();
    } catch (err) {
      // If network failure and this is a bundled record, try static file fallback
      const isBundled = BUNDLED_RECORDS.some((r) => String(r.id) === String(id));
      if (isBundled && (err.name === 'TypeError' || err.message.includes('fetch'))) {
        backendReachable = false;
        console.warn(`[API] Backend unreachable for record ${id}, loading static sample...`);
        return await loadStaticAnalysis(id);
      }
      throw err;
    }
  }

  // Pure static mode
  return await loadStaticAnalysis(id);
}

/**
 * Fallback loader for static public JSON files
 */
async function loadStaticAnalysis(id) {
  try {
    const res = await fetch(`/sample_results/${encodeURIComponent(id)}.json`);
    if (res.status === 404 || !res.ok) {
      throw new Error(`Record ${id} not found. Analysis file /sample_results/${id}.json has not been generated yet.`);
    }
    return await res.json();
  } catch (err) {
    throw new Error(err.message || `Record ${id} not found`);
  }
}

/**
 * Upload a .mat file for background MATLAB analysis
 */
export async function uploadAnalysis(file, { rpm, fs } = {}) {
  const formData = new FormData();
  formData.append('file', file);
  if (rpm !== undefined && rpm !== null && String(rpm).trim() !== '') {
    formData.append('rpm', String(rpm).trim());
  }
  if (fs !== undefined && fs !== null && String(fs).trim() !== '') {
    formData.append('fs', String(fs).trim());
  }

  const res = await fetch(`${API_BASE_URL}/api/analyses`, {
    method: 'POST',
    body: formData
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 202) {
    return data; // { id, status: 'queued' }
  }

  throw new Error(data.error || `Upload failed with status ${res.status}`);
}

/**
 * Poll the analysis job status
 */
export async function getJobStatus(id) {
  if (USE_BACKEND_API) {
    const res = await fetch(`${API_BASE_URL}/api/analyses/${encodeURIComponent(id)}/status`);
    if (res.status === 404) {
      throw new Error('Record not found');
    }
    if (!res.ok) {
      throw new Error(`Failed to fetch job status (${res.status})`);
    }
    return await res.json();
  }

  // Static mode
  return { id, status: 'done', startedAt: null, finishedAt: null };
}
