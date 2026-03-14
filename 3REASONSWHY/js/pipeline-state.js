/* ═══════════════════════════════════════════════
   PIPELINE STATE MACHINE (v2)
   ═══════════════════════════════════════════════ */

const PipelineState = {
  runId: CONFIG.runId,
  config: {
    sources: [],
    dateWindow: '30d',
    model: 'claude-opus-4',
    clustering: 'bertopic',
    brdTemplate: 'enterprise-v2.1',
    confidenceThreshold: 0.75,
    maxClusters: 10,
    hitlEnabled: true,
    investValidation: true,
  },
  configConfirmed: false,
  stages: {
    scraper:  { status: 'locked', output: null, completedAt: null },
    cleaner:  { status: 'locked', output: null, completedAt: null },
    analyst:  { status: 'locked', output: null, completedAt: null },
    critic:   { status: 'locked', output: null, completedAt: null },
    pmAgent:  { status: 'locked', output: null, completedAt: null, overridePanelOpen: false, finalized: false },
    poAgent:  { status: 'locked', output: null, completedAt: null },
    saAgent:  { status: 'locked', output: null, completedAt: null },
  },
  brdReport: null,
  forwardedToPM: false,

  confirmConfig(configObj) {
    Object.assign(this.config, configObj);
    this.configConfirmed = true;
    this.stages.scraper.status = 'idle';
  },

  resetPipeline() {
    this.configConfirmed = false;
    Object.keys(this.stages).forEach(k => {
      this.stages[k] = { status: 'locked', output: null, completedAt: null };
    });
    this.brdReport = null;
    this.forwardedToPM = false;
  },

  unlock(stageName) { this.stages[stageName].status = 'idle'; },
  start(stageName) { this.stages[stageName].status = 'running'; },
  complete(stageName, output) {
    this.stages[stageName].status = 'complete';
    this.stages[stageName].output = output;
    this.stages[stageName].completedAt = new Date().toISOString();
  },
  isUnlocked(stageName) { return this.stages[stageName].status !== 'locked'; },
  getStatus(stageName) { return this.stages[stageName].status; },
  hasAnyRun() {
    return Object.values(this.stages).some(s => s.status === 'complete' || s.status === 'running');
  },
};
