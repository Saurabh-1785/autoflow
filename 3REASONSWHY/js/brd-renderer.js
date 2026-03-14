/* ═══════════════════════════════════════════════
   BRD RENDERER v3 — Structured JSON BRD Display
   Renders: INVEST + Gherkin + WSJF + HITL
   ═══════════════════════════════════════════════ */

function renderBRD() {
  const container = document.getElementById('brd-content');
  const brd = BRD_JSON;
  let html = '';

  /* ─── QUALITY CONTROL / HITL BANNER ─── */
  if (brd.hitl_required) {
    html += '<div class="hitl-banner hitl-warn">';
    html += '<div class="hitl-icon">!</div>';
    html += '<div><div class="hitl-title">Human-in-the-Loop Review Required</div>';
    html += '<div class="hitl-desc">Confidence score ' + brd.confidence_score.toFixed(2) + ' is below threshold ' + brd.hitl_threshold.toFixed(2) + '. This BRD must be reviewed by a human analyst before forwarding to PM.</div></div>';
    html += '</div>';
  } else {
    html += '<div class="hitl-banner hitl-pass">';
    html += '<div class="hitl-icon">&#x2713;</div>';
    html += '<div><div class="hitl-title">Quality Control: PASSED</div>';
    html += '<div class="hitl-desc">Confidence ' + brd.confidence_score.toFixed(2) + ' exceeds threshold ' + brd.hitl_threshold.toFixed(2) + ' | INVEST: ' + brd.quality_control.invest_compliance + ' | Gherkin: ' + brd.quality_control.gherkin_coverage + '</div></div>';
    html += '</div>';
  }

  /* ─── SECTION 1: EXECUTIVE SUMMARY ─── */
  html += '<div class="brd-section">';
  html += '<div class="brd-section-title">Executive Summary</div>';
  html += '<div class="exec-summary">';
  html += 'This Business Requirements Document (BRD) synthesizes <strong>' + brd.context.clean_records.toLocaleString() + ' validated customer feedback records</strong> collected from ' + brd.context.data_sources + ' sources over the analysis window <strong>' + brd.context.analysis_window + '</strong>. ';
  html += 'BERTopic clustering identified <strong>' + brd.context.themes_identified + ' distinct themes</strong>, of which <strong>' + brd.context.themes_included + '</strong> met inclusion criteria based on volume, sentiment intensity, and preliminary WSJF scoring.<br><br>';
  html += '<strong>' + brd.requirements.length + ' atomic requirements</strong> have been formulated following the INVEST framework, containing <strong>' + brd.requirements.reduce((a, r) => a + r.user_stories.length, 0) + ' user stories</strong> with <strong>' + brd.requirements.reduce((a, r) => a + r.user_stories.reduce((b, s) => b + s.acceptance_criteria.length, 0), 0) + ' Gherkin acceptance criteria</strong>.<br><br>';
  html += '<strong>Confidence Score: ' + brd.confidence_score.toFixed(2) + '</strong> | HITL Required: ' + (brd.hitl_required ? 'Yes' : 'No') + ' | Schema Validation: ' + brd.quality_control.schema_validation;
  html += '</div></div>';

  /* ─── SECTION 2: SOURCE BREAKDOWN ─── */
  html += '<div class="brd-section">';
  html += '<div class="brd-section-title">Data Sources Summary</div>';
  html += '<table class="brd-table"><thead><tr><th>Source</th><th>Records Collected</th><th>After Cleaning</th><th>% of Clean Dataset</th></tr></thead><tbody>';
  SOURCE_BREAKDOWN.forEach(s => {
    html += '<tr><td>' + s.source + '</td><td>' + s.collected.toLocaleString() + '</td><td>' + s.clean.toLocaleString() + '</td><td>' + s.pct + '</td></tr>';
  });
  html += '<tr class="total-row"><td>Total</td><td>2,847</td><td>1,203</td><td>100%</td></tr>';
  html += '</tbody></table></div>';

  /* ─── SECTION 3: THEME CLUSTERS ─── */
  html += '<div class="brd-section">';
  html += '<div class="brd-section-title">Theme Cluster Analysis</div>';
  html += '<table class="brd-table"><thead><tr><th>Cluster ID</th><th>Technical Name</th><th>Volume</th><th>Sentiment</th><th>Intensity</th><th>Rage/Churn</th><th>Auto-Elevated</th></tr></thead><tbody>';
  brd.theme_clusters.forEach(t => {
    const barWidth = Math.round(t.sentiment_intensity * 100);
    const barClass = t.sentiment_intensity >= 0.65 ? 'critical' : t.sentiment_intensity >= 0.5 ? 'high' : 'medium';
    const rage = t.rage_churn_signal ? '<span style="color:#DE350B;font-weight:600">YES</span>' : '<span style="color:var(--color-text-secondary)">No</span>';
    const elevated = t.auto_elevated ? '<span style="color:#DE350B;font-weight:600">YES</span>' : '<span style="color:var(--color-text-secondary)">No</span>';
    html += '<tr>';
    html += '<td style="font-family:IBM Plex Mono,monospace;font-size:11px">' + t.cluster_id + '</td>';
    html += '<td><code style="background:rgba(255,255,255,0.06);padding:2px 6px;border-radius:3px;font-size:11px">' + t.theme_name + '</code><br><span style="font-size:12px;color:var(--color-text-secondary)">' + t.display_name + '</span></td>';
    html += '<td>' + t.feedback_volume + '</td>';
    html += '<td style="font-family:IBM Plex Mono,monospace;font-size:11px">-' + t.sentiment_intensity.toFixed(2) + '</td>';
    html += '<td><div class="sentiment-bar"><div class="sentiment-bar-inner ' + barClass + '" style="width:' + barWidth + '%"></div></div></td>';
    html += '<td>' + rage + '</td>';
    html += '<td>' + elevated + '</td>';
    html += '</tr>';
  });
  html += '</tbody></table></div>';

  /* ─── SECTION 4: REQUIREMENTS (with WSJF + User Stories + Gherkin) ─── */
  html += '<div class="brd-section">';
  html += '<div class="brd-section-title">Functional Requirements</div>';

  brd.requirements.forEach(req => {
    const cluster = brd.theme_clusters.find(t => t.cluster_id === req.theme_cluster);
    html += '<div class="feature-block">';

    // Header
    html += '<div class="feature-block-header">';
    html += '<div><span class="fb-id">' + req.requirement_id + '</span><span class="fb-name">' + req.title + '</span></div>';
    html += '<span class="priority-label ' + req.priority.toLowerCase() + '">' + req.priority;
    if (req.priority_auto_elevated) html += ' (Auto-Elevated)';
    html += '</span></div>';

    // Description
    html += '<div class="fb-section"><div class="fb-section-title">Description</div>';
    html += '<div class="fb-description">' + req.description + '</div></div>';

    // Auto-elevation reason
    if (req.elevation_reason) {
      html += '<div class="elevation-notice">';
      html += '<strong>Priority Auto-Elevation:</strong> ' + req.elevation_reason;
      html += '</div>';
    }

    // WSJF Breakdown
    html += '<div class="fb-section"><div class="fb-section-title">WSJF Prioritization (Fibonacci 1-13)</div>';
    html += '<div class="wsjf-grid">';
    html += '<div class="wsjf-item"><div class="wsjf-label">Business Value</div><div class="wsjf-val">' + req.wsjf.business_value + '</div></div>';
    html += '<div class="wsjf-item"><div class="wsjf-label">Time Criticality</div><div class="wsjf-val">' + req.wsjf.time_criticality + '</div></div>';
    html += '<div class="wsjf-item"><div class="wsjf-label">Risk Reduction</div><div class="wsjf-val">' + req.wsjf.risk_reduction + '</div></div>';
    html += '<div class="wsjf-item"><div class="wsjf-label">Est. Effort</div><div class="wsjf-val effort">' + req.wsjf.estimated_effort + '</div></div>';
    html += '<div class="wsjf-item wsjf-score"><div class="wsjf-label">WSJF Score</div><div class="wsjf-val score">' + req.wsjf.wsjf_score.toFixed(1) + '</div></div>';
    html += '</div>';
    html += '<div class="wsjf-formula">' + req.wsjf.formula + '</div>';
    html += '</div>';

    // User Stories
    html += '<div class="fb-section"><div class="fb-section-title">User Stories (INVEST Validated)</div>';
    req.user_stories.forEach(s => {
      html += '<div class="user-story">';
      html += '<div class="us-header"><div class="us-id">' + s.story_id + '</div>';
      html += '<div class="invest-check">';
      Object.entries(s.invest).forEach(([key, val]) => {
        html += '<span class="invest-item ' + (val ? 'pass' : 'fail') + '">' + (val ? '&#x2713;' : '&#x2717;') + ' ' + key.charAt(0).toUpperCase() + key.slice(1) + '</span>';
      });
      html += '</div></div>';
      html += '<div class="us-text">' + s.story + '</div>';

      // Gherkin Acceptance Criteria
      html += '<div class="gherkin-section">';
      s.acceptance_criteria.forEach(ac => {
        html += '<div class="gherkin-block">';
        html += '<div class="gherkin-scenario">Scenario: ' + ac.scenario + '</div>';
        html += '<div class="gherkin-line"><span class="gk-keyword">Given</span> ' + ac.given + '</div>';
        html += '<div class="gherkin-line"><span class="gk-keyword">When</span> ' + ac.when + '</div>';
        html += '<div class="gherkin-line"><span class="gk-keyword">Then</span> ' + ac.then + '</div>';
        html += '</div>';
      });
      html += '</div>';
      html += '</div>'; // end user-story
    });
    html += '</div>'; // end fb-section

    html += '</div>'; // end feature-block
  });
  html += '</div>'; // end brd-section

  /* ─── SECTION 5: WSJF RANKING TABLE ─── */
  html += '<div class="brd-section">';
  html += '<div class="brd-section-title">WSJF Prioritized Requirement Ranking</div>';
  html += '<table class="brd-table"><thead><tr><th>#</th><th>Requirement</th><th>BV</th><th>TC</th><th>RR</th><th>Effort</th><th>WSJF</th><th>Priority</th><th>PM Action</th></tr></thead><tbody>';

  // Sort by WSJF score descending
  const sorted = [...brd.requirements].sort((a, b) => b.wsjf.wsjf_score - a.wsjf.wsjf_score);
  sorted.forEach((r, i) => {
    html += '<tr>';
    html += '<td>' + (i + 1) + '</td>';
    html += '<td>' + r.requirement_id + ' ' + r.title + '</td>';
    html += '<td style="font-family:IBM Plex Mono,monospace;text-align:center">' + r.wsjf.business_value + '</td>';
    html += '<td style="font-family:IBM Plex Mono,monospace;text-align:center">' + r.wsjf.time_criticality + '</td>';
    html += '<td style="font-family:IBM Plex Mono,monospace;text-align:center">' + r.wsjf.risk_reduction + '</td>';
    html += '<td style="font-family:IBM Plex Mono,monospace;text-align:center">' + r.wsjf.estimated_effort + '</td>';
    html += '<td style="font-family:IBM Plex Mono,monospace;font-weight:700;text-align:center;color:var(--color-accent)">' + r.wsjf.wsjf_score.toFixed(1) + '</td>';
    html += '<td><span class="priority-label ' + r.priority.toLowerCase() + '">' + r.priority + '</span></td>';
    const action = r.priority === 'Critical' || r.priority === 'High' ? 'Prioritize Q1' : r.priority === 'Medium' ? 'Schedule Q2' : 'Backlog';
    html += '<td>' + action + '</td>';
    html += '</tr>';
  });
  html += '</tbody></table></div>';

  /* ─── SECTION 6: RAW JSON OUTPUT ─── */
  html += '<div class="brd-section">';
  html += '<div class="brd-section-title">Raw JSON Output</div>';
  html += '<div class="json-output-wrap">';
  html += '<button class="btn-copy-json" onclick="copyBRDJson()">Copy JSON</button>';
  html += '<pre class="json-output">' + syntaxHighlightJSON(JSON.stringify(brd, null, 2)) + '</pre>';
  html += '</div></div>';

  container.innerHTML = html;
}

/* ─── JSON Syntax Highlighter ─── */
function syntaxHighlightJSON(json) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    let cls = 'json-number';
    if (/^"/.test(match)) {
      cls = /:$/.test(match) ? 'json-key' : 'json-string';
    } else if (/true|false/.test(match)) {
      cls = 'json-boolean';
    } else if (/null/.test(match)) {
      cls = 'json-null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

/* ─── Copy JSON to Clipboard ─── */
function copyBRDJson() {
  const text = JSON.stringify(BRD_JSON, null, 2);
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('.btn-copy-json');
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy JSON'; btn.classList.remove('copied'); }, 2000);
  });
}
