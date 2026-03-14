# Importing n8n Workflows

## Prerequisites
- n8n running at http://localhost:5678
- Login: admin / autoflow2026

## Import Steps (for EACH workflow file in /workflows/)

1. Open n8n at http://localhost:5678
2. Click "Workflows" in the left sidebar
3. Click the "+" button → "Import from file"
4. Select the workflow JSON file
5. Click "Import"
6. After importing ALL 6 workflows, configure credentials:

## Required Credentials in n8n

### PostgreSQL Credential
- Go to Settings → Credentials → New Credential → PostgreSQL
- Name: AutoFlow DB
- Host: postgres  ← (use 'postgres' not 'localhost' inside Docker)
- Port: 5432
- Database: autoflow
- User: autoflow
- Password: autoflow_dev_secret

### HTTP Header Auth (for Gemini)
- n8n uses environment variables injected at runtime
- GEMINI_API_KEY is available as {{$env.GEMINI_API_KEY}} in all HTTP nodes

### Slack Credential
- Go to Settings → Credentials → New Credential → Slack
- Choose "Webhook URL" method
- Paste your SLACK_WEBHOOK_URL

## Workflow Activation Order
Activate in this order (click the toggle on each workflow):
1. 06_health_monitor (always on)
2. 04_human_approval_handler (always on — listens for webhook)
3. 01_data_ingestion (activate last — this starts the pipeline)
2, 3, 5 are triggered automatically by other workflows.

## Test the Pipeline Manually
curl -X POST http://localhost:5678/webhook/generate-brds
curl -X POST http://localhost:5678/webhook/brd-decision \
  -H "Content-Type: application/json" \
  -d '{"brdId":"test-id","decision":"approve"}'
