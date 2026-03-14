/* ═══════════════════════════════════════════════
   PM PRIORITIZER AGENT (Stage 5 — Feature Prioritization)
   PRODUCTION INTEGRATION POINT:
     Replace simulateRun() with:
     fetch('https://n8n.autoflow.io/webhook/pm-agent-trigger', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         brdId: runId,
         features: PipelineState.stages.analyst.output.features,
         okrEmbeddings: CONFIG.okrEmbeddings,
         sourceWeights: CONFIG.sourceWeights
       })
     })
     n8n Sub-Workflow 5: Feature Prioritization
     Trigger: Webhook OR N new BRDs approved (configurable threshold, default 5)
     Nodes: Fetch approved BRDs
            → Python Script (WSJF scoring + strategic alignment)
            → Sort by WSJF score
            → HTTP Request (Frontend notification — override window opens)
            → Wait Node (24h configurable)
            → Webhook (override input received from frontend)
            → Merge overrides
            → Finalize priority list
     Expected response: {
       rankedFeatures[], wsjfScores{}, overridesApplied, finalRanking[]
     }
   ═══════════════════════════════════════════════ */

const PMAgent = {
  logLines: [
    '[10:45:01] PM Prioritizer Agent initialized. Input: 6 features',
    '[10:45:02] Loading WSJF scoring model v1.0...',
    '[10:45:03] Fetching source weighting rules (enterprise 3x multiplier)...',
    '[10:45:04] Loading strategic alignment OKR embeddings (Q1 2026)...',
  ],
  featureScoreLines: [
    {
      log: '[10:45:05] Scoring F-001: System Performance Optimization\n[10:45:05]   Business Value: 9  |  Time Criticality: 8  |  Risk Reduction: 7  |  Effort: 5\n[10:45:06]   Source weight multiplier: 2.1x (62% enterprise reviews)\n[10:45:06]   Sentiment intensity flag: YES (sentiment -0.72, threshold -0.65) → Priority elevated\n[10:45:07]   Strategic alignment score: 0.91 (HIGH — aligns with Q1 OKR: Platform Reliability)\n[10:45:07]   Final WSJF: 8.4',
      feature: { rank: 1, name: 'System Performance Optimization', bv: 9, tc: 8, rr: 7, effort: 5, wsjf: 8.4, sentimentFlag: true, alignment: 0.91, priority: 'Critical', priorityClass: 'critical' },
    },
    {
      log: '[10:45:08] Scoring F-002: Onboarding Flow Redesign\n[10:45:08]   Business Value: 8  |  Time Criticality: 7  |  Risk Reduction: 6  |  Effort: 6\n[10:45:09]   Source weight multiplier: 1.8x (51% enterprise reviews via support tickets)\n[10:45:09]   Sentiment intensity flag: NO (sentiment -0.61)\n[10:45:10]   Strategic alignment score: 0.87 (HIGH — aligns with Q1 OKR: User Activation)\n[10:45:10]   Final WSJF: 7.2',
      feature: { rank: 2, name: 'Onboarding Flow Redesign', bv: 8, tc: 7, rr: 6, effort: 6, wsjf: 7.2, sentimentFlag: false, alignment: 0.87, priority: 'High', priorityClass: 'high' },
    },
    {
      log: '[10:45:11] Scoring F-003: Mobile App Stability...\n[10:45:11]   BV: 8 | TC: 7 | RR: 7 | E: 7 | Sentiment: 🔴 Elevated | Alignment: 0.84\n[10:45:11]   Final WSJF: 6.8',
      feature: { rank: 3, name: 'Mobile App Stability', bv: 8, tc: 7, rr: 7, effort: 7, wsjf: 6.8, sentimentFlag: true, alignment: 0.84, priority: 'High', priorityClass: 'high' },
    },
    {
      log: '[10:45:12] Scoring F-004: Billing Transparency Dashboard...\n[10:45:12]   BV: 7 | TC: 6 | RR: 6 | E: 6 | Sentiment: — | Alignment: 0.79\n[10:45:12]   Final WSJF: 5.9',
      feature: { rank: 4, name: 'Billing Transparency Dashboard', bv: 7, tc: 6, rr: 6, effort: 6, wsjf: 5.9, sentimentFlag: false, alignment: 0.79, priority: 'Medium', priorityClass: 'medium' },
    },
    {
      log: '[10:45:13] Scoring F-005: Integration Expansion...\n[10:45:13]   BV: 6 | TC: 5 | RR: 5 | E: 6 | Sentiment: — | Alignment: 0.72\n[10:45:13]   Final WSJF: 5.1',
      feature: { rank: 5, name: 'Integration Expansion', bv: 6, tc: 5, rr: 5, effort: 6, wsjf: 5.1, sentimentFlag: false, alignment: 0.72, priority: 'Medium', priorityClass: 'medium' },
    },
    {
      log: '[10:45:14] Scoring F-006: Enhanced Data Export...\n[10:45:14]   BV: 5 | TC: 4 | RR: 4 | E: 6 | Sentiment: — | Alignment: 0.68\n[10:45:14]   Final WSJF: 4.3',
      feature: { rank: 6, name: 'Enhanced Data Export', bv: 5, tc: 4, rr: 4, effort: 6, wsjf: 4.3, sentimentFlag: false, alignment: 0.68, priority: 'Low', priorityClass: 'low' },
    },
  ],
  closingLines: [
    '[10:45:15] Ranking features by WSJF score (descending)...',
    '[10:45:16] Applying 24-hour human override window...',
    '[10:45:16] Human Override Panel activated. Waiting for PM input (24h window open).',
    '[10:45:17] ✓ PM Prioritizer Agent complete. Ranked list ready for human review.',
  ],

  overrideLog: [],
  currentOrder: [], // populated at run

  async simulateRun() {
    const term = document.getElementById('term-pm');
    if (term) term.innerHTML = '';

    // Phase 1: Initialization lines
    for (let i = 0; i < this.logLines.length; i++) {
      await delay(400 + Math.random() * 300);
      if (term) appendTerminalLine(term, this.logLines[i]);
    }

    // Phase 2: Feature scoring (one by one with table row reveal)
    const table = document.getElementById('pm-wsjf-tbody');
    this.currentOrder = [];
    for (let i = 0; i < this.featureScoreLines.length; i++) {
      await delay(800 + Math.random() * 400);
      const entry = this.featureScoreLines[i];
      // Log lines (multi-line)
      entry.log.split('\n').forEach(line => {
        if (term) appendTerminalLine(term, line);
      });
      // Add table row
      if (table) {
        const f = entry.feature;
        const flagHtml = f.sentimentFlag ? '<span style="color:var(--color-danger);font-weight:600">🔴 Elevated</span>' : '<span style="color:var(--color-text-secondary)">—</span>';
        const row = document.createElement('tr');
        row.className = 'pm-wsjf-row reveal';
        row.innerHTML = '<td>' + f.rank + '</td>' +
          '<td>' + f.name + '</td>' +
          '<td class="mono-cell">' + f.bv + '</td>' +
          '<td class="mono-cell">' + f.tc + '</td>' +
          '<td class="mono-cell">' + f.rr + '</td>' +
          '<td class="mono-cell">' + f.effort + '</td>' +
          '<td class="mono-cell wsjf-highlight">' + f.wsjf.toFixed(1) + '</td>' +
          '<td>' + flagHtml + '</td>' +
          '<td class="mono-cell">' + f.alignment.toFixed(2) + '</td>' +
          '<td><span class="priority-label ' + f.priorityClass + '">' + f.priority + '</span></td>';
        table.appendChild(row);
        requestAnimationFrame(() => row.classList.add('visible'));
      }
      this.currentOrder.push({ ...entry.feature, originalRank: entry.feature.rank, overridden: false });
    }

    // Show WSJF table
    const wsjfTable = document.getElementById('pm-wsjf-table');
    if (wsjfTable) wsjfTable.style.display = '';

    // Phase 3: Closing lines
    for (let i = 0; i < this.closingLines.length; i++) {
      await delay(400 + Math.random() * 300);
      if (term) appendTerminalLine(term, this.closingLines[i]);
    }

    // Show override panel
    initOverridePanel(this.currentOrder);

    return {
      rankedFeatures: this.currentOrder,
      wsjfScores: {},
      overridesApplied: 0,
      finalRanking: this.currentOrder.map(f => f.name),
    };
  },

  async run(onStatusChange, onComplete) {
    onStatusChange('running');
    PipelineState.start('pmAgent');
    const result = await this.simulateRun();
    PipelineState.complete('pmAgent', result);
    onStatusChange('scoring-complete');
    onComplete(result);
    AutoFlowEvents.emit('pm:scoring-complete', result);
  },
};

