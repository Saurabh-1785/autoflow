/* ═══════════════════════════════════════════════
   EVENT BUS (v2)
   ═══════════════════════════════════════════════ */

const AutoFlowEvents = {
  listeners: {},
  on(event, cb) { (this.listeners[event] = this.listeners[event] || []).push(cb); },
  emit(event, data) { (this.listeners[event] || []).forEach(cb => cb(data)); },
  // Events: 'config:confirmed', 'scraper:complete', 'cleaner:complete',
  //         'analyst:complete', 'brd:ready', 'brd:forwarded'
  // Future: 'critic:complete', 'pm:prioritized', 'po:epics_ready', 'sa:handoff_complete'
};
