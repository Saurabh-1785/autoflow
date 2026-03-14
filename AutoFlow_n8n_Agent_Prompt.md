# AUTOFLOW INTELLIGENCE — n8n WORKFLOW GENERATION PROMPT
### For: Gemini 3.1 pro
### Task: Generate ALL n8n workflow JSON files + backend folder structure
### Version: 1.0 | March 2026

---

## ⚠️ READ THIS FIRST — WHAT YOU ARE BUILDING

You are implementing the **automation layer** of AutoFlow Intelligence — a Human-in-the-Loop AI pipeline that converts raw customer feedback into Engineering Epics via an n8n orchestration system backed by Claude AI agents.

You will produce:
1. A `backend/` folder with the complete file structure
2. Six n8n workflow JSON files (importable directly into n8n)
3. A `docker-compose.yml` to run everything locally
4. A setup guide (`SETUP.md`) with exact commands to run

**DO NOT generate frontend code. DO NOT generate the NLP Python service. Focus entirely on the n8n workflows + backend Node.js service that those workflows call.**

---

## STEP 0 — UNDERSTAND THE FOLDER STRUCTURE YOU MUST CREATE

Generate exactly this folder tree. Every file listed must be created with real, working content:

```
autoflow/
├── docker-compose.yml              ← Single command to start everything
├── .env.example                    ← All required env variables
├── SETUP.md                        ← Step-by-step setup guide
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── server.ts               ← Express app entry
│   │   ├── app.ts                  ← App setup, middleware
│   │   ├── routes/
│   │   │   ├── pipeline.routes.ts  ← /api/pipeline/*
│   │   │   ├── brds.routes.ts      ← /api/brds/*
│   │   │   ├── priority.routes.ts  ← /api/priority/*
│   │   │   ├── epics.routes.ts     ← /api/epics/*
│   │   │   ├── audit.routes.ts     ← /api/audit/*
│   │   │   └── notifications.routes.ts
│   │   ├── services/
│   │   │   ├── brd.service.ts
│   │   │   ├── priority.service.ts ← WSJF scoring algorithm
│   │   │   ├── blockchain.service.ts ← ethers.js Polygon writes
│   │   │   ├── pipeline.service.ts ← Trigger n8n webhooks
│   │   │   └── notification.service.ts ← Slack/email alerts
│   │   ├── db/
│   │   │   ├── schema.sql          ← Full PostgreSQL schema
│   │   │   ├── seed.sql            ← Demo seed data (50 fake reviews)
│   │   │   └── client.ts           ← pg Pool client
│   │   └── middleware/
│   │       ├── validate.ts
│   │       └── errorHandler.ts
│   └── Dockerfile
│
├── blockchain/
│   ├── contracts/
│   │   └── AuditRegistry.sol       ← Smart contract
│   ├── scripts/
│   │   └── deploy.ts               ← Hardhat deploy script
│   ├── hardhat.config.ts
│   └── package.json
│
└── n8n/
    ├── workflows/
    │   ├── 01_data_ingestion.json          ← Workflow 1
    │   ├── 02_brd_generation.json          ← Workflow 2
    │   ├── 03_epic_generation.json         ← Workflow 3 (was Workflow 5)
    │   ├── 04_human_approval_handler.json  ← Workflow 4 (was Workflow 6)
    │   ├── 05_prioritization.json          ← Workflow 5 (was Workflow 4)
    │   └── 06_health_monitor.json          ← Workflow 6
    └── README.md                           ← How to import these workflows
```

---

## STEP 1 — GENERATE THE BACKEND (Node.js + Express + TypeScript)

### 1A. `backend/package.json`
Generate with these exact dependencies:
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "pg": "^8.11.0",
    "redis": "^4.6.0",
    "ethers": "^6.9.0",
    "axios": "^1.6.0",
    "zod": "^3.22.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.0",
    "uuid": "^9.0.0",
    "crypto": "built-in"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/express": "^4.17.0",
    "@types/pg": "^8.10.0",
    "@types/node": "^20.0.0",
    "ts-node": "^10.9.0",
    "nodemon": "^3.0.0"
  }
}
```

### 1B. `backend/src/db/schema.sql`
Generate the COMPLETE PostgreSQL schema with ALL these tables (real SQL, no placeholders):

```sql
-- raw_feedback: stores every scraped review/tweet/post
CREATE TABLE raw_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source VARCHAR(50) NOT NULL,          -- 'reddit','app_store','twitter','sheet'
    external_id VARCHAR(255),
    text TEXT NOT NULL,
    author_id VARCHAR(255),
    author_tier VARCHAR(50) DEFAULT 'free', -- 'free','pro','enterprise'
    sentiment VARCHAR(20),
    sentiment_score FLOAT,
    is_duplicate BOOLEAN DEFAULT false,
    cluster_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    collected_at TIMESTAMPTZ DEFAULT NOW()
);

