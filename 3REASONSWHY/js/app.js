/* ═══════════════════════════════════════════════
   APP ORCHESTRATOR (v6) — Unified 5-Stage Pipeline
   Single "Generate Ranked BRD" triggers all agents
   ═══════════════════════════════════════════════ */

function resetToDefaults() {
  document.querySelectorAll('#source-grid input[type=checkbox]').forEach(cb => cb.checked = true);
  document.getElementById('date-window').value = '30d';
  document.getElementById('cfg-model').value = 'claude-opus-4';
  document.getElementById('cfg-clustering').value = 'bertopic';
  document.getElementById('cfg-template').value = 'enterprise-v2.1';
  document.getElementById('cfg-clusters').value = '10';
  document.getElementById('cfg-threshold').value = '0.75';
  document.getElementById('threshold-val').textContent = '0.75';
  document.getElementById('cfg-hitl').checked = true;
  document.getElementById('cfg-invest').checked = true;
}
function selectAll() { document.querySelectorAll('#source-grid input[type=checkbox]').forEach(cb => cb.checked = true); }
function clearAll() { document.querySelectorAll('#source-grid input[type=checkbox]').forEach(cb => cb.checked = false); }

function showCompactProgress() { const cp = document.getElementById('compact-progress'); if (cp) cp.style.display = ''; }
function hideCompactProgress() { const cp = document.getElementById('compact-progress'); if (cp) cp.style.display = 'none'; }
function updateCompactProgress(pct, stage, title) {
  const bar = document.getElementById('master-progress');
  const pctEl = document.getElementById('cp-pct');
  const stageEl = document.getElementById('cp-stage');
  const titleEl = document.getElementById('cp-title');
  if (bar) bar.style.width = pct + '%';
  if (pctEl) pctEl.textContent = Math.round(pct) + '%';
  if (stageEl) stageEl.textContent = stage;
  if (titleEl && title) titleEl.textContent = title;
}
function updateCompactStage(name, status) {
  const el = document.getElementById('cps-' + name);
  if (el) el.className = 'cp-stage-item ' + status;
}
function updatePipelineStage(n) {
  const el = document.getElementById('rp-pipeline-stage');
  if (el) el.textContent = n + ' / 5';
}

