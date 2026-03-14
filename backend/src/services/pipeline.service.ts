import axios from 'axios';

export async function triggerN8nWebhook(webhookUrl: string, data: any) {
  try {
    const baseUrl = (process.env.N8N_BASE_URL || 'http://localhost:5678').replace(/\/+$/, '');
    const path = webhookUrl.startsWith('/') ? webhookUrl : `/${webhookUrl}`;
    const url = `${baseUrl}${path}`;

    // Basic Auth support for local n8n
    const config: any = {};
    if (process.env.N8N_USER && process.env.N8N_PASSWORD) {
      const auth = Buffer.from(`${process.env.N8N_USER}:${process.env.N8N_PASSWORD}`).toString('base64');
      config.headers = {
        'Authorization': `Basic ${auth}`
      };
    }

    const res = await axios.post(url, data, config);
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.error('n8n Webhook Error: Unauthorized. Check N8N_USER and N8N_PASSWORD.');
    } else {
      console.error('n8n Webhook Error:', error.message);
    }
    throw new Error('Failed to trigger n8n pipeline');
  }
}