-- feedback_clusters: NLP-generated topic groups
CREATE TABLE feedback_clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_label VARCHAR(255),
    keywords TEXT[],
    mention_count INT DEFAULT 0,
    avg_sentiment FLOAT,
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- brds: AI-generated Business Requirement Documents
CREATE TABLE brds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster_id UUID REFERENCES feedback_clusters(id),
    title VARCHAR(500),
    problem_statement TEXT,
    target_audience TEXT,
    business_value TEXT,
    proposed_solution TEXT,
    success_metrics TEXT[],
    out_of_scope TEXT[],
    source_evidence TEXT[],
    wsjf_bv FLOAT,
    wsjf_tc FLOAT,
    wsjf_rr FLOAT,
    wsjf_effort FLOAT,
    wsjf_final_score FLOAT,
    confidence_score FLOAT,
    confidence_reason TEXT,
    critic_score FLOAT,
    critic_issues JSONB,
    status VARCHAR(50) DEFAULT 'pending_generation',
    reviewer_email VARCHAR(255),
    reviewed_at TIMESTAMPTZ,
    original_ai_json JSONB,
    blockchain_tx_hash VARCHAR(255),
    ipfs_cid VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- epics: agile epics derived from approved BRDs
CREATE TABLE epics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brd_id UUID REFERENCES brds(id),
    epic_ref VARCHAR(20),
    title VARCHAR(500),
    description TEXT,
    total_points INT,
    status VARCHAR(50) DEFAULT 'draft',
    blockchain_tx_hash VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_stories: individual stories within an epic
CREATE TABLE user_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    epic_id UUID REFERENCES epics(id),
    story_ref VARCHAR(20),
    title VARCHAR(500),
    story_text TEXT,
    story_points INT,
    priority VARCHAR(20),
    needs_clarification BOOLEAN DEFAULT false,
    acceptance_criteria TEXT[],
    definition_of_done TEXT[],
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- audit_log: mirror of on-chain records for fast UI querying
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id VARCHAR(255) UNIQUE,
    event_type VARCHAR(100),
    content_hash VARCHAR(255),
    ipfs_cid VARCHAR(255),
    tx_hash VARCHAR(255),
    actor VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- pipeline_status: current state of the automation pipeline
