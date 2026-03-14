# AutoFlow Intelligence — Business Analyst Workspace

Automated feedback ingestion, cleaning, and BRD generation pipeline for enterprise product development.

## Quick Start

```bash
# Serve locally
python3 -m http.server 8080

# Open in browser
open http://localhost:8080
```

## Project Structure

```
3REASONSWHY/
├── index.html                  # Main HTML — layout, markup, modal, no inline JS/CSS
├── css/
│   └── styles.css              # Full design system (variables, layout, components)
├── js/
│   ├── config.js               # Global config constants & demo data
│   ├── pipeline-state.js       # Central pipeline state machine (7 stages)
│   ├── event-bus.js            # Pub/sub event bus for inter-agent communication
│   ├── agents/
│   │   ├── scraper-agent.js    # Stage 1 — Data ingestion from 7 sources
│   │   ├── cleaner-agent.js    # Stage 2 — Dedup, translation, PII scrubbing
│   │   └── analyst-agent.js    # Stage 3 — BERTopic clustering & BRD generation
│   ├── forward-pm.js           # Forward to PM handler (Jira ticket simulation)
│   ├── ui.js                   # DOM helpers (terminal, badges, counters, toasts)
│   └── app.js                  # Run orchestrators & initialization
└── README.md
```

## Architecture

Each agent module follows a consistent pattern:

1. **Production Integration Comment Block** — exact `fetch` call for n8n webhook
2. **`config`** — webhook URL, API key, thresholds
3. **`simulateRun()`** — demo simulation (swap for real API call)
4. **`run()`** — orchestrates status, logging, and event emission

### Key Modules

| Module | Responsibility |
|--------|---------------|
| `pipeline-state.js` | State machine managing stage lifecycle (`idle` → `running` → `complete`) |
| `event-bus.js` | Pub/sub for `scraper:complete`, `cleaner:complete`, `analyst:complete`, `brd:forwarded` |
| `ui.js` | Terminal streaming, badge updates, counter animations, toast notifications |
| `app.js` | Button handlers, stage unlocking, stepper progression, initialization |

## Production Integration

Each agent has a `PRODUCTION INTEGRATION POINT` comment. To connect to n8n:

1. Deploy the n8n Sub-Workflow for the agent
2. Replace `simulateRun()` body with the documented `fetch` call
3. Parse the response and return it — the rest of the pipeline continues unchanged

## Dependencies

- **Google Fonts**: IBM Plex Sans (300/400/500/600), IBM Plex Mono (400) — CDN
- **Lucide Icons** — CDN (`unpkg.com/lucide@latest`)
- No npm packages, no build step, no frameworks
