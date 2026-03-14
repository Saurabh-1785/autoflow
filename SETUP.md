# Setup Guide: AutoFlow Intelligence

Follow these steps to get the AutoFlow pipeline running on your local machine.

## 1. Prerequisites
- **Docker & Docker Compose**: Ensure you have Docker installed and running.
- **Google Deepmind Gemini API Key**: Required for the AI Agents.
- **Google Sheet ID**: Your spreadsheet with feedback data.

## 2. Environment Configuration
Copy the template environment file:
```bash
cp .env.example .env
```
Open `.env` and fill in your **Gemini API Key** and **Google Sheet ID**.

### Local CSV Mode (Recommended for local dev)
If you want to run without Google Sheets, the backend can send rows from `google_sheets_demo_data.csv` directly to n8n.

- `SHEET_ID` and `GOOGLE_SHEETS_API_KEY` are not required for this mode.
- `docker-compose.yml` is configured with `PIPELINE_SOURCE=csv` and mounts the CSV file into backend.
- Re-import `n8n/workflows/01_data_ingestion.json` and activate it so webhook `POST /webhook/start-ingestion` is registered.

## 3. Start Services
Run Docker Compose to start the backend, database, redis, and n8n.
```bash
docker compose up -d --build
```

This will:
- Create the PostgreSQL database.
- Create the `n8n_db` for n8n.
- Initialize the `autoflow` schema and seed demo data.
- Start the n8n automation engine.

## 4. Import n8n Workflows
Follow the simple steps in `n8n/README.md` to import the 6 workflows into n8n.

## 5. Verify Services
- **n8n**: http://localhost:5678 (admin / autoflow2026)
- **Backend API**: http://localhost:3001/api/pipeline/status
- **Frontend**: http://localhost:3000

## 6. Troubleshooting
- **Database Error**: If n8n fails to start with "database does not exist", run `docker compose down -v` and then `up` again to ensure the init script runs on a fresh volume.
- **Google Sheets**: Ensure your Sheet ID is publicly accessible or you have configured a valid API key.