CREATE TABLE pipeline_status (
    id SERIAL PRIMARY KEY,
    stage VARCHAR(100),
    last_run TIMESTAMPTZ,
    items_processed INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'idle',
    error_message TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO pipeline_status (stage, status) VALUES ('ingestion', 'idle');

CREATE INDEX idx_raw_feedback_cluster ON raw_feedback(cluster_id);
CREATE INDEX idx_brds_status ON brds(status);
CREATE INDEX idx_brds_wsjf ON brds(wsjf_final_score DESC NULLS LAST);
CREATE INDEX idx_epics_brd ON epics(brd_id);
CREATE INDEX idx_audit_event ON audit_log(event_type, created_at DESC);
```

### 1C. `backend/src/db/seed.sql`
Generate 50 realistic fake customer reviews across 5 different feature themes for a fictional SaaS project management app. Use a variety of sentiments and phrasings. This is the demo dataset. Example structure:
```sql
INSERT INTO raw_feedback (source, external_id, text, author_id, author_tier, sentiment, sentiment_score, collected_at) VALUES
('sheet', 'demo_001', 'The dashboard takes forever to load when I have more than 10 projects open. This is killing my productivity.', 'user_001', 'pro', 'negative', 0.91, NOW() - INTERVAL '2 days'),
-- ... 49 more rows across themes: 
--   Theme A: Dashboard performance (12 reviews)
--   Theme B: Missing dark mode (10 reviews)  
--   Theme C: No mobile app / poor mobile experience (11 reviews)
--   Theme D: Broken CSV export (9 reviews)
--   Theme E: Need Slack integration (8 reviews)
```

### 1D. `backend/src/services/priority.service.ts`
Implement the WSJF scoring algorithm EXACTLY as specified:

```typescript
interface WsjfInput {
  businessValue: number;       // 1–10
  timeCriticality: number;     // 1–10
  riskReduction: number;       // 1–10
  effort: number;              // 1–10
  sourceWeight: number;        // enterprise=3.0, pro=2.0, free=1.0
  mentionCount: number;
  sentimentIntensity: number;  // 0–1
}

// Formula: WSJF = (BV * sourceWeight + TC + RR) / Effort
// Apply mention boost (log scale) and sentiment boost (1.5x if > 0.8 intensity)
export function calculateWsjf(input: WsjfInput): number {
  const costOfDelay = (input.businessValue * input.sourceWeight) + input.timeCriticality + input.riskReduction;
  const baseScore = costOfDelay / input.effort;
  const mentionBoost = Math.log10(input.mentionCount + 1) * 0.5;
  const sentimentBoost = input.sentimentIntensity > 0.8 ? 1.5 : 1.0;
  return parseFloat((baseScore * sentimentBoost + mentionBoost).toFixed(3));
}
```

### 1E. `backend/src/services/blockchain.service.ts`
Implement using ethers.js v6. Must include:
- `hashDocument(data: object): string` — SHA-256 of JSON.stringify(data)
- `uploadToIPFS(content: string): Promise<string>` — POST to Pinata API, return CID
- `logToBlockchain(recordId: string, data: object, eventType: string): Promise<string>` — hashes + uploads + writes to Polygon, returns txHash
- `verifyOnChain(recordId: string, currentData: object): Promise<boolean>` — re-hashes current data, compares to on-chain hash
- Graceful error handling: if blockchain write fails, log to `audit_log` with `tx_hash = 'PENDING_RETRY'` and continue. Never throw.

### 1F. All API Routes
Generate complete Express route handlers for:

**`/api/pipeline/status`** — GET, returns current pipeline stage + last run stats
**`/api/pipeline/trigger`** — POST, calls n8n webhook to start Workflow 1
**`/api/brds`** — GET (with `?status=` filter), returns BRD list with WSJF scores
**`/api/brds/:id`** — GET, returns full BRD detail including critic issues
**`/api/brds/:id/approve`** — PATCH, body: `{ edits?: Partial<BRD> }`. Updates DB, triggers blockchain log, calls n8n approval webhook
**`/api/brds/:id/reject`** — PATCH, body: `{ reason: string }`. Updates DB status to 'rejected'
**`/api/priority`** — GET, returns BRDs ordered by wsjf_final_score
**`/api/priority`** — PATCH, body: `{ orderedIds: string[] }`. Saves manual reordering to DB
**`/api/priority/finalize`** — POST, body: `{ selectedIds: string[], topN: number }`. Triggers n8n Epic Generation webhook with selected BRD IDs
**`/api/epics`** — GET, returns all generated epics with their user stories nested
**`/api/epics/:id`** — GET, full epic detail with user stories + acceptance criteria
**`/api/audit`** — GET (with `?page=&limit=` pagination), returns audit log
**`/api/audit/:brdId/verify`** — GET, re-hashes the BRD from DB and compares to on-chain record. Returns `{ verified: boolean, onChainHash, currentHash }`
**`/api/notifications/new-brd`** — POST (called by n8n), sends Slack notification
**`/api/notifications/low-confidence-brd`** — POST (called by n8n), sends Slack alert
**`/api/blockchain/log`** — POST, body: `{ recordId, data, eventType }`. Called by n8n to log blockchain records asynchronously

---

## STEP 2 — GENERATE THE BLOCKCHAIN CONTRACTS

### 2A. `blockchain/contracts/AuditRegistry.sol`
Generate the complete Solidity smart contract:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AuditRegistry {
    struct AuditRecord {
        bytes32 contentHash;
        string  ipfsCid;
        string  eventType;
        address actor;
        uint256 timestamp;
        bool    exists;
    }

    mapping(string => AuditRecord) private records;
    string[] private recordIds;

    event RecordLogged(
        string indexed recordId,
        bytes32 indexed contentHash,
        string eventType,
        address indexed actor,
        uint256 timestamp
    );

    function logRecord(string calldata recordId, bytes32 contentHash, string calldata ipfsCid, string calldata eventType) external {
        require(!records[recordId].exists, "Record already exists");
        records[recordId] = AuditRecord(contentHash, ipfsCid, eventType, msg.sender, block.timestamp, true);
        recordIds.push(recordId);
        emit RecordLogged(recordId, contentHash, eventType, msg.sender, block.timestamp);
    }

    function getRecord(string calldata recordId) external view returns (AuditRecord memory) {
        require(records[recordId].exists, "Record not found");
        return records[recordId];
    }

    function verifyRecord(string calldata recordId, bytes32 claimedHash) external view returns (bool) {
        require(records[recordId].exists, "Record not found");
        return records[recordId].contentHash == claimedHash;
    }

    function getTotalRecords() external view returns (uint256) {
        return recordIds.length;
    }
}
```

### 2B. `blockchain/hardhat.config.ts`
Configure for local Hardhat node AND Polygon Mumbai testnet.

### 2C. `blockchain/scripts/deploy.ts`
Hardhat deploy script that prints the contract address after deployment.

---

## STEP 3 — GENERATE ALL 6 n8n WORKFLOW JSON FILES

> **CRITICAL INSTRUCTIONS FOR n8n JSON:**
> 
> n8n workflows are stored as JSON. Each workflow JSON has this exact top-level structure:
> ```json
> {
>   "name": "AutoFlow - Workflow Name",
>   "nodes": [...],
>   "connections": {...},
>   "active": false,
>   "settings": { "executionOrder": "v1" },
>   "tags": []
> }
> ```
> 
> Each node has this structure:
> ```json
> {
>   "id": "unique-uuid-here",
>   "name": "Human readable name",
>   "type": "n8n-nodes-base.httpRequest",
>   "typeVersion": 4.1,
>   "position": [x, y],
>   "parameters": { ... node-specific params ... }
> }
> ```
> 
> Connections are defined separately:
> ```json
> "connections": {
>   "Node Name": {
>     "main": [[{ "node": "Next Node Name", "type": "main", "index": 0 }]]
>   }
> }
> ```
> 
> Use these exact n8n node types:
> - Schedule trigger: `"n8n-nodes-base.scheduleTrigger"`
> - Webhook: `"n8n-nodes-base.webhook"`
> - HTTP Request: `"n8n-nodes-base.httpRequest"`
> - PostgreSQL: `"n8n-nodes-base.postgres"`
> - IF: `"n8n-nodes-base.if"`
> - Code: `"n8n-nodes-base.code"`
> - Merge: `"n8n-nodes-base.merge"`
> - SplitInBatches: `"n8n-nodes-base.splitInBatches"`
> - Wait: `"n8n-nodes-base.wait"`
> - Slack: `"n8n-nodes-base.slack"`
> - Set: `"n8n-nodes-base.set"`
> - NoOp: `"n8n-nodes-base.noOp"`
> - Error Trigger: `"n8n-nodes-base.errorTrigger"`
> - Respond to Webhook: `"n8n-nodes-base.respondToWebhook"`

---

### WORKFLOW 1: `01_data_ingestion.json`

Generate the complete n8n JSON for this flow:

```
Schedule Trigger (every 6h)
    → HTTP Request: Reddit API (GET https://oauth.reddit.com/r/projectmanagement/new.json?limit=100)
    → HTTP Request: App Store RSS (GET https://itunes.apple.com/us/rss/customerreviews/id=DEMO_APP_ID/json)
    → HTTP Request: Google Sheets (GET https://sheets.googleapis.com/v4/spreadsheets/{{$env.SHEET_ID}}/values/A:E)
    → Merge (merge mode: "append", all 3 sources)
    → Code Node: Normalize to [{text, source, timestamp, userId, authorTier}]
        (JavaScript — handle Reddit .data.children[].data, App Store .feed.entry[], Sheets .values[])
    → HTTP Request: POST http://backend:3001/api/nlp-proxy/deduplicate
        (body: { texts: items.map(i => i.text) })
    → Code Node: Filter out duplicate texts from the merged list
    → PostgreSQL: INSERT INTO raw_feedback (batch insert, ON CONFLICT DO NOTHING on external_id)
    → HTTP Request: POST http://backend:3001/api/pipeline/status/update
        (body: { stage: 'clustering', itemsProcessed: {{ $json.insertedCount }} })
    → HTTP Request: POST http://nlp-service:8001/nlp/cluster
        (body: { texts: deduped texts array })
    → PostgreSQL: INSERT INTO feedback_clusters
    → Slack: message to #autoflow-ops "✅ Ingestion complete: {{X}} items, {{Y}} clusters formed"
    → HTTP Request: POST http://n8n:5678/webhook/generate-brds (trigger Workflow 2)
```

**Error node:** Add Error Trigger → Slack "❌ Ingestion error: {{$json.error.message}}" with continue-on-fail on each HTTP Request node.

**IMPORTANT for the Code Node — normalize schema:**
```javascript
// Normalize all 3 sources into unified format
const items = [];
// Reddit items come from $('HTTP Request Reddit').all()
// App Store items come from $('HTTP Request AppStore').all()  
// Sheet items come from $('HTTP Request Sheets').all()
// Handle each format and push to items[]
// Return items array
```

---

### WORKFLOW 2: `02_brd_generation.json`

Generate the complete n8n JSON for this flow:

```
Webhook Trigger: POST /webhook/generate-brds
    → PostgreSQL: SELECT * FROM feedback_clusters WHERE processed = false ORDER BY mention_count DESC
    → IF: are there any clusters? (check $json length > 0)
        → NO: NoOp (end quietly)
        → YES: SplitInBatches (batchSize: 1)
            → HTTP Request: Claude API (Analyst Agent)
                Method: POST
                URL: https://api.anthropic.com/v1/messages
                Headers:
                  x-api-key: {{$env.ANTHROPIC_API_KEY}}
                  anthropic-version: 2023-06-01
                  content-type: application/json
                Body (JSON):
                  {
                    "model": "claude-sonnet-4-20250514",
                    "max_tokens": 2000,
                    "system": "[ANALYST AGENT SYSTEM PROMPT — see Section 8 of master prompt]",
                    "messages": [{
                      "role": "user",
                      "content": "FEEDBACK CLUSTER (Topic: {{$json.topic_label}}):\n{{$json.keywords}}\n\nFeedback texts:\n{{$json.texts}}\n\n[REST OF ANALYST PROMPT USER MESSAGE]"
                    }]
                  }
                Timeout: 30000ms
            → Code Node: parseClaudeResponse()
                ```javascript
                function parseClaudeResponse(rawText) {
                  let clean = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                  try { return JSON.parse(clean); }
                  catch(e) {
                    const match = clean.match(/\{[\s\S]*\}/);
                    if (match) { try { return JSON.parse(match[0]); } catch(e2) {} }
                    return { parse_error: true, raw: rawText };
                  }
                }
                const raw = $input.first().json.content[0].text;
                const parsed = parseClaudeResponse(raw);
                return [{ json: parsed }];
                ```
            → IF: parse_error exists?
                → YES: PostgreSQL INSERT brd status='parse_error' + Slack alert → loop next
                → NO: IF confidence_score >= 0.75?
                    → YES (high confidence path):
                        → HTTP Request: Claude API (Critic Agent)
                            [Same API structure, different system prompt — CRITIC AGENT from master prompt]
                        → Code Node: parse critic response
                        → IF: critic_score >= 0.80?
                            → YES: PostgreSQL INSERT brd status='pending_review'
                                   → HTTP Request: POST http://backend:3001/api/notifications/new-brd
                            → NO:  PostgreSQL INSERT brd status='needs_revision' with critic_issues
                    → NO (low confidence path):
                        → PostgreSQL INSERT brd status='hitl_queue'
                        → HTTP Request: POST http://backend:3001/api/notifications/low-confidence-brd
            → HTTP Request: POST http://backend:3001/api/blockchain/log (async, no-wait)
                body: { recordId: brd.id, data: brd, eventType: 'BRD_GENERATED' }
            → PostgreSQL: UPDATE feedback_clusters SET processed=true WHERE id={{clusterId}}
```

---

### WORKFLOW 3: `03_epic_generation.json`

Generate the complete n8n JSON for this flow:

```
Webhook Trigger: POST /webhook/generate-epics
    Body: { brdIds: string[] }
    → Set Node: extract brdIds array from webhook body
    → PostgreSQL: SELECT * FROM brds WHERE id = ANY('{brdIds}'::uuid[]) AND status='approved'
    → SplitInBatches (batchSize: 1)
        → HTTP Request: Claude API (Story Writer Agent)
            [Use STORY WRITER AGENT system prompt from master prompt]
            Body: { model, max_tokens: 3000, system: [...], messages: [{ role: 'user', content: JSON.stringify(brd) }] }
            Timeout: 45000ms
        → Code Node: parse + validate epics JSON
            - Extract epics array
            - Validate each user story has: story_text, story_points, acceptance_criteria (exactly 3 items)
            - Flag stories with story_points > 8 as oversized
        → PostgreSQL: INSERT INTO epics
        → PostgreSQL: INSERT INTO user_stories (loop epics[].user_stories[])
        → HTTP Request: POST http://backend:3001/api/blockchain/log
            body: { recordId: epic.id, data: epicBundle, eventType: 'EPIC_CREATED' }
        → HTTP Request: Claude API (SA Brief Agent)
            [Use SA BRIEF AGENT system prompt from master prompt]
        → Code Node: parse SA brief
        → PostgreSQL: INSERT INTO sa_briefs (create this table: id, epic_id, brief_json JSONB, created_at)
        → Slack: message to #solution-architecture "🏗️ New Epic ready for SA review: {{epicTitle}}"
```

---

### WORKFLOW 4: `04_human_approval_handler.json`

Generate the complete n8n JSON for this flow:

```
Webhook Trigger: POST /webhook/brd-decision
    Body: { brdId: string, decision: 'approve'|'reject', edits?: object, reason?: string }
    → Set Node: extract fields from body
    → IF: decision === 'approve'?
        → YES:
            → PostgreSQL: UPDATE brds SET status='approved', reviewed_at=NOW(), reviewer_email={{actor}} WHERE id={{brdId}}
            → IF: edits object is present and not empty?
                → YES: 
                    → PostgreSQL: UPDATE brds SET (apply edits fields) WHERE id={{brdId}}
                    → HTTP Request: POST http://backend:3001/api/blockchain/log
                        body: { recordId: brdId+'-edit', data: {brdId, edits, actor}, eventType: 'BRD_EDITED' }
                → NO:
                    → HTTP Request: POST http://backend:3001/api/blockchain/log
                        body: { recordId: brdId+'-approval', data: {brdId, actor, timestamp}, eventType: 'BRD_APPROVED' }
            → HTTP Request: POST http://backend:3001/api/pipeline/status/update
                body: { stage: 'prioritizing', brdApproved: brdId }
        → NO (reject path):
            → PostgreSQL: UPDATE brds SET status='rejected', rejection_reason={{reason}} WHERE id={{brdId}}
            → Slack: "#autoflow-ops BRD rejected: {{brdId}}. Reason: {{reason}}"
    → Respond to Webhook: { success: true, brdId: '{{brdId}}', decision: '{{decision}}' }
```

---

### WORKFLOW 5: `05_prioritization.json`

Generate the complete n8n JSON for this flow:

```
Webhook Trigger: POST /webhook/run-prioritization
    → PostgreSQL: SELECT * FROM brds WHERE status='approved' ORDER BY created_at DESC
    → Code Node: Calculate WSJF scores
        ```javascript
        // WSJF = (BV * sourceWeight + TC + RR) / Effort
        // Apply mention boost and sentiment boost
        const items = $input.all();
        return items.map(item => {
          const brd = item.json;
          const sourceWeight = brd.author_tier === 'enterprise' ? 3.0 : brd.author_tier === 'pro' ? 2.0 : 1.0;
          const costOfDelay = (brd.wsjf_bv * sourceWeight) + brd.wsjf_tc + brd.wsjf_rr;
          const base = costOfDelay / brd.wsjf_effort;
          const mentionBoost = Math.log10((brd.mention_count || 1) + 1) * 0.5;
          const sentimentBoost = (brd.avg_sentiment || 0) > 0.8 ? 1.5 : 1.0;
          const score = parseFloat((base * sentimentBoost + mentionBoost).toFixed(3));
          return { json: { ...brd, wsjf_final_score: score } };
        }).sort((a,b) => b.json.wsjf_final_score - a.json.wsjf_final_score);
        ```
    → PostgreSQL: UPDATE brds SET wsjf_final_score = {{score}} WHERE id = {{id}} (loop each item)
    → HTTP Request: POST http://backend:3001/api/blockchain/log
        body: { recordId: 'priority-'+Date.now(), data: { orderedBrdIds: scores }, eventType: 'PRIORITY_SET' }
    → Slack: "📊 Priority recalculated. Top BRD: '{{topBrdTitle}}' (WSJF: {{topScore}}). Review at dashboard."
    → Respond to Webhook: { success: true, count: {{total}}, topBrd: {{topTitle}} }
```

---

### WORKFLOW 6: `06_health_monitor.json`

Generate the complete n8n JSON for this flow:

```
Schedule Trigger: every 15 minutes
    → PostgreSQL: 
        SELECT stage, status, updated_at, 
               EXTRACT(EPOCH FROM (NOW() - updated_at))/3600 as hours_stuck
        FROM pipeline_status
        WHERE status NOT IN ('idle', 'completed')
        AND updated_at < NOW() - INTERVAL '2 hours'
    → IF: any rows returned?
        → YES: Slack "#autoflow-ops ⚠️ Pipeline STUCK at stage '{{stage}}' for {{hours_stuck}}h. Last update: {{updated_at}}"
        → NO: NoOp (all good)
    → PostgreSQL: Check count of BRDs in 'hitl_queue' status
    → IF: hitl_queue count > 5?
        → YES: Slack "#autoflow-ops 📋 {{count}} BRDs waiting in HITL queue. PM review needed."
        → NO: NoOp
```

---

## STEP 4 — GENERATE SUPPORTING FILES

### 4A. `docker-compose.yml`
Generate a complete working Docker Compose file:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: autoflow
      POSTGRES_USER: autoflow
      POSTGRES_PASSWORD: autoflow_dev_secret
    ports: ["5432:5432"]
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/src/db/schema.sql:/docker-entrypoint-initdb.d/01_schema.sql
      - ./backend/src/db/seed.sql:/docker-entrypoint-initdb.d/02_seed.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U autoflow"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  n8n:
    image: n8nio/n8n:latest
    ports: ["5678:5678"]
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n_db
      - DB_POSTGRESDB_USER=autoflow
      - DB_POSTGRESDB_PASSWORD=autoflow_dev_secret
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=autoflow2026
      - WEBHOOK_URL=http://localhost:5678/
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL}
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      postgres:
        condition: service_healthy

  backend:
    build: ./backend
    ports: ["3001:3001"]
    environment:
      - DATABASE_URL=postgresql://autoflow:autoflow_dev_secret@postgres:5432/autoflow
      - REDIS_URL=redis://redis:6379
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - POLYGON_RPC_URL=${POLYGON_RPC_URL}
      - AGENT_PRIVATE_KEY=${AGENT_PRIVATE_KEY}
      - CONTRACT_ADDRESS=${CONTRACT_ADDRESS}
      - N8N_BASE_URL=http://n8n:5678
      - SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL}
      - PINATA_JWT=${PINATA_JWT}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started

