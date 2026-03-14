export const API_BASE = 'http://localhost:3001/api';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!res.ok) {
    throw new Error(`API Error: ${res.statusText}`);
  }
  
  const json = await res.json();
  if (!json.success && json.error) {
    throw new Error(json.error);
  }
  
  return json;
}

export const api = {
  // Feedback
  getFeedback: () =>
    fetchApi<any>('/feedback'),

  // BRDs
  getBrds: (status?: string) => 
    fetchApi<any>(`/brds${status ? `?status=${status}` : ''}`),
  getBrd: (id: string) => 
    fetchApi<any>(`/brds/${id}`),
  approveBrd: (id: string, edits?: string, actor?: string) => 
    fetchApi<any>(`/brds/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ edits, actor }),
    }),
  rejectBrd: (id: string, reason?: string, actor?: string) => 
    fetchApi<any>(`/brds/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason, actor }),
    }),

  // Priority
  getPriorities: () => 
    fetchApi<any>('/priority'),
  updatePriorities: (ids: string[]) => 
    fetchApi<any>('/priority', {
      method: 'PATCH',
      body: JSON.stringify({ orderedIds: ids }),
    }),
  finalizePriorities: (selectedIds: string[]) => 
    fetchApi<any>('/priority/finalize', {
      method: 'POST',
      body: JSON.stringify({ selectedIds }),
    }),

  // Epics
  getEpics: () => 
    fetchApi<any>('/epics'),
  getEpic: (id: string) => 
    fetchApi<any>(`/epics/${id}`),

  // Pipeline Status
  getPipelineStatus: () => 
    fetchApi<any>('/pipeline/status'),
  getPipelineSummary: () =>
    fetchApi<any>('/pipeline/summary'),
  triggerPipeline: (source?: string) => 
    fetchApi<any>('/pipeline/trigger', {
      method: 'POST',
      body: JSON.stringify(source ? { source } : {}),
    }),
};
