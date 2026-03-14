"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerN8nWebhook = triggerN8nWebhook;
const axios_1 = __importDefault(require("axios"));
async function triggerN8nWebhook(webhookUrl, data) {
    try {
        const baseUrl = (process.env.N8N_BASE_URL || 'http://localhost:5678').replace(/\/+$/, '');
        const path = webhookUrl.startsWith('/') ? webhookUrl : `/${webhookUrl}`;
        const url = `${baseUrl}${path}`;
        // Basic Auth support for local n8n
        const config = {};
        if (process.env.N8N_USER && process.env.N8N_PASSWORD) {
            const auth = Buffer.from(`${process.env.N8N_USER}:${process.env.N8N_PASSWORD}`).toString('base64');
            config.headers = {
                'Authorization': `Basic ${auth}`
            };
        }
        const res = await axios_1.default.post(url, data, config);
        return res.data;
    }
    catch (error) {
        if (error.response?.status === 401) {
            console.error('n8n Webhook Error: Unauthorized. Check N8N_USER and N8N_PASSWORD.');
        }
        else {
            console.error('n8n Webhook Error:', error.message);
        }
        throw new Error('Failed to trigger n8n pipeline');
    }
}
