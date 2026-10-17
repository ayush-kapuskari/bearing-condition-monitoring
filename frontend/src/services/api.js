/**
 * API Service for Bearing Condition Monitoring
 * 
 * SCOPE:
 * Currently reads from static files while the Express backend is offline:
 * - Records list: hard-coded array of the 4 bundled records
 * - Analyses: loaded from /sample_results/{id}.json (Vite public directory)
 * 
 * When switching to the Express backend, update USE_BACKEND_API to true
 * or configure VITE_USE_BACKEND_API=true in .env.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const USE_BACKEND_API = import.meta.env.VITE_USE_BACKEND_API === 'true';

// Bundled records list
export const BUNDLED_RECORDS = [
  { id: '97', fileName: '97.mat', knownCondition: 'Healthy' },
  { id: '105', fileName: '105.mat', knownCondition: 'Inner Race' },
  { id: '118', fileName: '118.mat', knownCondition: 'Ball' },
  { id: '130', fileName: '130.mat', knownCondition: 'Outer Race' }
];

/**
 * Health check
 */
export async function getHealth() {
  if (USE_BACKEND_API) {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    return await res.json();
  }
  return { status: 'ok', mode: 'stored' };
}

/**
 * Get available vibration records
 */
export async function getRecords() {
  if (USE_BACKEND_API) {
    const res = await fetch(`${API_BASE_URL}/api/records`);
    if (!res.ok) throw new Error(`Failed to fetch records: ${res.status}`);
    return await res.json();
  }
  // Offline static mode
  return Promise.resolve(BUNDLED_RECORDS);
}

/**
 * Get analysis result for a specific record ID
 */
export async function getAnalysis(id) {
  if (USE_BACKEND_API) {
    const res = await fetch(`${API_BASE_URL}/api/analyses/${encodeURIComponent(id)}`);
    if (res.status === 404) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Record not found');
    }
    if (!res.ok) throw new Error(`Failed to load analysis for record ${id} (${res.status})`);
    return await res.json();
  }

  // Offline static mode: load from public/sample_results/{id}.json
  try {
    const res = await fetch(`/sample_results/${encodeURIComponent(id)}.json`);
    if (res.status === 404 || !res.ok) {
      throw new Error(`Record ${id} not found. Analysis file /sample_results/${id}.json has not been generated yet.`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    throw new Error(err.message || `Record ${id} not found`);
  }
}
