import axios from 'axios';

export async function triggerN8nWebhook(webhookUrl: string, data: any) {
  try {
    const url = `${process.env.N8N_BASE_URL || 'http://localhost:5678'}${webhookUrl}`;
    const res = await axios.post(url, data);
    return res.data;
  } catch (error: any) {
    console.error('n8n Webhook Error:', error.message);
    throw new Error('Failed to trigger n8n pipeline');
  }
}
