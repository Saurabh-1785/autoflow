import axios from 'axios';

export async function triggerN8nWebhook(webhookUrl: string, data: any) {
  try {
    const baseUrl = (process.env.N8N_BASE_URL || 'http://localhost:5678').replace(/\/+$/, '');
    const path = webhookUrl.startsWith('/') ? webhookUrl : `/${webhookUrl}`;
    const url = `${baseUrl}${path}`;

    // n8n webhooks are public endpoints — no auth headers needed
    console.log(`[Pipeline] Triggering n8n webhook: ${url}`);
    const res = await axios.post(url, data);
    console.log(`[Pipeline] n8n webhook response status: ${res.status}`);
    return res.data;
  } catch (error: any) {
    console.error('n8n Webhook Error:', error.response?.status, error.message);
    throw new Error('Failed to trigger n8n pipeline');
  }
}