volumes:
  postgres_data:
  n8n_data:
```

### 4B. `.env.example`
Generate with ALL required environment variables and instructions:
```env
# Anthropic API
ANTHROPIC_API_KEY=sk-ant-...your-key-here

# Polygon Blockchain (Mumbai Testnet)
POLYGON_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
AGENT_PRIVATE_KEY=0x...your-wallet-private-key-NEVER-use-real-funds
CONTRACT_ADDRESS=0x...deployed-contract-address-after-running-deploy-script

# IPFS via Pinata
PINATA_JWT=eyJ...your-pinata-jwt-token

# Slack Notifications (optional for dev, required for demo)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Google Sheets (for demo data fallback)
GOOGLE_SHEETS_API_KEY=AIza...
SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms

# Reddit API (optional — Sheet is fallback)
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...
REDDIT_USERNAME=...
REDDIT_PASSWORD=...
```

### 4C. `n8n/README.md`
Generate import instructions:
```markdown
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

### HTTP Header Auth (for Anthropic)
- n8n uses environment variables injected at runtime
- ANTHROPIC_API_KEY is available as {{$env.ANTHROPIC_API_KEY}} in all HTTP nodes

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
```

### 4D. `SETUP.md`
Generate a complete beginner-friendly setup guide with these sections:
1. Prerequisites (Node 20, Docker, Git, Metamask for testnet)
2. Clone + setup (git clone, cp .env.example .env, fill in keys)
3. Start services (`docker compose up -d`)
4. Deploy smart contract (`cd blockchain && npm install && npx hardhat run scripts/deploy.ts --network mumbai`)
5. Import n8n workflows (link to n8n/README.md)
6. Verify everything works (health check URLs for each service)
7. Troubleshooting (common Docker issues, n8n import issues, Polygon testnet faucet links)

---

## STEP 5 — QUALITY REQUIREMENTS

Apply these rules to EVERY file you generate:

1. **No placeholders.** Every `// TODO`, `...`, or `[INSERT HERE]` must be replaced with real working code. If you don't know a value, use a sensible default or a clearly named environment variable.

