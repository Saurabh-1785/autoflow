/* ═══════════════════════════════════════════════
   UI HELPERS (v2 — Zone-Based)
   ═══════════════════════════════════════════════ */

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function appendTerminalLine(terminal, text) {
  const line = document.createElement('div');
  line.className = 'line';
  line.textContent = text;
  terminal.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;
}

function animateCounter(elementId, start, end, duration) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const startTime = performance.now();
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.round(start + (end - start) * progress);
    el.textContent = value.toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

/* ─── Config Panel ─── */

function readConfigFromForm() {
  const sources = [];
  document.querySelectorAll('#source-grid input[type=checkbox]').forEach(cb => {
    if (cb.checked) sources.push(cb.value);
  });
  return {
    sources: sources,
    dateWindow: document.getElementById('date-window').value,
    model: document.getElementById('cfg-model').value,
    clustering: document.getElementById('cfg-clustering').value,
    brdTemplate: document.getElementById('cfg-template').value,
    maxClusters: parseInt(document.getElementById('cfg-clusters').value),
    confidenceThreshold: parseFloat(document.getElementById('cfg-threshold').value),
    hitlEnabled: document.getElementById('cfg-hitl').checked,
    investValidation: document.getElementById('cfg-invest').checked,
  };
}

function collapseConfigPanel() {
  document.getElementById('config-panel').classList.add('collapsed');
  const bar = document.getElementById('config-summary-bar');
  const cfg = PipelineState.config;
  bar.querySelector('.summary-text').innerHTML =
    '<span class="confirmed-label">Configuration confirmed</span>' +
    '<span>|</span> Sources: ' + cfg.sources.length +
    ' <span>|</span> Window: ' + cfg.dateWindow.replace('d', ' days') +
    ' <span>|</span> Model: ' + cfg.model +
    ' <span>|</span> Threshold: ' + cfg.confidenceThreshold.toFixed(2);
  bar.classList.add('visible');
}

function expandConfigPanel() {
  document.getElementById('config-panel').classList.remove('collapsed');
  document.getElementById('config-summary-bar').classList.remove('visible');
}

function showResetWarning() {
  document.getElementById('reset-dialog').classList.add('show');
}

function hideResetWarning() {
  document.getElementById('reset-dialog').classList.remove('show');
}

function handleEditConfig() {
  if (PipelineState.hasAnyRun()) {
    showResetWarning();
  } else {
    expandConfigPanel();
    lockPipelineZone();
  }
}

function confirmResetAndEdit() {
  hideResetWarning();
  resetPipelineUI();
  PipelineState.resetPipeline();
  expandConfigPanel();
  lockPipelineZone();
  // Reset Generate BRD button
  const btn = document.getElementById('btn-generate');
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="play" style="width:14px;height:14px"></i> Generate BRD';
    btn.style.background = '';
    btn.style.color = '';
    btn.classList.remove('success');
    if (window.lucide) lucide.createIcons();
  }
}

/* ─── Zone Locking ─── */

function lockPipelineZone() {
  document.getElementById('pipeline-zone').style.display = 'none';
}

function unlockPipelineZone() {
  document.getElementById('pipeline-zone').style.display = '';
  document.getElementById('pzh-status').textContent = 'Ready';
}

function lockSection(stage) {
  const sec = document.getElementById('section-' + stage);
  if (sec) sec.classList.add('locked');
}

function unlockSection(stage) {
  const sec = document.getElementById('section-' + stage);
  if (sec) sec.classList.remove('locked');
  // Update badge
  const badge = document.getElementById('badge-' + stage);
  if (badge) { badge.className = 'status-badge idle'; badge.textContent = 'IDLE'; }
}

/* ─── Agent Section UI ─── */

function updateSectionHeader(stage, status) {
  const header = document.getElementById('ash-' + stage);
  if (!header) return;
  header.className = 'agent-section-header' + (status === 'running' ? ' running' : status === 'complete' ? ' complete' : '');
}

function updateBadge(stage, status) {
  const badge = document.getElementById('badge-' + stage);
  if (!badge) return;
  badge.className = 'status-badge ' + status;
  badge.textContent = status === 'running' ? 'RUNNING' : status === 'complete' ? 'COMPLETE' : status === 'locked' ? 'LOCKED' : 'IDLE';
}

function showAgentBody(stage) {
  const body = document.getElementById('body-' + stage);
  if (body) body.classList.add('visible');
}

function showOutputBar(stage, html) {
  const bar = document.getElementById('output-' + stage);
  if (bar) { bar.innerHTML = html; bar.classList.add('visible'); }
}

/* ─── Pipeline Stepper ─── */

