# AUTOFLOW INTELLIGENCE — MASTER BUILD PROMPT
### For: Claude Opus 4.6 | Full-Stack Implementation Guide
### Version: 2.0 | March 2026
---

> **HOW TO USE THIS DOCUMENT**
> This is a structured implementation brief. Read it fully before writing any code.
> Each section is marked with who/what handles it: `[AI]`, `[n8n]`, `[HUMAN]`, `[BACKEND]`, `[FRONTEND]`.
> Follow the decision rules in Section 4 to know exactly when to use AI vs automation vs plain code.

---

## TABLE OF CONTENTS
1. [Project Vision & Scope](#1-project-vision--scope)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Technology Stack (Full)](#3-technology-stack)
4. [AI vs n8n vs Code — Decision Rules](#4-ai-vs-n8n-vs-code--decision-rules)
5. [Frontend — Complete Specification](#5-frontend)
6. [Backend Services — Complete Specification](#6-backend-services)
7. [n8n Workflow — Node-by-Node](#7-n8n-workflow-node-by-node)
8. [AI Agent Prompts — Copy-Paste Ready](#8-ai-agent-prompts)
9. [Blockchain Integration — Step by Step](#9-blockchain-integration)
10. [Database Schema](#10-database-schema)
11. [Known Problems & Exact Solutions](#11-known-problems--exact-solutions)
12. [Feasibility Rating & MVP Scope](#12-feasibility-rating--mvp-scope)
13. [System Design Diagrams (Text)](#13-system-design-diagrams)
14. [Demo Script (Hackathon)](#14-demo-script)

---

## 1. PROJECT VISION & SCOPE

### What is AutoFlow Intelligence?
AutoFlow Intelligence is a **Human-in-the-Loop (HITL) AI pipeline** that automates the journey from raw customer feedback to architect-ready Engineering Epics. It replaces the manual coordination work of Business Analysts (BA), Product Owners (PO), and Product Managers (PM) — not by removing them, but by making them 10x faster.

### The Problem Being Solved
In any company with a digital product:
- BAs spend 2–4 weeks scraping reviews from Reddit, App Stores, Twitter, and support tickets
- PMs spend another 1–2 weeks writing and prioritizing BRDs (Business Requirements Documents)
- POs spend 1 week translating approved BRDs into Jira Epics and User Stories
- Only THEN can the Solution Architect begin system design

**Total: 4–7 weeks of highly-paid human time before a single line of code is written.**

AutoFlow reduces this to **48 hours**, with humans acting as editors and approvers, not scrapers.

### What the System Does (Pipeline Summary)
```
[Social Media + App Stores + Support Tickets]
        ↓ (scrape / API pull)
[Data Cleaning + Deduplication]          ← Python / n8n, NO AI here
        ↓
[Theme Clustering + Sentiment Analysis]  ← Lightweight ML (BERTopic), NO LLM
        ↓
[BRD Draft Generation]                   ← Claude AI (Analyst Agent)
        ↓
[BRD Quality Review]                     ← Claude AI (Critic Agent) + Confidence Score
        ↓
[HUMAN GATE #1: PM Reviews + Approves BRDs]   ← Dashboard UI
        ↓
[WSJF Priority Scoring]                  ← Python math, NO AI
        ↓
[HUMAN GATE #2: PM Adjusts Priority]    ← Drag-and-drop priority UI
        ↓
[Epic + User Story Generation]           ← Claude AI (Story Writer Agent)
        ↓
[Blockchain Audit Record]                ← Polygon testnet, Smart Contract
        ↓
[Solution Architect Handoff Package]     ← Claude AI (SA Brief Agent)
```

### Scope Boundaries (What Is NOT in scope)
- Does NOT auto-push to Jira/Linear (SA does this manually — reduces risk)
- Does NOT write code or design systems automatically
- Does NOT process video or audio feedback (text only)
- Does NOT handle languages other than English in V1 (translation is a V2 feature)

---

## 2. SYSTEM ARCHITECTURE OVERVIEW

### High-Level Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        AUTOFLOW INTELLIGENCE                     │
├───────────────┬─────────────────────┬───────────────────────────┤
│   FRONTEND    │    BACKEND LAYER     │     AUTOMATION LAYER      │
│  (Next.js)    │  (Node.js + Python) │       (n8n + AI)          │
│               │                     │                           │
│ • Dashboard   │ • Express REST API  │ • n8n Workflows (5)       │
│ • HITL Review │ • PostgreSQL        │ • Claude API Agents (4)   │
│ • Priority UI │ • Redis Queue       │ • BERTopic Python Service │
│ • Blockchain  │ • Blockchain Notary │ • Blockchain Notary       │
│   Explorer    │   (ethers.js)       │   (writes to Polygon)     │
└───────────────┴─────────────────────┴───────────────────────────┘
```

### Data Flow Architecture

**Inbound (Collection):**
```
Reddit API ──────────────────┐
Twitter/X API v2 ────────────┤
App Store Connect API ────────┼──► n8n Ingestion Workflow ──► PostgreSQL (raw_feedback table)
Google Play Reviews API ─────┤
Google Sheets (manual) ──────┘   (fallback for hackathon demo)
```

**Processing:**
```
PostgreSQL (raw) ──► Python NLP Service ──► PostgreSQL (clusters table)
                     (BERTopic clustering)
                     (Deduplication)
                     (Sentiment scoring)
```

**AI Generation:**
```
PostgreSQL (clusters) ──► n8n AI Workflow ──► Claude API (Analyst Agent)
                                          ──► Claude API (Critic Agent)
                                          ──► PostgreSQL (brds table)
                                          ──► HITL Queue (if confidence < 0.75)
```

**Prioritization:**
```
PostgreSQL (approved_brds) ──► Python WSJF Scorer ──► Dashboard (Human Override)
                                                   ──► PostgreSQL (priority_queue table)
```

**Generation & Delivery:**
```
PostgreSQL (priority_queue) ──► n8n Epic Workflow ──► Claude API (Story Writer)
                                                  ──► Claude API (SA Brief)
                                                  ──► Blockchain Notary
                                                  ──► PostgreSQL (epics table)
                                                  ──► Email / Dashboard delivery
```

---

## 3. TECHNOLOGY STACK

### Frontend
| Tool | Version | Why |
|------|---------|-----|
| Next.js | 14+ (App Router) | SSR for real-time data, easy API routes |
| TypeScript | 5+ | Type safety for complex data structures |
| Tailwind CSS | 3+ | Rapid UI development |
| shadcn/ui | Latest | Professional component library |
| React Query (TanStack) | 5+ | Server state management, polling |
| Recharts | 2+ | Priority charts, sentiment graphs |
| react-beautiful-dnd | Latest | Drag-and-drop priority ordering |
| Zod | 3+ | Frontend schema validation |

### Backend
| Tool | Version | Why |
|------|---------|-----|
| Node.js + Express | 20+ | REST API for frontend and n8n webhooks |
| PostgreSQL | 15+ | Primary relational database |
| Redis | 7+ | Job queue, caching, HITL state |
| Python 3.11+ | - | NLP pipeline (BERTopic, sentence-transformers) |
| FastAPI | Latest | Python microservice for NLP endpoints |
| ethers.js | 6+ | Blockchain writes from Node.js |

### Automation & AI
| Tool | Why |
|------|-----|
| n8n (self-hosted, Docker) | Visual workflow orchestration |
| Gemini 3.1  (google gemini  API) | BRD generation, story writing, reviews |
| BERTopic (Python) | Topic clustering — cheaper and faster than LLM for this |
| sentence-transformers | Semantic deduplication |

### Blockchain
| Tool | Why |
|------|-----|
| Solana testnet | Low gas, fast finality, EVM compatible |
| Rust | Smart contract language |

### Infrastructure
| Tool | Why |
|------|-----|
| Docker Compose | Single-command local setup |
| ngrok | Expose local n8n to webhooks during hackathon |

---

## 4. AI vs n8n vs CODE — DECISION RULES

> **This is the most important section. Read before writing any logic.**

### RULE 1: Use AI ONLY when the task requires language understanding or generation

✅ **USE AI FOR:**
- Drafting a BRD from a list of customer complaints (requires understanding + writing)
- Reviewing a BRD for quality issues (requires reasoning about content)
- Writing User Stories in "As a [user] I want..." format (requires language generation)
- Generating Acceptance Criteria (requires understanding context + writing)
- Writing an Architecture Brief for the SA (requires synthesis + writing)

❌ **DO NOT USE AI FOR:**
- Deduplication (use cosine similarity math — it's deterministic and cheaper)
- Sentiment scoring (use a pre-trained classifier like `cardiffnlp/twitter-roberta-base-sentiment`)
- WSJF priority calculation (it's a formula — `(BV + TC + RR) / Effort`)
- Hashing documents (use SHA-256 — deterministic)
- Storing data to PostgreSQL (use SQL — deterministic)
- Calling APIs (use n8n HTTP Request nodes)
- Scheduling tasks (use n8n Schedule Trigger)

**Why this matters:** LLMs cost money per token, are slow (~3–8s/call), and are non-deterministic. Any task that can be done with a formula or a pre-trained model should be. AI is reserved for tasks that genuinely require language intelligence.

---

### RULE 2: Use n8n for ORCHESTRATION, not logic

✅ **USE n8n FOR:**
- Triggering the pipeline on a schedule
- Calling external APIs (Reddit, Twitter, App Store)
- Passing data between services (HTTP Request to your Python microservice)
- Calling Claude API via HTTP Request node
- Sending Slack/Email notifications
- Pausing the workflow and waiting for human approval (Wait Node + Webhook)
- Routing data based on simple conditions (IF Node: confidence > 0.75?)
- Logging errors to a Slack channel

❌ **DO NOT USE n8n FOR:**
- Complex data transformation (write a Code Node that calls your Python service instead)
- Machine learning / NLP (this belongs in the Python FastAPI microservice)
- Database ORM logic (n8n Postgres node is for simple queries only; complex logic goes in your Express API)
- Anything requiring persistent memory (n8n is stateless — use PostgreSQL)

**Why this matters:** n8n is a visual tool — complex logic inside it becomes impossible to debug. Keep n8n as a "visual map" of your pipeline; the real work happens in the services it calls.

---

### RULE 3: Use plain backend code (Express/Python) for everything else

✅ **USE BACKEND CODE FOR:**
- WSJF scoring algorithm
- Cosine similarity deduplication
- SHA-256 hashing before blockchain write
- Database CRUD operations
- Authentication (JWT)
- Webhook handlers from n8n
- Blockchain write logic (ethers.js)
- Any logic you want to unit test

---

## 5. FRONTEND

### 5.1 Screen Map

```
/                     → Landing / Login
/dashboard            → Main control center (pipeline status overview)
/feedback             → Raw feedback inbox (read-only, filtered by source)
/brds                 → BRD review queue (HITL Gate #1)
  /brds/[id]          → Single BRD detail + approve/reject/edit UI
/priority             → Priority management (HITL Gate #2 — drag-and-drop)
/epics                → Generated epics browser
  /epics/[id]         → Epic detail with User Stories + Acceptance Criteria
/audit                → Blockchain audit trail explorer
/settings             → API keys, source configuration, thresholds
```

### 5.2 Dashboard Page (`/dashboard`)
**Purpose:** Real-time view of the entire pipeline state.

**Components to build:**
- **Pipeline Progress Bar:** Shows which stage the current batch is in. Stages: `Ingesting → Cleaning → Clustering → Generating BRDs → Awaiting Review → Prioritizing → Writing Epics → Delivered`
- **Stats Cards (4 cards):**
  - Total feedback items collected (this week)
  - BRDs awaiting your review
  - Epics ready for SA handoff
  - Blockchain records logged
- **Recent Activity Feed:** Last 10 events (new BRD generated, BRD approved, epic created, blockchain write confirmed)
- **Trigger Button:** "Run Pipeline Now" — calls POST `/api/pipeline/trigger`
- **Source Health Indicators:** Green/Red dots for each data source (Reddit, Twitter, App Store) showing last successful pull time

**Data polling:** Use React Query with 30-second refetch interval.

### 5.3 BRD Review Page (`/brds/[id]`) — HITL Gate #1
**Purpose:** The most critical screen. PM reads AI-generated BRD and decides to approve, edit, or reject.

**Layout:**
- **Left Panel (60%):** The BRD content
  - Title
  - Problem Statement
  - Target Audience
  - Business Value
  - Success Metrics
  - Source feedback items that generated this BRD (expandable list with links)
  - AI Confidence Score (displayed as a color-coded badge: green ≥ 0.85, yellow 0.75–0.84, red < 0.75)
  - Critic Agent QA findings (expandable section)

- **Right Panel (40%):** Actions
  - **Approve** button (green) — sends PATCH `/api/brds/:id/approve`
  - **Approve with Edits** — inline edit mode for the BRD fields, then approve
  - **Reject + Reason** — sends PATCH `/api/brds/:id/reject` with reason
  - **Request More Data** — flags for the next data collection cycle
  - **Priority Hint:** dropdown (High/Medium/Low) — feeds into WSJF scoring as a manual override signal

**Critical UX detail:** Show a diff view if the PM edits the BRD — highlight what changed from the AI's original. Log this diff to the audit trail.

### 5.4 Priority Management Page (`/priority`) — HITL Gate #2
**Purpose:** PM sees the AI-scored ranking and can adjust it.

**Components:**
- **Ranked BRD List:** Drag-and-drop list using `react-beautiful-dnd`
- **WSJF Score Breakdown:** Hover on any BRD to see the 4 axis scores (Business Value, Time Criticality, Risk Reduction, Effort)
- **Lock/Unlock toggle:** PM can lock a BRD's position to prevent AI re-ranking
- **Finalize button:** "Lock Priority & Generate Epics" — only enabled if at least 1 BRD is selected. Triggers n8n Epic workflow via webhook.
- **Select top N:** Slider to choose how many BRDs to process into Epics (default: top 3)

### 5.5 Blockchain Audit Page (`/audit`)
**Purpose:** Transparent proof of every AI decision made.

**Components:**
- **Audit Log Table:** Columns: Timestamp, Event Type, Record Hash, Polygon TX Hash (with Polygonscan link), Actor (AI Agent or Human + email)
- **Event Types:** `BRD_GENERATED`, `BRD_APPROVED`, `BRD_EDITED`, `PRIORITY_SET`, `EPIC_CREATED`, `SA_DELIVERY`
- **Verify button:** Input a BRD ID → fetch current BRD content from DB → re-hash it → compare to on-chain hash → show "VERIFIED ✅" or "TAMPERED ⚠️"
- **Download Audit Report:** PDF export of full audit log

### 5.6 Frontend API Contract
All endpoints return `{ success: boolean, data: T, error?: string }`.

```
GET    /api/pipeline/status
POST   /api/pipeline/trigger
GET    /api/feedback?source=&page=&limit=
GET    /api/brds?status=pending|approved|rejected
GET    /api/brds/:id
PATCH  /api/brds/:id/approve  body: { edits?: Partial<BRD> }
PATCH  /api/brds/:id/reject   body: { reason: string }
GET    /api/priority
PATCH  /api/priority          body: { orderedIds: string[] }
POST   /api/priority/finalize body: { selectedIds: string[], topN: number }
GET    /api/epics
GET    /api/epics/:id
GET    /api/audit?page=&limit=
GET    /api/audit/:brdId/verify
```

---

## 6. BACKEND SERVICES

### 6.1 Express REST API (Node.js)
File structure:
```
/backend
  /src
    /routes         ← Express routers (feedback, brds, priority, epics, audit, pipeline)
    /services
      brdService.ts          ← BRD CRUD + approval logic
      priorityService.ts     ← WSJF scoring algorithm
      blockchainService.ts   ← ethers.js wrapper (write to Polygon)
      pipelineService.ts     ← Trigger n8n workflows via webhook
    /middleware
      auth.ts                ← JWT validation
      validate.ts            ← Zod request validation
    /db
      schema.sql             ← PostgreSQL schema
      queries.ts             ← Typed query functions (use pg library directly)
    app.ts
    server.ts
```

### 6.2 WSJF Scoring Algorithm (priorityService.ts)
```typescript
interface WsjfInput {
  businessValue: number;       // 1–10, from AI estimate + source weighting
  timeCriticality: number;     // 1–10, from sentiment intensity + recency
  riskReduction: number;       // 1–10, from AI estimate
  effort: number;              // 1–10, from AI estimate (inverse — lower effort = higher score)
  sourceWeight: number;        // multiplier: enterprise user = 3.0, free user = 1.0
  mentionCount: number;        // how many feedback items in the cluster
  sentimentIntensity: number;  // 0–1 from BERTopic/sentiment model
}

function calculateWsjf(input: WsjfInput): number {
  const costOfDelay = (
    (input.businessValue * input.sourceWeight) +
    input.timeCriticality +
    input.riskReduction
  );
  const baseScore = costOfDelay / input.effort;
  // Boost for high mention count (logarithmic to prevent viral noise dominating)
  const mentionBoost = Math.log10(input.mentionCount + 1) * 0.5;
  // Boost for high-intensity negative sentiment (churn risk signal)
  const sentimentBoost = input.sentimentIntensity > 0.8 ? 1.5 : 1.0;
  return baseScore * sentimentBoost + mentionBoost;
}
```

### 6.3 Python NLP Microservice (FastAPI)
**Endpoints:**

`POST /nlp/cluster`
- Input: `{ texts: string[] }`
- Process: BERTopic clustering → returns topic groups
- Output: `{ clusters: { topic_id, topic_label, texts: string[], keywords: string[] }[] }`

`POST /nlp/deduplicate`
- Input: `{ texts: string[] }`
- Process: sentence-transformers embeddings → cosine similarity > 0.92 = duplicate
- Output: `{ unique: string[], removed_count: number }`

`POST /nlp/sentiment`
- Input: `{ texts: string[] }`
- Process: `cardiffnlp/twitter-roberta-base-sentiment` model
- Output: `{ results: { text, sentiment: 'positive'|'negative'|'neutral', confidence: number }[] }`

**Why Python, not n8n/Node.js for this:**
BERTopic and sentence-transformers are Python-first libraries. Running ML models in Node.js is possible but fragile. Keeping NLP in a dedicated Python FastAPI service means it can be scaled or swapped independently.

### 6.4 Blockchain Notary Service (blockchainService.ts)
```typescript
import { ethers } from 'ethers';
import crypto from 'crypto';

// ABI for AuditRegistry.sol (simplified)
const ABI = [
  "function logRecord(bytes32 recordHash, string calldata ipfsCid, string calldata eventType) external",
  "event RecordLogged(bytes32 indexed recordHash, string ipfsCid, string eventType, address indexed actor, uint256 timestamp)"
];

async function logToBlockchain(data: object, eventType: string): Promise<string> {
  // 1. Hash the data
  const jsonStr = JSON.stringify(data, null, 0);
  const hash = '0x' + crypto.createHash('sha256').update(jsonStr).digest('hex');
  
  // 2. Upload full document to IPFS via Pinata
  const ipfsCid = await uploadToPinata(jsonStr);
  
  // 3. Write hash + CID to smart contract
  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
  const wallet = new ethers.Wallet(process.env.AGENT_PRIVATE_KEY!, provider);
  const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS!, ABI, wallet);
  
  const tx = await contract.logRecord(hash, ipfsCid, eventType);
  const receipt = await tx.wait();
  
  return receipt.hash; // Polygon TX hash for Polygonscan link
}
```

---

## 7. n8n WORKFLOW NODE-BY-NODE

> **Setup:** Self-host n8n via Docker. Use n8n version 1.x+. Configure with PostgreSQL as n8n's own database (separate from your app DB).

### Workflow 1: Data Ingestion (Runs every 6 hours)

```
[Schedule Trigger: every 6h]
    ↓
[HTTP Request: Reddit API]   ← GET https://oauth.reddit.com/r/[subreddit]/new
    ↓
[HTTP Request: App Store RSS] ← GET https://itunes.apple.com/[app-id]/json?...
    ↓
[HTTP Request: Google Sheet]  ← Fallback demo data source
    ↓
[Merge Node: Combine All Sources]
    ↓
[Code Node: Normalize Schema]  ← JavaScript to normalize to { text, source, timestamp, userId }
    ↓
[HTTP Request: POST /nlp/deduplicate]  ← Call your Python FastAPI service
    ↓
[PostgreSQL Node: INSERT INTO raw_feedback]
    ↓
[HTTP Request: POST /api/pipeline/status/update]  ← Update pipeline stage to 'cleaning'
    ↓
[HTTP Request: POST /nlp/cluster]  ← Cluster the new deduplicated texts
    ↓
[PostgreSQL Node: INSERT INTO feedback_clusters]
    ↓
[Slack Node: "Ingestion complete: X items, Y clusters"]
```

**Error Handling:** Add an Error Trigger node connected to a Slack notification. If any API fails, log the error and continue with partial data — do NOT abort the whole pipeline.

---

### Workflow 2: BRD Generation (Triggered after clustering)

```
[Webhook Trigger: /webhook/generate-brds]  ← Called by Workflow 1 on completion
    ↓
[PostgreSQL Node: SELECT unprocessed clusters]
    ↓
[SplitInBatches Node: process 1 cluster at a time]
    ↓
[HTTP Request: Claude API — ANALYST AGENT]
    Method: POST
    URL: https://api.anthropic.com/v1/messages
    Headers: { "x-api-key": "{{$env.ANTHROPIC_API_KEY}}", "anthropic-version": "2023-06-01" }
    Body: { see Section 8 for exact prompt }
    ↓
[Code Node: Parse + Validate JSON response]
    - Extract the JSON from Claude's text response
    - Validate against BRD schema (required fields present?)
    - Extract confidence_score from response
    ↓
[IF Node: confidence_score >= 0.75?]
    ├── YES → [HTTP Request: Claude API — CRITIC AGENT]
    │              ↓
    │          [IF Node: critic_score >= 0.80?]
    │              ├── YES → [PostgreSQL: INSERT brd with status='pending_review']
    │              │          [HTTP Request: POST /api/notifications/new-brd]
    │              └── NO  → [PostgreSQL: INSERT brd with status='needs_revision']
    │                         [Code Node: Attach critic feedback to BRD]
    └── NO  → [PostgreSQL: INSERT brd with status='hitl_queue']
               [HTTP Request: POST /api/notifications/low-confidence-brd]
    ↓
[HTTP Request: POST /api/blockchain/log]  ← Log BRD hash to blockchain (async)
```

**CRITICAL n8n setting:** In the Claude API HTTP Request node, set timeout to 30000ms (30s). Claude can take up to 15s for complex generations.

---

### Workflow 3: Epic Generation (Triggered by human finalizing priority)

```
[Webhook Trigger: /webhook/generate-epics]
    Body includes: { brdIds: string[] }
    ↓
[PostgreSQL Node: SELECT approved BRDs by IDs]
    ↓
[SplitInBatches: 1 BRD at a time]
    ↓
[HTTP Request: Claude API — STORY WRITER AGENT]
    { see Section 8 for exact prompt }
    ↓
[Code Node: Parse epics JSON, validate each user story has AC]
    ↓
[PostgreSQL: INSERT epics + user_stories + acceptance_criteria]
    ↓
[HTTP Request: POST /api/blockchain/log]  ← Log epic bundle hash
    ↓
[HTTP Request: Claude API — SA BRIEF AGENT]
    { see Section 8 for exact prompt }
    ↓
[PostgreSQL: INSERT sa_brief]
    ↓
[Gmail Node: Send SA Handoff email with PDF attachment]
    (or Slack Node to #solution-architecture channel)
```

---

### Workflow 4: Human Approval Webhook Handler

```
[Webhook Trigger: /webhook/brd-decision]
    Body: { brdId: string, decision: 'approve'|'reject', edits?: object, reason?: string }
    ↓
[IF Node: decision === 'approve'?]
    ├── YES → [PostgreSQL: UPDATE brds SET status='approved']
    │          [IF: edits present?]
    │              ├── YES → [HTTP Request: POST /api/blockchain/log { eventType: 'BRD_EDITED' }]
    │              └── NO  → [HTTP Request: POST /api/blockchain/log { eventType: 'BRD_APPROVED' }]
    └── NO  → [PostgreSQL: UPDATE brds SET status='rejected', rejection_reason=...]
               [HTTP Request: POST /api/notifications/brd-rejected]
    ↓
[Respond to Webhook: { success: true }]
```

---

### Workflow 5: Pipeline Health Monitor (Runs every 15 min)

```
[Schedule Trigger: every 15min]
    ↓
[PostgreSQL: SELECT COUNT(*) of items stuck in each stage > 2h]
    ↓
[IF: any stuck items?]
    └── YES → [Slack Node: alert #autoflow-ops with details]
```

---

## 8. AI AGENT PROMPTS

> **IMPORTANT:** All prompts use JSON-only output mode. Always append `"\n\nRespond with ONLY valid JSON. No markdown, no explanation, no preamble."` to every prompt.

### Agent 1: Analyst Agent (BRD Generator)

```
SYSTEM:
You are a Senior Business Analyst at a SaaS company. You analyze aggregated customer feedback 
and write professional Business Requirement Documents (BRDs). You are precise, evidence-based, 
and always ground your output in the actual customer feedback provided. You never invent 
requirements not supported by the data.

USER:
Below is a cluster of {mention_count} customer feedback items about the same theme, 
collected from {sources} between {date_range}.

FEEDBACK CLUSTER (Topic: {topic_label}):
{feedback_texts_as_numbered_list}

Write a Business Requirement Document for this customer need. Output ONLY the following JSON:
{
  "title": "Short, specific title (max 10 words)",
  "problem_statement": "2–3 sentences describing the problem customers are experiencing, citing evidence from the feedback",
  "target_audience": "Specific user segment affected",
  "business_value": "Why solving this matters to the business (revenue, retention, NPS)",
  "proposed_solution_hint": "1–2 sentence directional suggestion (NOT technical spec)",
  "success_metrics": ["Metric 1", "Metric 2", "Metric 3"],
  "out_of_scope": ["What this BRD explicitly does NOT cover"],
  "source_evidence": ["Direct quote 1 from feedback", "Direct quote 2", "Direct quote 3"],
  "wsjf_estimates": {
    "business_value": 7,
    "time_criticality": 6,
    "risk_reduction": 4,
    "effort": 5
  },
  "confidence_score": 0.87,
  "confidence_reasoning": "Why you gave this confidence score"
}

Confidence score rules:
- 0.90–1.0: Very clear, consistent, high-volume feedback with obvious business value
- 0.75–0.89: Clear feedback but some ambiguity in scope or value
- 0.50–0.74: Feedback is sparse, contradictory, or very niche — flag for human review
- Below 0.50: Insufficient data — do not generate BRD

Respond with ONLY valid JSON. No markdown, no explanation, no preamble.
```

---

### Agent 2: Critic Agent (BRD QA Reviewer)

```
SYSTEM:
You are a Principal Product Manager conducting a quality review of an AI-generated BRD. 
Your job is to catch problems BEFORE a human wastes time reviewing a bad document.
Be strict. Your review protects the PM's time.

USER:
Review the following BRD against the INVEST and quality criteria below.

BRD TO REVIEW:
{brd_json}

REVIEW CRITERIA:
1. COMPLETENESS: Are all required fields present and non-empty?
2. SPECIFICITY: Is the problem statement specific (not "users want it to be better")?
3. EVIDENCE: Does the BRD cite actual customer feedback? (not fabricated)
4. MEASURABILITY: Are success metrics measurable (numbers, not "improve")?
5. SCOPE: Is scope clearly bounded? Is out_of_scope populated?
6. AMBIGUITY: Flag any vague words: "fast", "easy", "better", "improve", "enhance"
7. CONTRADICTIONS: Does any part contradict another part?
8. SINGLE CONCERN: Does this BRD address one clear need? Or is it bundling multiple things?

Output ONLY this JSON:
{
  "critic_score": 0.85,
  "passed": true,
  "issues": [
    {
      "criterion": "AMBIGUITY",
      "severity": "warning",
      "field": "proposed_solution_hint",
      "description": "The phrase 'faster loading' is unmeasurable. Suggest: 'reduce load time to under 2 seconds'"
    }
  ],
  "suggested_fixes": {
    "proposed_solution_hint": "Revised text here if you have a suggested fix"
  },
  "overall_comment": "One sentence summary of the BRD quality"
}

Critic score rules: 1.0 = perfect, 0.80+ = approve with minor notes, below 0.80 = return for revision.
Passed = true only if critic_score >= 0.80 AND no 'blocker' severity issues.

Respond with ONLY valid JSON. No markdown, no explanation, no preamble.
```

---

### Agent 3: Story Writer Agent (Epic Generator)

```
SYSTEM:
You are a certified Scrum Product Owner with 10 years of experience writing agile epics and 
user stories. You follow the INVEST principles strictly. You write stories that developers 
can actually implement without asking clarifying questions.

USER:
Convert the following approved Business Requirement Document into a full set of Agile Epics 
and User Stories.

BRD:
{approved_brd_json}

RULES:
1. Create 1–3 Epics maximum for this BRD
2. Each Epic must have 2–5 User Stories
3. Every User Story MUST follow: "As a [specific user type], I want [specific action], so that [clear benefit]"
4. Every User Story MUST have exactly 3 Acceptance Criteria in Gherkin format:
   "GIVEN [context], WHEN [action], THEN [outcome]"
5. Estimate story points using Fibonacci: 1, 2, 3, 5, 8, 13 (13 = very complex, consider splitting)
6. No story should be larger than 8 points
7. Flag any story that has ambiguous acceptance criteria with "needs_clarification": true

Output ONLY this JSON:
{
  "brd_id": "{brd_id}",
  "epics": [
    {
      "epic_id": "E001",
      "title": "Epic title",
      "description": "1–2 sentence epic description",
      "user_stories": [
        {
          "story_id": "US001",
          "title": "Short title",
          "story": "As a [user type], I want [action], so that [benefit]",
          "story_points": 5,
          "priority": "high",
          "needs_clarification": false,
          "acceptance_criteria": [
            "GIVEN [context], WHEN [action], THEN [outcome]",
            "GIVEN [context], WHEN [action], THEN [outcome]",
            "GIVEN [context], WHEN [action], THEN [outcome]"
          ],
          "definition_of_done": ["Unit tests written", "Reviewed by QA", "Documentation updated"]
        }
      ]
    }
  ],
  "architecture_hints": ["Hint 1 for SA", "Hint 2 for SA"],
  "dependencies": ["What must exist before this can be built"],
  "total_story_points": 18
}

Respond with ONLY valid JSON. No markdown, no explanation, no preamble.
```

---

### Agent 4: SA Brief Agent (Solution Architect Handoff)

```
SYSTEM:
You are a Technical Lead who bridges product requirements and engineering architecture. 
You read finalized Epics and write a concise, actionable technical brief for the Solution Architect.
You suggest technologies based on patterns, not preferences. You flag risks.

USER:
The following Epics have been approved and are ready for system design. 
Write a technical handoff brief for the Solution Architect.

EPICS:
{epics_json}

COMPANY TECH CONTEXT (if provided):
{existing_stack_or_empty}

Output ONLY this JSON:
{
  "brief_title": "SA Handoff: [BRD Title]",
  "summary": "2–3 sentence summary of what needs to be built",
  "suggested_components": [
    {
      "component": "Component name",
      "type": "service|database|queue|frontend|api",
      "rationale": "Why this component is needed",
      "tech_options": ["Option A", "Option B"]
    }
  ],
  "data_model_hints": [
    {
      "entity": "EntityName",
      "key_fields": ["field1", "field2"],
      "relationships": "Describe relationships"
    }
  ],
  "api_surface_hints": [
    "POST /api/[resource] — Create [thing]",
    "GET /api/[resource]/:id — Fetch [thing]"
  ],
  "technical_risks": [
    {
      "risk": "Risk description",
      "severity": "high|medium|low",
      "mitigation": "Suggested approach"
    }
  ],
  "questions_for_sa": ["Open question 1", "Open question 2"],
  "estimated_complexity": "small|medium|large|very-large"
}

Respond with ONLY valid JSON. No markdown, no explanation, no preamble.
```

---

## 9. BLOCKCHAIN INTEGRATION

### 9.1 Smart Contract (AuditRegistry.sol)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AuditRegistry {
    struct AuditRecord {
        bytes32 contentHash;    // SHA-256 of the document
        string  ipfsCid;        // IPFS content ID for full document
        string  eventType;      // "BRD_GENERATED", "BRD_APPROVED", "EPIC_CREATED", etc.
        address actor;          // Wallet address of the writer (agent or human)
        uint256 timestamp;      // Block timestamp
        bool    exists;
    }

    // recordId (UUID from your DB) => AuditRecord
    mapping(string => AuditRecord) private records;
    string[] private recordIds;

    event RecordLogged(
        string indexed recordId,
        bytes32 indexed contentHash,
        string eventType,
        address indexed actor,
        uint256 timestamp
    );

    function logRecord(
        string calldata recordId,
        bytes32 contentHash,
        string calldata ipfsCid,
        string calldata eventType
    ) external {
        require(!records[recordId].exists, "Record already exists");
        records[recordId] = AuditRecord({
            contentHash: contentHash,
            ipfsCid: ipfsCid,
            eventType: eventType,
            actor: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });
        recordIds.push(recordId);
        emit RecordLogged(recordId, contentHash, eventType, msg.sender, block.timestamp);
    }

    function getRecord(string calldata recordId)
        external view returns (AuditRecord memory)
    {
        require(records[recordId].exists, "Record not found");
        return records[recordId];
    }

    function verifyRecord(string calldata recordId, bytes32 claimedHash)
        external view returns (bool)
    {
        require(records[recordId].exists, "Record not found");
        return records[recordId].contentHash == claimedHash;
    }
}
```

### 9.2 Deployment Steps
```bash
# 1. Install dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# 2. Configure hardhat.config.ts
networks: {
  mumbai: {
    url: process.env.POLYGON_MUMBAI_RPC,   // Get from Alchemy or Infura
    accounts: [process.env.AGENT_PRIVATE_KEY]
  }
}

# 3. Deploy to testnet
npx hardhat run scripts/deploy.ts --network mumbai

# 4. Save the deployed contract address → add to .env as CONTRACT_ADDRESS
```

### 9.3 What to Write On-Chain (Timeline)
| Trigger | Event Type | What gets hashed |
|---------|-----------|-----------------|
| New BRD generated by AI | `BRD_GENERATED` | Full BRD JSON |
| Human approves BRD | `BRD_APPROVED` | BRD + approver email + timestamp |
| Human edits BRD | `BRD_EDITED` | BRD + diff + approver email |
| Priority order finalized | `PRIORITY_SET` | Ordered BRD IDs + WSJF scores |
| Epic bundle created | `EPIC_CREATED` | Full epics JSON |
| SA Handoff delivered | `SA_DELIVERY` | SA Brief JSON + delivery timestamp |

---

## 10. DATABASE SCHEMA

```sql
-- Raw feedback from all sources
CREATE TABLE raw_feedback (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source          VARCHAR(50) NOT NULL,  -- 'reddit', 'app_store', 'twitter', 'sheet'
    external_id     VARCHAR(255),          -- original ID from the source platform
    text            TEXT NOT NULL,
    author_id       VARCHAR(255),
    author_tier     VARCHAR(50) DEFAULT 'free',  -- 'free', 'pro', 'enterprise'
    sentiment       VARCHAR(20),           -- 'positive', 'negative', 'neutral'
    sentiment_score FLOAT,                 -- 0–1 confidence
    is_duplicate    BOOLEAN DEFAULT false,
    cluster_id      UUID REFERENCES feedback_clusters(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    collected_at    TIMESTAMPTZ DEFAULT NOW()
);

-- NLP-generated topic clusters
CREATE TABLE feedback_clusters (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_label     VARCHAR(255),
    keywords        TEXT[],
    mention_count   INT DEFAULT 0,
    avg_sentiment   FLOAT,
    processed       BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- AI-generated BRDs
CREATE TABLE brds (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster_id          UUID REFERENCES feedback_clusters(id),
    title               VARCHAR(500),
    problem_statement   TEXT,
    target_audience     TEXT,
    business_value      TEXT,
    proposed_solution   TEXT,
    success_metrics     TEXT[],
    out_of_scope        TEXT[],
    source_evidence     TEXT[],
    wsjf_bv             FLOAT,   -- business value estimate
    wsjf_tc             FLOAT,   -- time criticality estimate
    wsjf_rr             FLOAT,   -- risk reduction estimate
    wsjf_effort         FLOAT,   -- effort estimate
    wsjf_final_score    FLOAT,   -- computed score
    confidence_score    FLOAT,
    confidence_reason   TEXT,
    critic_score        FLOAT,
    critic_issues       JSONB,
    status              VARCHAR(50) DEFAULT 'pending_generation',
    -- Status flow: pending_generation → pending_review → approved → rejected → generating_epics → done
    reviewer_email      VARCHAR(255),
    reviewed_at         TIMESTAMPTZ,
    original_ai_json    JSONB,   -- store original AI output before any human edits
    blockchain_tx_hash  VARCHAR(255),
    ipfs_cid            VARCHAR(255),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Epics generated from approved BRDs
CREATE TABLE epics (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brd_id          UUID REFERENCES brds(id),
    epic_ref        VARCHAR(20),   -- E001, E002
    title           VARCHAR(500),
    description     TEXT,
    total_points    INT,
    status          VARCHAR(50) DEFAULT 'draft',
    blockchain_tx_hash VARCHAR(255),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Individual user stories
CREATE TABLE user_stories (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    epic_id             UUID REFERENCES epics(id),
    story_ref           VARCHAR(20),  -- US001
    title               VARCHAR(500),
    story_text          TEXT,         -- "As a ... I want ... so that ..."
    story_points        INT,
    priority            VARCHAR(20),
    needs_clarification BOOLEAN DEFAULT false,
    acceptance_criteria TEXT[],
    definition_of_done  TEXT[],
    status              VARCHAR(50) DEFAULT 'draft',
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Blockchain audit log (mirror of on-chain records for fast querying)
CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id       VARCHAR(255) UNIQUE,  -- same ID used on-chain
    event_type      VARCHAR(100),
    content_hash    VARCHAR(255),
    ipfs_cid        VARCHAR(255),
    tx_hash         VARCHAR(255),
    actor           VARCHAR(255),   -- email or 'AI_AGENT'
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_raw_feedback_cluster ON raw_feedback(cluster_id);
CREATE INDEX idx_brds_status ON brds(status);
CREATE INDEX idx_brds_wsjf ON brds(wsjf_final_score DESC);
CREATE INDEX idx_epics_brd ON epics(brd_id);
CREATE INDEX idx_audit_event ON audit_log(event_type, created_at DESC);
```

---

## 11. KNOWN PROBLEMS & EXACT SOLUTIONS

### Problem 1: Reddit/Twitter APIs fail or rate-limit during demo
**Impact:** No data → pipeline cannot start.
**Solution:**
- Pre-load 50–100 real reviews into PostgreSQL raw_feedback table before the demo.
- Add a Google Sheets data source node in n8n (always works, no auth issues).
- Add a "Demo Mode" flag in `/settings` — when enabled, pipeline uses pre-loaded data.
- Keep the real API calls in the workflow but wrap in n8n's `Continue on Fail` setting.

### Problem 2: Claude returns malformed JSON
**Impact:** Code Node in n8n crashes, workflow aborts.
**Solution:**
```javascript
// In n8n Code Node — wrap ALL Claude response parsing like this:
function parseClaudeResponse(rawText) {
  // Remove any markdown code fences
  let clean = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  // Try direct parse
  try {
    return JSON.parse(clean);
  } catch(e) {
    // Try to extract JSON object from surrounding text
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch(e2) {}
    }
    // All parsing failed — return a failure object
    return { parse_error: true, raw: rawText };
  }
}
```
If `parse_error` is true, route to HITL queue with the raw text. Never abort.

### Problem 3: AI confidence scores are too low (many items going to HITL queue)
**Impact:** PM gets overwhelmed, bottleneck shifts to human.
**Solution:**
- Tune threshold in settings (default 0.75, adjustable 0.60–0.90).
- Improve clustering quality — if clusters are too small (< 5 items), merge them before sending to AI.
- Add few-shot examples to the Analyst Agent prompt (show 2 good BRDs as reference).
- Set a daily limit on HITL queue items — max 5 per day, rest auto-defer to next cycle.

### Problem 4: WSJF scores feel wrong to the PM
**Impact:** PM doesn't trust the priority order.
**Solution:**
- Show the score breakdown in the UI (not just the final number).
- Allow PM to adjust individual axis scores (not just drag-and-drop).
- Add a "Why is this ranked here?" explanation button — simple template text using the score components.
- Store PM overrides — after 10 overrides, surface a pattern report: "You consistently raise Time Criticality for Auth-related BRDs."

### Problem 5: Blockchain writes slow down the pipeline
**Impact:** Workflow takes too long, demo lags.
**Solution:**
- Make ALL blockchain writes async. n8n workflow does NOT wait for blockchain confirmation.
- Use a separate Redis queue for blockchain writes. A separate worker processes the queue.
- Show "Pending ⏳" in the audit UI until the TX confirms. Update via polling.
- For demo: pre-confirm 2–3 transactions before your presentation to show completed records.

### Problem 6: n8n workflow fails silently mid-execution
**Impact:** Data is stuck, pipeline stage never updates.
**Solution:**
- Every workflow ends with a PostgreSQL write updating `pipeline_status`.
- The Health Monitor workflow (Workflow 5) catches stuck states after 2 hours.
- Add a dead letter queue in PostgreSQL: `failed_jobs` table with error details.
- n8n Error Trigger node → POST to `/api/pipeline/error` → Slack alert.

---

## 12. FEASIBILITY RATING

### Overall Rating: 7.2 / 10 ⭐

| Component | Feasibility | Risk | Notes |
|-----------|-------------|------|-------|
| n8n Data Ingestion | 9/10 | Low | n8n HTTP nodes are reliable; App Store RSS is public |
| Python NLP Service | 7/10 | Medium | BERTopic can be slow on first run; pre-download models |
| Claude AI Agents | 8/10 | Low | Reliable API; main risk is JSON parsing (mitigated above) |
| HITL Frontend | 8/10 | Low | Standard Next.js CRUD — straightforward |
| WSJF Scoring | 9/10 | Low | Pure math, fully deterministic |
| Blockchain Layer | 6/10 | Medium-High | Testnet can be flaky; Pinata IPFS sometimes slow |
| Full Integration | 6/10 | High | Many moving parts; integration bugs expected |
| Demo in 48h | 7/10 | Medium | Achievable with MVP scope (below) |

### MVP Scope for 48-Hour Hackathon
To win, you do NOT need to build everything. Build this:

**Must Have (Day 1):**
- [ ] Google Sheets → n8n → Claude Analyst Agent → BRD JSON → Dashboard
- [ ] HITL BRD approval UI (basic, no edit mode needed for day 1)
- [ ] WSJF scoring + priority drag-and-drop
- [ ] Claude Story Writer → Epic + User Story display

**Must Have (Day 2 morning):**
- [ ] Blockchain write on BRD approval (even if just local Hardhat)
- [ ] Audit log table in UI showing TX hashes
- [ ] Critic Agent review in the pipeline

**Nice to Have (if time permits):**
- [ ] Real Reddit/Twitter API instead of Google Sheets
- [ ] IPFS full document storage
- [ ] SA Brief Agent
- [ ] Email delivery to SA

**Cut entirely for hackathon:**
- ❌ Multi-language support
- ❌ User authentication (use a hardcoded demo login)
- ❌ Real Jira integration
- ❌ Advanced analytics / reporting

---

## 13. SYSTEM DESIGN DIAGRAMS

### 13.1 High-Level System Context
```
┌─────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL DATA SOURCES                           │
│   Reddit API    Twitter/X API    App Store API    Google Sheets (Demo)  │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │ HTTP pull (every 6h)
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        n8n ORCHESTRATION LAYER                          │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │ Ingestion  │  │ BRD Gen     │  │ Epic Gen     │  │ Health Mon.  │ │
│  │ Workflow   │  │ Workflow    │  │ Workflow     │  │ Workflow     │ │
│  └─────┬──────┘  └──────┬──────┘  └──────┬───────┘  └───────────────┘ │
└────────┼────────────────┼────────────────┼──────────────────────────────┘
         │                │                │
         ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND SERVICES                                │
│                                                                         │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐  │
│  │  Express REST API │    │  Python FastAPI   │    │ Blockchain       │  │
│  │  (Node.js)        │    │  NLP Service      │    │ Notary Service   │  │
│  │                   │    │                   │    │ (ethers.js)      │  │
│  │ • BRD CRUD        │    │ • BERTopic        │    │                  │  │
│  │ • Priority Mgmt   │    │ • Deduplication   │    │ • SHA-256 hash   │  │
│  │ • WSJF Scoring    │    │ • Sentiment       │    │ • IPFS upload    │  │
│  │ • Webhook handler │    │                   │    │ • Polygon write  │  │
│  └──────────┬────────┘    └────────────────────┘    └────────┬─────────┘  │
│             │                                                 │          │
│             ▼                                                 ▼          │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐  │
│  │   PostgreSQL      │    │     Redis         │    │  Polygon Testnet │  │
│  │   (Primary DB)    │    │  (Queue/Cache)    │    │  + IPFS/Pinata   │  │
│  └───────────────────┘    └───────────────────┘    └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (Next.js)                             │
│                                                                         │
│  Dashboard  │  BRD Review  │  Priority UI  │  Epics  │  Audit Explorer │
│             │  (HITL #1)   │  (HITL #2)    │  View   │                 │
└─────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL DELIVERY                                   │
│                                                                         │
│          Solution Architect (Email / Slack / Confluence)                │
└─────────────────────────────────────────────────────────────────────────┘
```

### 13.2 n8n BRD Generation Workflow (Detailed)
```
[Schedule / Webhook Trigger]
        │
        ▼
[PostgreSQL: Fetch unprocessed clusters]
        │
        ├─── No clusters found? → [END: log "nothing to process"]
        │
        ▼
[SplitInBatches: 1 cluster at a time]
        │
        ▼
[HTTP: Call Python /nlp/sentiment for this cluster]
        │
        ▼
[HTTP: Claude API — Analyst Agent prompt]
        │
        ├─── API Error? → [Log to failed_jobs] → [Next batch item]
        │
        ▼
[Code Node: parseClaudeResponse()]
        │
        ├─── parse_error: true → [PostgreSQL: INSERT with status=parse_error]
        │                        [Slack: alert] → [Next batch item]
        ▼
[IF: confidence_score >= 0.75]
    │                    │
  YES                   NO
    │                    │
    ▼                    ▼
[HTTP: Claude API     [PostgreSQL: INSERT brd
 Critic Agent]         status='hitl_queue']
    │                    │
    ▼                    ▼
[IF: critic_score     [Slack: "Low confidence
 >= 0.80]              BRD needs human review"]
    │         │
  YES        NO
    │         │
    ▼         ▼
[PostgreSQL: [PostgreSQL: INSERT brd
 INSERT brd   status='needs_revision'
 status=      + critic_issues]
 'pending_review']
    │
    ▼
[HTTP: POST /api/blockchain/log (async — no wait)]
    │
    ▼
[HTTP: POST /api/notifications/new-brd-ready]
```

### 13.3 HITL Decision Flow
```
┌─────────────────────────────────────────────────────────┐
│                     BRD STATUS MACHINE                  │
│                                                         │
│  pending_generation                                     │
│          │                                              │
│          ▼                                              │
│  [Analyst Agent runs]                                   │
│          │                                              │
│   ┌──────┴───────┐                                      │
│   │              │                                      │
│   ▼              ▼                                      │
│  confidence    confidence                               │
│  >= 0.75       < 0.75                                   │
│   │              │                                      │
│   ▼              ▼                                      │
│  [Critic       hitl_queue ──► HUMAN REVIEWS ─┐         │
│   Agent]                                      │         │
│   │                                           │         │
│   ├── score >= 0.80 → pending_review          │         │
│   └── score < 0.80  → needs_revision          │         │
│                                               │         │
│  pending_review ──────────────────────────────┘         │
│          │                                              │
│   HUMAN APPROVES / REJECTS                             │
│          │                                              │
│   ┌──────┴────────┐                                     │
│   ▼               ▼                                     │
│  approved        rejected                               │
│   │               │                                     │
│   ▼               └──► archived                         │
│  [WSJF Score]                                           │
│   │                                                     │
│   ▼                                                     │
│  in_priority_queue                                      │
│   │                                                     │
│   ▼                                                     │
│  selected_for_epics                                     │
│   │                                                     │
│   ▼                                                     │
│  generating_epics                                       │
│   │                                                     │
│   ▼                                                     │
│  delivered                                              │
└─────────────────────────────────────────────────────────┘
```

### 13.4 Blockchain Audit Flow
```
[Any pipeline event occurs]
        │
        ▼
[blockchainService.logToBlockchain(data, eventType)]
        │
        ├─── 1. JSON.stringify(data)
        ├─── 2. SHA-256 hash
        ├─── 3. Upload to IPFS (Pinata) → get CID
        ├─── 4. call AuditRegistry.logRecord(id, hash, cid, eventType)
        └─── 5. await tx.wait() → get txHash
        │
        ▼
[INSERT INTO audit_log (id, eventType, hash, ipfsCid, txHash)]
        │
        ▼
[Frontend /audit page shows:
  Event | Hash (truncated) | IPFS link | Polygonscan link | Timestamp]

[VERIFY button: user clicks it on any BRD]
        │
        ▼
[Fetch BRD from DB → re-hash → compare to on-chain hash]
        │
   ┌────┴────┐
   │         │
  MATCH    MISMATCH
   │         │
   ▼         ▼
"VERIFIED  "TAMPERED
 ✅"        ⚠️ — on-chain
            hash differs
            from current DB"
```

---

## 14. DEMO SCRIPT (Hackathon Presentation)

### 2-minute demo flow:

**[0:00–0:20] — The Problem**
"Every product team wastes 4–7 weeks manually processing customer feedback. We built AutoFlow to automate that — with humans staying in control at every critical decision."

**[0:20–0:50] — Live Pipeline**
- Click "Run Pipeline" in dashboard
- Show n8n canvas on second screen — watch nodes light up green
- Point to the data flowing: "Google Sheets → dedup → BERTopic clustering → Claude BRD generation"

**[0:50–1:10] — Human in the Loop**
- Navigate to BRD Review page
- "The AI has drafted this BRD with 89% confidence. I can approve it, edit it, or reject it."
- Click Approve — show the success toast

**[1:10–1:30] — Priority + Epic Generation**
- Navigate to Priority page — show drag-and-drop reordering
- Click "Generate Epics"
- Navigate to Epics page — show User Stories with Gherkin acceptance criteria

**[1:30–1:50] — Blockchain Audit**
- Navigate to Audit page
- "Every AI decision is permanently recorded on Polygon blockchain."
- Click the Polygonscan link — show the live testnet transaction
- Click "Verify" on the BRD — show "VERIFIED ✅"

**[1:50–2:00] — Closing**
"What took 4–7 weeks now takes 48 hours. The human stays in control. Every decision is auditable. This is AutoFlow."

---

## APPENDIX: Docker Compose Setup

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: autoflow
      POSTGRES_USER: autoflow
      POSTGRES_PASSWORD: autoflow_dev
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  n8n:
    image: n8nio/n8n:latest
    environment:
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_DATABASE: n8n
      DB_POSTGRESDB_USER: autoflow
      DB_POSTGRESDB_PASSWORD: autoflow_dev
      N8N_BASIC_AUTH_ACTIVE: "true"
      N8N_BASIC_AUTH_USER: admin
      N8N_BASIC_AUTH_PASSWORD: admin
      WEBHOOK_URL: http://localhost:5678/
    ports: ["5678:5678"]
    depends_on: [postgres]

  nlp-service:
    build: ./nlp-service
    ports: ["8001:8001"]
    volumes: [./nlp-service:/app]

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://autoflow:autoflow_dev@postgres:5432/autoflow
      REDIS_URL: redis://redis:6379
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      POLYGON_RPC_URL: ${POLYGON_RPC_URL}
      AGENT_PRIVATE_KEY: ${AGENT_PRIVATE_KEY}
      CONTRACT_ADDRESS: ${CONTRACT_ADDRESS}
      N8N_WEBHOOK_BASE: http://n8n:5678
    ports: ["3001:3001"]
    depends_on: [postgres, redis]

  frontend:
    build: ./frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
    ports: ["3000:3000"]
    depends_on: [backend]

volumes:
  postgres_data:
```

---

*End of AutoFlow Intelligence Master Build Prompt*
*Version 2.0 — Ready for Claude Opus 4.6*