2. **n8n JSON must be valid.** Every workflow JSON must be parseable by `JSON.parse()`. Test it mentally. Ensure every node has a unique UUID for its `id` field. Use the format `"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"`.

3. **Positions matter in n8n.** Set node positions so the workflow reads left-to-right or top-to-bottom. Start at [250, 300] and increment by [250, 0] per node for horizontal flows.

4. **Include the complete AI prompts inside the n8n workflow JSON.** The system prompts from the master prompt (Analyst Agent, Critic Agent, Story Writer, SA Brief) must be embedded as strings inside the HTTP Request node parameters in the workflow JSON — not referenced externally.

5. **All PostgreSQL nodes must specify the credential name** `"AutoFlow DB"` in their credential field.

6. **Error handling on every HTTP Request node:** Set `"onError": "continueErrorOutput"` so failures route to the error branch, not a crash.

7. **The Code Nodes must be real JavaScript**, not pseudocode. They will be executed by n8n's V8 engine.

---

## OUTPUT FORMAT

Produce files in this order:
1. `SETUP.md`
2. `.env.example`
3. `docker-compose.yml`
4. `backend/package.json`
5. `backend/tsconfig.json`
6. `backend/Dockerfile`
7. `backend/src/db/schema.sql`
8. `backend/src/db/seed.sql`
9. `backend/src/db/client.ts`
10. `backend/src/services/priority.service.ts`
11. `backend/src/services/blockchain.service.ts`
12. `backend/src/services/pipeline.service.ts`
13. `backend/src/services/notification.service.ts`
14. `backend/src/services/brd.service.ts`
15. `backend/src/routes/` (all route files)
16. `backend/src/middleware/` (validate.ts, errorHandler.ts)
17. `backend/src/app.ts`
18. `backend/src/server.ts`
19. `blockchain/contracts/AuditRegistry.sol`
20. `blockchain/hardhat.config.ts`
21. `blockchain/scripts/deploy.ts`
22. `blockchain/package.json`
23. `n8n/README.md`
24. `n8n/workflows/01_data_ingestion.json`
25. `n8n/workflows/02_brd_generation.json`
26. `n8n/workflows/03_epic_generation.json`
27. `n8n/workflows/04_human_approval_handler.json`
28. `n8n/workflows/05_prioritization.json`
29. `n8n/workflows/06_health_monitor.json`