function completeStep(stepNum) {
  const circle = document.getElementById('sc-' + stepNum);
  const label = document.getElementById('sl-' + stepNum);
  if (circle) { circle.className = 'step-circle done'; circle.textContent = '\u2713'; }
  if (label) { label.className = 'step-label done'; }
  if (stepNum > 0) {
    const conn = document.getElementById('conn-' + (stepNum - 1) + '-' + stepNum);
    if (conn) conn.className = 'step-connector done';
  }
  const nextCircle = document.getElementById('sc-' + (stepNum + 1));
  const nextLabel = document.getElementById('sl-' + (stepNum + 1));
  if (nextCircle && !nextCircle.classList.contains('ghost')) { nextCircle.classList.add('active'); }
  if (nextLabel && !nextLabel.classList.contains('ghost')) { nextLabel.classList.add('active'); }
}

/* ─── Right Panel ─── */

function updateRPAgent(stage, status) {
  const dot = document.getElementById('rp-dot-' + stage);
  const label = document.getElementById('rp-status-' + stage);
  if (dot) {
    dot.className = 'dot ' + (status === 'complete' ? 'complete' : 'idle');
    dot.style.animation = status === 'running' ? 'pulse 1.5s infinite' : '';
  }
  if (label) {
    label.textContent = status === 'complete' ? 'Complete' : status === 'running' ? 'Running...' : 'Idle';
    label.style.color = status === 'complete' ? 'var(--color-success)' : status === 'running' ? 'var(--color-primary)' : 'var(--color-idle)';
  }
}

function updateN8nStatus(num, time) {
  const el = document.getElementById('rp-n8n-' + num);
  if (el) el.querySelector('.value').innerHTML = '<span style="color:var(--color-success)">Last run: ' + time + '</span>';
}

/* ─── Mini stepper ─── */
function updateMiniStep(id, status) {
  const dot = document.getElementById(id);
  if (!dot) return;
  dot.classList.remove('active', 'done');
  if (status === 'done') dot.classList.add('done');
  if (status === 'active') dot.classList.add('active');
}

/* ─── Theme Tags ─── */
function showThemeTags() {
  const container = document.getElementById('theme-tags');
  container.classList.add('visible');
  container.innerHTML = '';
  THEMES.forEach(t => {
    const tag = document.createElement('div');
    tag.className = 'theme-tag';
    tag.style.background = t.bg;
    tag.style.color = t.color;
    tag.textContent = t.name;
    container.appendChild(tag);
  });
}

/* ─── Toast ─── */
function showToast(title, bodyHtml) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = '<div class="toast-title">' + title + '</div><div class="toast-body">' + bodyHtml + '</div>';
  container.appendChild(toast);
  requestAnimationFrame(() => { toast.classList.add('show'); });
  toast.onclick = () => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); };
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 5000);
}

/* ─── BRD Zone ─── */
function revealBRDZone() {
  const zone = document.getElementById('brd-zone');
  zone.classList.add('visible');
}

/* ─── Forward Panel ─── */
function selectDelivery(el, method) {
  document.querySelectorAll('.delivery-pill').forEach(p => p.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('jira-options-wrap').style.display = method === 'jira' ? 'block' : 'none';
}

function scrollToEl(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ─── Reset Pipeline UI ─── */
function resetPipelineUI() {
  ['scraper', 'cleaner', 'analyst'].forEach(stage => {
    updateRPAgent(stage, 'idle');
  });
  updateRPAgent('critic', 'idle');
  updateRPAgent('pm', 'idle');
  // Reset stepper (6 steps: 0-5)
  for (let i = 0; i <= 5; i++) {
    const c = document.getElementById('sc-' + i);
    const l = document.getElementById('sl-' + i);
    if (c) { c.className = 'step-circle'; c.textContent = '' + i; }
    if (l) { l.className = 'step-label'; }
  }
  // Reset mini stepper
  ['ms-config', 'ms-scrape', 'ms-clean', 'ms-analyse', 'ms-critic', 'ms-prioritize'].forEach(id => updateMiniStep(id, ''));
  // Reset right panel stats
  ['rp-raw', 'rp-clean', 'rp-reduction', 'rp-themes', 'rp-features', 'rp-stories', 'rp-conf', 'rp-qa-score', 'rp-qa-flags', 'rp-wsjf-top', 'rp-overrides'].forEach(id => {
    const el = document.getElementById(id); if (el) el.textContent = '\u2014';
  });
  const ps = document.getElementById('rp-pipeline-stage'); if (ps) ps.textContent = '0 / 5';
  // Hide BRD zone
  const bz = document.getElementById('brd-zone');
  if (bz) bz.classList.remove('visible');
  // Hide HITL & override sections
  const hs = document.getElementById('hitl-section'); if (hs) hs.style.display = 'none';
  const os = document.getElementById('override-section'); if (os) os.style.display = 'none';
  // Reset WSJF tbody
  const tbody = document.getElementById('pm-wsjf-tbody');
  if (tbody) tbody.innerHTML = '';
}

