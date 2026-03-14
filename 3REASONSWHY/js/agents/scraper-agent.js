/* ═══════════════════════════════════════════════
   SCRAPER AGENT (v2 — Section-based UI)
   PRODUCTION INTEGRATION: n8n Sub-Workflow 1
   Webhook: POST /webhook/scraper-trigger
   ═══════════════════════════════════════════════ */

// PRODUCTION INTEGRATION POINT:
//   Replace simulateRun() with:
//   const response = await fetch('https://n8n.autoflow.io/webhook/scraper-trigger', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json', 'X-AutoFlow-Key': CONFIG.apiKey },
//     body: JSON.stringify({ sources: config.sources, dateWindow: config.dateWindow, runId: CONFIG.runId })
//   });
//   return await response.json();
//   // Expected: { status, records_collected, sources_breakdown, run_id, duration }

const ScraperAgent = {
  logLines: [
    '[10:42:01] Initializing Scraper Agent v2.1...',
    '[10:42:02] Authenticating with Reddit API... OK',
    '[10:42:03] Fetching r/productmanagement, r/startups, r/userexperience...',
    '[10:42:05] Reddit: 342 posts collected',
    '[10:42:06] Authenticating with Twitter/X API v2... OK',
    '[10:42:08] Twitter/X: 891 tweets collected (keyword match: 72%)',
    '[10:42:10] App Store Connect API: 156 iOS reviews fetched',
    '[10:42:11] Google Play Developer API: 203 Android reviews fetched',
    '[10:42:13] G2 Reviews API: 88 verified enterprise reviews',
    '[10:42:15] Trustpilot feed: 114 reviews parsed',
    '[10:42:17] Zendesk API: 1,053 support tickets (last 30 days)',
    '[10:42:19] Merging all sources into unified staging schema...',
    '[10:42:21] Inserting 2,847 raw records \u2192 PostgreSQL: staging_reviews',
    '[10:42:23] \u2713 Scraper Agent complete. Run ID: AF-2026-03-13-001',
  ],

  async simulateRun() {
    const term = document.getElementById('term-scraper');
    term.innerHTML = '';
    for (let i = 0; i < this.logLines.length; i++) {
      await delay(600 + Math.random() * 400);
      appendTerminalLine(term, this.logLines[i]);
    }
    return {
      status: 'complete', records_collected: CONFIG.rawRecords,
      sources: PipelineState.config.sources.length, run_id: CONFIG.runId, duration: '22s',
    };
  },

  async run(onStatusChange, onComplete) {
    onStatusChange('running');
    PipelineState.start('scraper');
    const result = await this.simulateRun();
    PipelineState.complete('scraper', result);
    onStatusChange('complete');
    onComplete(result);
    AutoFlowEvents.emit('scraper:complete', result);
  },
};
