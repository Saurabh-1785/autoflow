# AutoFlow Intelligence

AutoFlow Intelligence is an AI-driven product management automation platform. It revolutionizes the product development lifecycle by automatically turning raw user feedback into actionable, engineering-ready documentation (Business Requirements Documents, Epics, and User Stories).

The system leverages a multi-agent AI architecture powered by Google's Gemini API, integrated with a robust backend orchestration and an intuitive frontend dashboard.

## Key Features

- **Automated Data Ingestion**: Seamlessly ingest user feedback from various sources (Google Sheets, CSV files, etc.) using n8n workflows or direct localized fallback methods.
- **Multi-Agent AI Pipeline**:
  - **Cluster Agent**: Analyzes raw feedback strings and groups them into logical product topics based on semantic meaning.
  - **Analyst Agent**: Reads clustered feedback to generate a structured Business Requirements Document (BRD), outlining problem statements, proposed solutions, business value, and measurable success metrics.
  - **Critic Agent**: Reviews the generated BRDs for clarity, business value, and feasibility, giving them a score and either approving or rejecting them.
  - **Story Writer Agent**: Takes an approved BRD and breaks it down into actionable Agile Epics and User Stories with detailed acceptance criteria and story point estimates.
- **"Zero-Failure" Demo Mode**: Ensures the pipeline runs completely in-memory using a local CSV file, enabling demonstrations even if external workflow engines or databases are unsynced.
- **Full Transparency**: Every stage of the pipeline is tracked and logged in real-time, allowing users to monitor progress directly from the dashboard.

## Tech Stack

**Frontend**
- Framework: Next.js (React)
- Styling: Tailwind CSS
- Data Visualization: Recharts
- Icons: Lucide React
- Components: Class Variance Authority, Radix, DnD

**Backend**
- Environment: Node.js with Express
- Language: TypeScript
- AI Integration: @google/genai (Gemini Models)
- Database: PostgreSQL (using pg)
- Caching/State: Redis
- Workflow Automation: n8n

**Deployment**
- Containerization: Docker and Docker Compose

## Architecture Overview

1. **Frontend Dashboard**: A comprehensive UI allowing product managers to view ingesting feedback, approve generated BRDs, manage Epics, and oversee User Stories.
2. **Express Backend API**: Exposes endpoints for the frontend and triggers the AI pipeline. Houses the agent logic and database interactions.
3. **n8n Orchestration Layer**: Designed to pull in feedback automatically from sources like Google Sheets or webhooks and send them to the backend API.
4. **Agent Layer (Gemini)**: Distinct AI personas orchestrated in sequential or fallback modes.

## Database Schema

The core application data is stored in PostgreSQL, organized sequentially as data moves through the pipeline:
- `raw_feedback`: Stores individual user feedback entries.
- `feedback_clusters`: Groupings of related feedback.
- `brds`: The Business Requirement Documents formulated from the clusters.
- `epics`: Higher-level features broken down from BRDs.
- `user_stories`: Development-ready tasks generated for each Epic.
- `pipeline_status`: Real-time logging of the system's current execution block.

## Getting Started

### Prerequisites

Ensure you have the following installed on your primary machine:
- Docker and Docker Compose
- Node.js (for local non-Docker execution, though Docker is recommended)
- A Google Gemini API Key

### Installation & Environment Setup

1. **Clone the repository** (or navigate to the project root).
2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and configure your API keys.
   
   ```bash
   cp .env.example .env
   ```
   
   Ensure the following variables are filled in your `.env` file:
   - `GEMINI_API_KEY`: Your Google GenAI API key.
   - `GEMINI_MODEL`: Model identifier (e.g., gemini-1.5-flash).
   - `SHEET_ID`: (Optional) Source Google Sheet ID if using Google Sheets ingestion.

### Running the Application (Docker Compose)

The easiest way to start all services (PostgreSQL, Redis, Backend, n8n) is using Docker Compose.

```bash
docker compose up -d --build
```

This command will:
- Initialize the PostgreSQL database with the required schema and seed data.
- Start Redis.
- Start the n8n automation engine on port `5678`.
- Start the Express Backend API on port `3001`.

**To run the frontend:**

Navigate to the `frontend` directory and run the Next.js development server:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be accessible at `http://localhost:3000`.

## Using the Demo Pipeline

If you want to quickly test the AI Agents without setting up a live external data source or waiting for n8n cron jobs:
1. Ensure the `LOCAL_CSV_PATH` in your `.env` is pointing to `google_sheets_demo_data.csv`.
2. Ensure `ALLOW_CSV_FALLBACK=true` is set.
3. In the frontend dashboard, click on the **Start Demo Pipeline** button.
4. The backend will read the local CSV and push the data directly through the AI pipeline (Cluster -> Analyst -> Critic -> Story Writer).

## Troubleshooting

- **Database Does Not Exist Error in n8n**: Run `docker compose down -v` and `docker compose up -d` to completely reset the volumes, forcing the database initialization scripts to run.
- **Model 404/Not Found Errors**: Depending on your Google GenAI access, certain models might not be available. Update the `GEMINI_MODEL` setting in your `.env` to a supported model like `gemini-1.5-flash`.
- **Pipeline Failing (fetch failed)**: This can occur if the Gemini API has temporary errors. The demo pipeline is equipped with a Smart Fallback generation system to ensure data populates even if the AI step officially fails. Validate your internet connection or check Docker network access.