Generate each file completely. Do not truncate. Do not summarize. Write the actual file content.

---

## REFERENCE: AI Agent Prompts to Embed in Workflow JSON

Embed these prompts as the `system` field in the HTTP Request body for each Claude API call:

### ANALYST AGENT (embed in Workflow 2, first Claude call):
```
You are a Senior Business Analyst at a SaaS company. You analyze aggregated customer feedback and write professional Business Requirement Documents (BRDs). You are precise, evidence-based, and always ground your output in the actual customer feedback provided. You never invent requirements not supported by the data.

You MUST output ONLY valid JSON matching exactly this schema:
{
  "title": "Short specific title max 10 words",
  "problem_statement": "2-3 sentences describing the problem citing evidence",
  "target_audience": "Specific user segment affected",
  "business_value": "Why solving this matters to the business",
  "proposed_solution_hint": "1-2 sentence directional suggestion not technical spec",
  "success_metrics": ["Metric 1", "Metric 2", "Metric 3"],
  "out_of_scope": ["What this BRD does NOT cover"],
  "source_evidence": ["Direct quote 1", "Direct quote 2", "Direct quote 3"],
  "wsjf_estimates": { "business_value": 7, "time_criticality": 6, "risk_reduction": 4, "effort": 5 },
  "confidence_score": 0.87,
  "confidence_reasoning": "Why you gave this score"
}
Confidence: 0.90+ = clear high-volume; 0.75-0.89 = clear with ambiguity; 0.50-0.74 = sparse/niche flag for human; below 0.50 = insufficient data.
NO markdown. NO explanation. ONLY the JSON object.
```