/* ═══════════════════════════════════════════════
   HUMAN OVERRIDE PANEL — Drag-and-Drop
   ═══════════════════════════════════════════════ */

let overrideItems = [];
let overrideFinalized = false;
let overrideTimerInterval = null;

function initOverridePanel(features) {
  overrideItems = features.map(f => ({ ...f }));
  overrideFinalized = false;

  const panel = document.getElementById('override-panel');
  if (panel) panel.style.display = '';

  renderOverrideList();
  startOverrideTimer();

  // Update PM agent badge to AWAITING
  const badge = document.getElementById('badge-pm');
  if (badge) { badge.className = 'status-badge awaiting'; badge.textContent = 'AWAITING OVERRIDE'; }
}

function renderOverrideList() {
  const container = document.getElementById('override-list');
  if (!container) return;
  container.innerHTML = '';

  overrideItems.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'override-item' + (item.overridden ? ' overridden' : '');
    row.draggable = !overrideFinalized;
    row.dataset.index = index;
    row.innerHTML =
      '<div class="oi-drag">⠿</div>' +
      '<div class="oi-rank">' + (index + 1) + '</div>' +
      '<div class="oi-name">' + item.name + '</div>' +
      '<div class="oi-wsjf">WSJF: ' + item.wsjf.toFixed(1) + '</div>' +
      '<span class="priority-label ' + item.priorityClass + '">' + item.priority + '</span>' +
      (item.overridden ? '<span class="override-badge">Overridden ✎</span>' : '');

    // Drag events
    row.addEventListener('dragstart', handleDragStart);
    row.addEventListener('dragover', handleDragOver);
    row.addEventListener('drop', handleDrop);
    row.addEventListener('dragend', handleDragEnd);

    container.appendChild(row);
  });
}

