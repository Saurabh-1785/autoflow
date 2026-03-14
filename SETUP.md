# AutoFlow Intelligence Setup Guide

## 1. Prerequisites
- Node.js v20+
- Docker & Docker Compose
- Git

## 2. Clone & Setup
Clone the repository, then copy the environment file:
```bash
cp .env.example .env
```
Open `.env` and fill in your **Gemini API Key** and **Google Sheet ID**.

## 3. Start Services
Run Docker Compose to start the backend, database, redis, and n8n.
```bash
docker compose up -d --build
```
This will automatically:
- Create the PostgreSQL database.
- Create the `n8n_db` for n8n.
- Initialize the `autoflow` schema and seed demo data.
- Start the n8n automation engine.

## 4. Import n8n Workflows
Follow the simple steps in `n8n/README.md` to import the 6 workflows into n8n.

## 5. Verify Services
- **n8n**: http://localhost:5678 (admin / autoflow2026)
- **Backend**: http://localhost:3001/api/pipeline/status

## 6. Troubleshooting
- **Database Error**: If n8n fails to start with "database does not exist", run `docker compose down -v` and then `up` again to ensure the init script runs on a fresh volume.
- **Google Sheets**: Ensure your Sheet ID is publicly accessible or you have configured a valid API key.
