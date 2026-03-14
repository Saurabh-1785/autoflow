# Setting up n8n Workflows

## 1. Login
Open **http://localhost:5678**
User: `admin` / `autoflow2026`

## 2. Import Workflows
For each file in `n8n/workflows/`:
1. Click **Workflows** in the left sidebar.
2. Click **+** (New) → **Import from file**.
3. Select a `.json` file from the folder.
4. Click **Save**.

## 3. Set Up Credentials
In n8n, click the **Key icon (Credentials)** 🔑 in the far-left sidebar.

- **PostgreSQL**:
    - Click **Add Credential** → Search **PostgreSQL**.
    - Name: `AutoFlow DB`
    - Host: `postgres`
    - Database: `autoflow`
    - User: `autoflow`
    - Password: `autoflow_dev_secret`
- **Google Sheets**:
    - Click **Add Credential** → Search **Google Sheets**.
    - Choose **OAuth2**.
    - Enter your **Client ID** and **Client Secret** (from Google Cloud Console).
    - Click **Sign in with Google** and follow the prompts.

## 4. Connect Your Sheet
1. Open the **01_data_ingestion** workflow.
2. Double-click the **Google Sheets** node.
3. In the **Spreadsheet** field, paste the **URL** of your demo Google Sheet.
4. Ensure the **Sheet** field matches your tab name (e.g., `Feedback`).
5. Click **Save**.

## 5. Activation
Toggling a workflow to **Active** (top-right corner) makes it live. Turn them on in this order:
1. `06_health_monitor`
2. `04_human_approval_handler`
3. `02_brd_generation`
4. `05_prioritization`
5. `03_epic_generation`
6. `01_data_ingestion` (Starts the automated schedule)

## 6. Manual Testing
To run the pipeline immediately without waiting for the schedule:
1. Open **01_data_ingestion**.
2. Click **Execute Workflow** at the bottom.
3. Watch the data flow into the database!
