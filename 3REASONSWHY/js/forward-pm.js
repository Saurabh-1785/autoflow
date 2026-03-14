/* ═══════════════════════════════════════════════
   FORWARD TO PM (v2)
   PRODUCTION INTEGRATION: n8n Sub-Workflow 5
   Webhook: POST /webhook/pm-agent-trigger
   ═══════════════════════════════════════════════ */

// PRODUCTION INTEGRATION POINT:
//   Replace forwardToPM() simulation with:
//   const response = await fetch('https://n8n.autoflow.io/webhook/pm-agent-trigger', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json', 'X-AutoFlow-Key': CONFIG.apiKey },
//     body: JSON.stringify({
//       brdId: CONFIG.runId, recipient: 'sarah.chen@autoflow.io',
//       deliveryMethod: 'jira', jiraConfig: { project: 'AutoFlow', epic: 'AF-Q1-2026-ROADMAP' }
//     })
//   });
//   return await response.json();

async function forwardToPM() {
  const btn = document.getElementById('btn-forward');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite;display:inline-block"></span> Forwarding...';

  await delay(2000);

  PipelineState.forwardedToPM = true;
  btn.classList.add('success');
  btn.innerHTML = '\u2713 Forwarded \u2014 Jira #' + CONFIG.jiraTicket;

  completeStep(4);
  updateMiniStep('ms-forward', 'done');

  showToast(
    '\u2713 BRD Successfully Forwarded',
    'Jira ticket #' + CONFIG.jiraTicket + ' created and assigned to Sarah Chen.'
  );

  AutoFlowEvents.emit('brd:forwarded', { jiraTicket: CONFIG.jiraTicket });
}