/* ─── Unified Pipeline: Generate Ranked BRD ─── */
async function generateBRD() {
  const cfg = readConfigFromForm();
  if (cfg.sources.length === 0) { showToast('Error', 'Select at least one source.'); return; }

  PipelineState.confirmConfig(cfg);
  const btn = document.getElementById('btn-generate');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Running pipeline...';

  collapseConfigPanel();
  completeStep(0);
  updateMiniStep('ms-config', 'done');
  AutoFlowEvents.emit('config:confirmed', cfg);
  showCompactProgress();
  scrollToEl('compact-progress');

  // ─── STAGE 1: SCRAPER ───
  updateCompactProgress(5, 'Scraping from ' + cfg.sources.length + ' sources...', 'Generating Ranked BRD...');
  updateCompactStage('scraper', 'running');
  updateMiniStep('ms-scrape', 'active');
  updatePipelineStage(1);

  await ScraperAgent.run(
    (s) => updateRPAgent('scraper', s),
    () => {
      animateCounter('rp-raw', 0, CONFIG.rawRecords, 1000);
      updateN8nStatus(1, '10:42 AM');
      completeStep(1); updateMiniStep('ms-scrape', 'done'); updateCompactStage('scraper', 'complete');
    }
  );
  updateCompactProgress(20, 'Cleaning data...');
  await delay(300);

  // ─── STAGE 2: CLEANER ───
  updateCompactStage('cleaner', 'running');
  updateMiniStep('ms-clean', 'active');
  updatePipelineStage(2);

  await CleanerAgent.run(
    (s) => updateRPAgent('cleaner', s),
    () => {
      animateCounter('rp-clean', 0, CONFIG.cleanRecords, 1000);
      document.getElementById('rp-reduction').textContent = '57.7%';
      updateN8nStatus(2, '10:42 AM');
      completeStep(2); updateMiniStep('ms-clean', 'done'); updateCompactStage('cleaner', 'complete');
    }
  );
  updateCompactProgress(40, 'Analyzing & generating BRD...');
  await delay(300);

  // ─── STAGE 3: ANALYST ───
  updateCompactStage('analyst', 'running');
  updateMiniStep('ms-analyse', 'active');
  updatePipelineStage(3);

  await AnalystAgent.run(
    (s) => updateRPAgent('analyst', s),
    () => {
      animateCounter('rp-themes', 0, CONFIG.totalThemes, 800);
      document.getElementById('rp-features').textContent = CONFIG.featuresGenerated;
      document.getElementById('rp-stories').textContent = CONFIG.userStories;
      document.getElementById('rp-conf').textContent = CONFIG.confidence.toString();
      updateN8nStatus(3, '10:43 AM');
      completeStep(3); updateMiniStep('ms-analyse', 'done'); updateCompactStage('analyst', 'complete');
    }
  );
  updateCompactProgress(60, 'Running Critic QA validation...');
  await delay(300);

  // ─── STAGE 4: CRITIC ───
  updateCompactStage('critic', 'running');
  updateMiniStep('ms-critic', 'active');
  updatePipelineStage(4);

  await CriticAgent.run(
    (s) => updateRPAgent('critic', s),
    (result) => {
      document.getElementById('rp-qa-score').textContent = result.qaScore;
      document.getElementById('rp-qa-flags').textContent = result.flags.length;
      updateN8nStatus(4, '10:44 AM');
      completeStep(4); updateMiniStep('ms-critic', 'done'); updateCompactStage('critic', 'complete');
    }
  );
  updateCompactProgress(80, 'Scoring & ranking features (WSJF)...');
  await delay(300);

  // ─── STAGE 5: PRIORITIZER ───
  updateCompactStage('prioritizer', 'running');
  updateMiniStep('ms-prioritize', 'active');
  updatePipelineStage(5);

  await PMAgent.run(
    (s) => updateRPAgent('pm', s === 'scoring-complete' ? 'complete' : s),
    (result) => {
      document.getElementById('rp-wsjf-top').textContent = 'Perf. (8.4)';
      document.getElementById('rp-overrides').textContent = '0';
      updateN8nStatus(5, '10:45 AM');
      completeStep(5); updateMiniStep('ms-prioritize', 'done'); updateCompactStage('prioritizer', 'complete');
    }
  );

  // ─── PIPELINE COMPLETE ───
  updateCompactProgress(100, 'Ranked BRD generated successfully', 'Complete');
  const cp = document.getElementById('compact-progress');
  if (cp) cp.classList.add('done');

  btn.classList.add('success');
  btn.innerHTML = '✓ Ranked BRD Generated';
  document.getElementById('run-status').textContent = 'Complete';

  await delay(800);
  hideCompactProgress();

  // Render full BRD output
  renderBRD();
  setTimeout(() => {
    revealBRDZone();
    // Show HITL flags
    const hs = document.getElementById('hitl-section');
    if (hs) hs.style.display = '';
    // Show override panel
    const os = document.getElementById('override-section');
    if (os) os.style.display = '';
    // Initialize override panel
    initOverridePanel(PMAgent.currentOrder);
    scrollToEl('brd-zone');
  }, 400);

  AutoFlowEvents.emit('pipeline:complete', { qaScore: 0.91, features: 6 });
}

/* ─── Init ─── */
function init() {
  if (window.lucide) lucide.createIcons();
  const slider = document.getElementById('cfg-threshold');
  if (slider) {
    slider.addEventListener('input', function() {
      document.getElementById('threshold-val').textContent = parseFloat(this.value).toFixed(2);
    });
  }
  AutoFlowEvents.on('config:confirmed', (d) => console.log('[EventBus] config:confirmed', d));
  AutoFlowEvents.on('critic:complete', (d) => console.log('[EventBus] critic:complete', d));
  AutoFlowEvents.on('pm:prioritized', (d) => console.log('[EventBus] pm:prioritized', d));
  AutoFlowEvents.on('pipeline:complete', (d) => console.log('[EventBus] pipeline:complete', d));
}
document.addEventListener('DOMContentLoaded', init);