let draggedIndex = null;

function handleDragStart(e) {
  if (overrideFinalized) return;
  draggedIndex = parseInt(e.currentTarget.dataset.index);
  e.currentTarget.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
  if (overrideFinalized) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const target = e.currentTarget;
  target.classList.add('drag-over');
}

function handleDrop(e) {
  if (overrideFinalized) return;
  e.preventDefault();
  const dropIndex = parseInt(e.currentTarget.dataset.index);
  e.currentTarget.classList.remove('drag-over');

  if (draggedIndex === null || draggedIndex === dropIndex) return;

  // Reorder
  const item = overrideItems.splice(draggedIndex, 1)[0];
  overrideItems.splice(dropIndex, 0, item);

  // Mark overridden items
  overrideItems.forEach((it, i) => {
    it.overridden = (i + 1) !== it.originalRank;
  });

  // Log override
  const movedItem = overrideItems[dropIndex];
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  PMAgent.overrideLog.push({
    time: timeStr,
    text: movedItem.name + ' moved: rank ' + (draggedIndex + 1) + ' → rank ' + (dropIndex + 1) + ' (manual PM override)'
  });

  renderOverrideList();
  renderOverrideLog();
}

function handleDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  document.querySelectorAll('.override-item').forEach(el => el.classList.remove('drag-over'));
}

