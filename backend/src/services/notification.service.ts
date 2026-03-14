import axios from 'axios';

export async function sendSlackMessage(message: string) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log(`[SLACK MOCK] ${message}`);
    return;
  }
  try {
    await axios.post(webhookUrl, { text: message });
  } catch (error) {
    console.error('Slack Notification Error:', error);
  }
}
