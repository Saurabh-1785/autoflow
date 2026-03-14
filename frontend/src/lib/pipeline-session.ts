const PIPELINE_RUN_KEY = 'autoflow.pipeline.hasRun';

export function markPipelineRun(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(PIPELINE_RUN_KEY, '1');
}

export function hasPipelineRunInSession(): boolean {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem(PIPELINE_RUN_KEY) === '1';
}

export function clearPipelineRunSession(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(PIPELINE_RUN_KEY);
}