function renderOverrideLog() {
  const logEl = document.getElementById('override-log');
  if (!logEl) return;
  if (PMAgent.overrideLog.length === 0) {
    logEl.style.display = 'none';
    return;
  }
  logEl.style.display = '';
  logEl.innerHTML = '<div class="ol-title">Override log:</div>' +
    PMAgent.overrideLog.map(entry =>
      '<div class="ol-entry">[' + entry.time + '] ' + entry.text + '</div>'
    ).join('');
}

function resetToAIOrder() {
  if (overrideFinalized) return;
  if (!confirm('Reset all manual overrides? This cannot be undone.')) return;

  overrideItems.sort((a, b) => a.originalRank - b.originalRank);
  overrideItems.forEach(it => { it.overridden = false; });
  PMAgent.overrideLog = [];

  renderOverrideList();
  renderOverrideLog();
}

function finalizePriorityList() {
  overrideFinalized = true;
  if (overrideTimerInterval) clearInterval(overrideTimerInterval);

  const overridesCount = overrideItems.filter(it => it.overridden).length;

  // Lock the override panel
  const panel = document.getElementById('override-panel');
  if (panel) panel.classList.add('finalized');

  // Disable dragging
  document.querySelectorAll('.override-item').forEach(row => {
    row.draggable = false;
    row.querySelector('.oi-drag').style.opacity = '0';
  });

  // Show finalized header
  const header = document.getElementById('finalized-header');
  if (header) {
    header.style.display = '';
    const now = new Date();
    header.querySelector('.fh-text').textContent =
      'PRIORITY LIST FINALIZED | ' + now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) +
      ' at ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) +
      ' | ' + overridesCount + ' manual override' + (overridesCount !== 1 ? 's' : '') + ' applied';
  }

  // Update PM agent badge
  const badge = document.getElementById('badge-pm');
  if (badge) { badge.className = 'status-badge complete'; badge.textContent = 'COMPLETE'; }

  // Update right panel stats
  const rpOverrides = document.getElementById('rp-overrides');
  if (rpOverrides) rpOverrides.textContent = overridesCount;

  // Show output bar
  const output = document.getElementById('pm-output-bar');
  if (output) {
    output.style.display = '';
    output.querySelector('.pm-output-text').textContent =
      '✓  Priority List Finalized  |  6 Features Ranked  |  ' + overridesCount + ' Override Applied  |  Ready for PO Agent';
  }

  // Show forward to PO
  const fpo = document.getElementById('forward-po-panel');
  if (fpo) { fpo.classList.add('visible'); }

  // Update stepper
  completeStep(5);
  updateMiniStep('ms-prioritize', 'done');
  updateMiniStep('ms-forward-po', 'active');

  // Store final ranking
  PipelineState.stages.pmAgent.output.finalRanking = overrideItems.map(f => f.name);
  PipelineState.stages.pmAgent.output.overridesApplied = overridesCount;
  PipelineState.stages.pmAgent.finalized = true;

  AutoFlowEvents.emit('pm:prioritized', { finalRanking: overrideItems, overridesApplied: overridesCount });
}

function startOverrideTimer() {
  const timerEl = document.getElementById('override-timer');
  if (!timerEl) return;

  let totalSeconds = 24 * 60 * 60; // 24 hours
  overrideTimerInterval = setInterval(() => {
    if (overrideFinalized) { clearInterval(overrideTimerInterval); return; }
    totalSeconds--;
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    timerEl.textContent = String(hrs).padStart(2, '0') + ':' + String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0') + ' remaining';
  }, 1000);
}

/* ─── Forward to PO ─── */
function forwardToPO() {
  const btn = document.getElementById('btn-forward-po');
  if (!btn) return;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Forwarding...';

  setTimeout(() => {
    btn.classList.add('success');
    btn.innerHTML = '✓ Forwarded to PO Agent';
    btn.style.background = 'var(--color-success)';
    btn.style.color = '#fff';

    showToast('✓ Priority List Forwarded', 'Jira Epic #AF-PO-2847 created and assigned to Priya Nair.');
    AutoFlowEvents.emit('po:forwarded', { epicId: 'AF-PO-2847' });
  }, 1500);
}
