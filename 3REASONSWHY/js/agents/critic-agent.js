/* ═══════════════════════════════════════════════
   CRITIC AGENT (Stage 4 — BRD Quality Assurance)
   PRODUCTION INTEGRATION POINT:
     Replace simulateRun() with:
     fetch('https://n8n.autoflow.io/webhook/critic-trigger', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ brdId: runId, brdJson: PipelineState.stages.analyst.output.brdJson })
     })
     n8n Sub-Workflow 4: Critic QA Review
     Trigger: Webhook (manual) OR database event on new approved BRD
     Nodes: Fetch BRD → AI Agent (Claude — Critic, INVEST checklist)
            → Code Node (Parse QA score)
            → IF (Score ≥ 0.80?) → Approve / Return for revision with diff
            → Update BRD status in PostgreSQL
     Expected response: {
       qaScore, investScore, contradictionScore, ambiguityScore,
       completenessScore, flags[], approved, brdId
     }
   ═══════════════════════════════════════════════ */

const CriticAgent = {
  logLines: [
    '[10:44:01] Critic Agent initialized. Input: BRD #AF-2026-03-13-001',
    '[10:44:02] Loading INVEST validation ruleset v3.1...',
    '[10:44:03] Running INVEST check on 18 user stories...',
    '[10:44:05]   F-001 US-001: ✓ INVEST PASS',
    '[10:44:05]   F-001 US-002: ✓ INVEST PASS',
    '[10:44:06]   F-001 US-003: ✓ INVEST PASS',
    '[10:44:06]   F-002 US-004: ✓ INVEST PASS',
    '[10:44:07]   F-002 US-005: ⚠ INVEST FLAG — Story not independently deployable. Marked for review.',
    '[10:44:08]   F-002 US-006: ✓ INVEST PASS',
    '[10:44:09]   F-003 US-007: ✓ INVEST PASS',
    '[10:44:09]   F-003 US-008: ✓ INVEST PASS',
    '[10:44:10]   F-003 US-009: ✓ INVEST PASS',
    '[10:44:10]   F-004 US-010: ✓ INVEST PASS',
    '[10:44:11]   F-004 US-011: ✓ INVEST PASS',
    '[10:44:11]   F-004 US-012: ✓ INVEST PASS',
    '[10:44:12]   F-005 US-013: ✓ INVEST PASS',
    '[10:44:12]   F-005 US-014: ✓ INVEST PASS',
    '[10:44:13]   F-005 US-015: ✓ INVEST PASS',
    '[10:44:13]   F-006 US-016: ✓ INVEST PASS',
    '[10:44:14]   F-006 US-017: ✓ INVEST PASS',
    '[10:44:14]   F-006 US-018: ✓ INVEST PASS',
    '[10:44:15]   INVEST result: 17/18 PASS | 1 flagged for review',
    '[10:44:16] Running contradiction detection across all acceptance criteria...',
    '[10:44:18]   No contradictions detected. Consistency score: 1.00',
    '[10:44:19] Running ambiguity scan...',
    '[10:44:20]   F-002 US-005: Flagged term — "intuitive onboarding". Recommended: measurable alternative.',
    '[10:44:21]   F-005 US-013: Flagged term — "seamless integration". Recommended: specify API response time SLA.',
    '[10:44:22]   Ambiguity scan complete. 2 flags raised.',
    '[10:44:23] Running completeness scoring across 6 features...',
    '[10:44:25]   All 6 features: description ✓ | user stories ✓ | acceptance criteria ✓ | traceability ✓',
    '[10:44:26]   Completeness score: 0.97',
    '[10:44:27] Computing overall BRD QA score...',
    '[10:44:28]   INVEST: 0.94 | Contradiction: 1.00 | Ambiguity: 0.88 | Completeness: 0.97',
    '[10:44:29]   Overall QA Score: 0.91 — Threshold: 0.80 — PASS',
    '[10:44:30] ✓ Critic Agent complete. BRD approved with 3 minor flags.',
  ],

  // Milestone indices for UI animations
  milestones: {
    investStart: 2,     // "Running INVEST check..."
    investEnd: 21,      // "INVEST result: 17/18"
    contradictionEnd: 23, // "No contradictions detected"
    ambiguityEnd: 27,   // "Ambiguity scan complete"
    completenessEnd: 30, // "Completeness score: 0.97"
    scoreComputed: 33,  // "Overall QA Score"
  },

  qaResult: {
    qaScore: 0.91,
    investScore: 0.94,
    contradictionScore: 1.00,
    ambiguityScore: 0.88,
    completenessScore: 0.97,
    investPassCount: 17,
    investTotalCount: 18,
    flags: [
      {
        id: 'flag-1',
        feature: 'F-002', story: 'US-005', type: 'INVEST',
        issue: 'Story not independently deployable',
        current: 'As a new user, I want the onboarding steps to guide me intuitively so that I complete setup without assistance.',
        suggested: 'Break into two atomic stories — setup step configuration and progressive guidance overlay.',
        resolved: false, overridden: false,
      },
      {
        id: 'flag-2',
        feature: 'F-002', story: 'US-005', type: 'Ambiguity',
        issue: '"intuitive onboarding"',
        current: 'Term: "intuitive"',
        suggested: 'Recommended replacement: "completable within 8 minutes without support contact"',
        resolved: false, overridden: false,
      },
      {
        id: 'flag-3',
        feature: 'F-005', story: 'US-013', type: 'Ambiguity',
        issue: '"seamless integration"',
        current: 'Term: "seamless"',
        suggested: 'Recommended replacement: "API response time under 300ms with 99.9% uptime SLA"',
        resolved: false, overridden: false,
      },
    ],
    approved: true,
    brdId: 'AF-2026-03-13-001',
  },

  async simulateRun() {
    const term = document.getElementById('term-critic');
    if (term) term.innerHTML = '';

    const totalLines = this.logLines.length;

    for (let i = 0; i < totalLines; i++) {
      await delay(400 + Math.random() * 300);
      if (term) appendTerminalLine(term, this.logLines[i]);

      // Update progress bar
      const pct = Math.round(((i + 1) / totalLines) * 100);
      const bar = document.getElementById('critic-progress-bar');
      const pctEl = document.getElementById('critic-progress-pct');
      if (bar) bar.style.width = pct + '%';
      if (pctEl) pctEl.textContent = pct + '%';

      // Tick checklist items at milestones
      if (i === this.milestones.investEnd) tickCriticCheck(0);
      if (i === this.milestones.contradictionEnd) tickCriticCheck(1);
      if (i === this.milestones.ambiguityEnd) tickCriticCheck(2);
      if (i === this.milestones.completenessEnd) tickCriticCheck(3);

      // Show HITL flags after ambiguity scan
      if (i === this.milestones.ambiguityEnd) showHITLFlags(this.qaResult.flags);

      // Show QA score card after final computation
      if (i === this.milestones.scoreComputed) showQAScoreCard(this.qaResult);
    }

    return this.qaResult;
  },

  async run(onStatusChange, onComplete) {
    onStatusChange('running');
    PipelineState.start('critic');
    const result = await this.simulateRun();
    PipelineState.complete('critic', result);
    onStatusChange('complete');
    onComplete(result);
    AutoFlowEvents.emit('critic:complete', { qaScore: result.qaScore, flags: result.flags.length });
  },
};