### CRITIC AGENT (embed in Workflow 2, second Claude call):
```
You are a Principal Product Manager conducting quality review of an AI-generated BRD. Be strict. Catch problems before a human wastes time.

Check: COMPLETENESS (all fields present), SPECIFICITY (not vague), EVIDENCE (cites real feedback), MEASURABILITY (metrics have numbers), SCOPE (bounded), AMBIGUITY (flag: fast/easy/better/improve/enhance), CONTRADICTIONS, SINGLE CONCERN (one need not many).

Output ONLY valid JSON:
{
  "critic_score": 0.85,
  "passed": true,
  "issues": [{ "criterion": "AMBIGUITY", "severity": "warning", "field": "proposed_solution_hint", "description": "phrase is unmeasurable" }],
  "suggested_fixes": {},
  "overall_comment": "One sentence summary"
}
passed=true only if critic_score >= 0.80 AND no blocker severity issues.
NO markdown. NO explanation. ONLY the JSON object.
```

### STORY WRITER AGENT (embed in Workflow 3):
```
You are a certified Scrum Product Owner. You write agile epics and user stories following INVEST principles. Developers must be able to implement your stories without clarifying questions.

Rules: 1-3 Epics per BRD. Each Epic has 2-5 User Stories. Every story MUST follow: "As a [specific user type], I want [specific action], so that [clear benefit]". Every story MUST have exactly 3 Gherkin acceptance criteria: "GIVEN [context], WHEN [action], THEN [outcome]". Story points: 1,2,3,5,8,13. No story > 8 points.

Output ONLY valid JSON:
{
  "brd_id": "{{brd_id}}",
  "epics": [{
    "epic_id": "E001",
    "title": "Epic title",
    "description": "1-2 sentences",
    "user_stories": [{
      "story_id": "US001",
      "title": "Short title",
      "story": "As a [user type], I want [action], so that [benefit]",
      "story_points": 5,
      "priority": "high",
      "needs_clarification": false,
      "acceptance_criteria": ["GIVEN..WHEN..THEN..", "GIVEN..WHEN..THEN..", "GIVEN..WHEN..THEN.."],
      "definition_of_done": ["Unit tests written", "Reviewed by QA", "Docs updated"]
    }]
  }],
  "architecture_hints": ["Hint 1", "Hint 2"],
  "dependencies": ["What must exist first"],
  "total_story_points": 18
}
NO markdown. NO explanation. ONLY the JSON object.
```

### SA BRIEF AGENT (embed in Workflow 3, second Claude call):
```
You are a Technical Lead bridging product requirements and engineering. Read finalized Epics and write a concise actionable technical brief for the Solution Architect. Suggest technologies based on patterns not preferences. Flag risks.

Output ONLY valid JSON:
{
  "brief_title": "SA Handoff: [title]",
  "summary": "2-3 sentences",
  "suggested_components": [{ "component": "name", "type": "service|database|queue|frontend|api", "rationale": "why needed", "tech_options": ["Option A", "Option B"] }],
  "data_model_hints": [{ "entity": "Name", "key_fields": ["f1","f2"], "relationships": "description" }],
  "api_surface_hints": ["POST /api/resource - Create thing"],
  "technical_risks": [{ "risk": "description", "severity": "high|medium|low", "mitigation": "approach" }],
  "questions_for_sa": ["Open question 1"],
  "estimated_complexity": "small|medium|large|very-large"
}
NO markdown. NO explanation. ONLY the JSON object.
```

---

*End of AutoFlow Intelligence — n8n Workflow Generation Prompt*
*Paste this entire document into Claude Opus 4.6 editor and ask it to generate all files.*