/* ─── Critic UI Helpers ─── */

function tickCriticCheck(index) {
  const check = document.getElementById('critic-chk-' + index);
  if (check) {
    check.classList.add('done');
    check.querySelector('.chk-icon').textContent = '✓';
  }
}

function showHITLFlags(flags) {
  const panel = document.getElementById('hitl-flags-panel');
  if (!panel) return;
  panel.style.display = '';
  updateHITLCounter();
}

function showQAScoreCard(result) {
  const card = document.getElementById('qa-score-card');
  if (card) card.style.display = '';
}

function resolveFlag(id) {
  const flag = CriticAgent.qaResult.flags.find(f => f.id === id);
  if (flag) { flag.resolved = true; flag.overridden = false; }
  const row = document.getElementById(id);
  if (row) { row.classList.add('resolved'); row.classList.remove('overridden'); }
  updateHITLCounter();
}

function overrideFlag(id) {
  const flag = CriticAgent.qaResult.flags.find(f => f.id === id);
  if (flag) { flag.overridden = true; flag.resolved = false; }
  const row = document.getElementById(id);
  if (row) { row.classList.add('overridden'); row.classList.remove('resolved'); }
  updateHITLCounter();
}

function updateHITLCounter() {
  const flags = CriticAgent.qaResult.flags;
  const resolved = flags.filter(f => f.resolved).length;
  const overridden = flags.filter(f => f.overridden).length;
  const total = flags.length;
  const counter = document.getElementById('hitl-counter');
  if (counter) counter.textContent = total + ' flags | ' + resolved + ' resolved | ' + overridden + ' overridden';
}
