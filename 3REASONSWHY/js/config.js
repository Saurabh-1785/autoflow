/* ═══════════════════════════════════════════════
   CONFIG & CONSTANTS (v3 — Structured BRD with WSJF)
   ═══════════════════════════════════════════════ */

const CONFIG = {
  runId: 'AF-2026-03-13-001',
  product: 'AutoFlow Intelligence SaaS Platform',
  pmRecipient: 'Sarah Chen — sarah.chen@autoflow.io',
  jiraTicket: 'AF-2847',
  confidence: 0.89,
  rawRecords: 2847,
  cleanRecords: 1203,
  featuresGenerated: 6,
  userStories: 18,
  totalThemes: 8,
  duplicatesRemoved: 891,
  translated: 47,
  noiseRemoved: 523,
  piiScrubbed: 23,
  analysisDate: 'March 13, 2026 at 10:43 AM',
};

const THEMES = [
  { name: 'Performance', sentiment: -0.72, reviews: 312, color: '#DE350B', bg: '#FFEBE6', severity: 'critical' },
  { name: 'Support', sentiment: -0.79, reviews: 98, color: '#DE350B', bg: '#FFEBE6', severity: 'critical' },
  { name: 'Onboarding', sentiment: -0.61, reviews: 198, color: '#FF8B00', bg: '#FFF4E5', severity: 'high' },
  { name: 'Mobile', sentiment: -0.68, reviews: 167, color: '#FF8B00', bg: '#FFF4E5', severity: 'high' },
  { name: 'Billing', sentiment: -0.54, reviews: 134, color: '#FF8B00', bg: '#FFF4E5', severity: 'medium' },
  { name: 'Integrations', sentiment: -0.43, reviews: 121, color: '#FF8B00', bg: '#FFF4E5', severity: 'medium' },
  { name: 'Reporting', sentiment: -0.38, reviews: 109, color: '#00875A', bg: '#E3FCEF', severity: 'low' },
  { name: 'Data Export', sentiment: -0.31, reviews: 64, color: '#00875A', bg: '#E3FCEF', severity: 'low' },
];

const SOURCE_BREAKDOWN = [
  { source: 'Reddit', collected: 342, clean: 201, pct: '16.7%' },
  { source: 'Twitter / X', collected: 891, clean: 389, pct: '32.3%' },
  { source: 'App Store (iOS)', collected: 156, clean: 121, pct: '10.1%' },
  { source: 'Google Play', collected: 203, clean: 158, pct: '13.1%' },
  { source: 'G2 Reviews', collected: 88, clean: 82, pct: '6.8%' },
  { source: 'Trustpilot', collected: 114, clean: 97, pct: '8.1%' },
  { source: 'Support Tickets', collected: 1053, clean: 155, pct: '12.9%' },
];

const THEME_ANALYSIS = [
  { num: 1, theme: 'Performance & Speed Issues', volume: 312, sentiment: -0.72, severity: 'critical', sentPct: 72, included: true },
  { num: 2, theme: 'Onboarding & Setup Friction', volume: 198, sentiment: -0.61, severity: 'high', sentPct: 61, included: true },
  { num: 3, theme: 'Mobile App Instability', volume: 167, sentiment: -0.68, severity: 'high', sentPct: 68, included: true },
  { num: 4, theme: 'Billing & Pricing Concerns', volume: 134, sentiment: -0.54, severity: 'medium', sentPct: 54, included: true },
  { num: 5, theme: 'Third-Party Integrations', volume: 121, sentiment: -0.43, severity: 'medium', sentPct: 43, included: true },
  { num: 6, theme: 'Reporting & Dashboard UX', volume: 109, sentiment: -0.38, severity: 'low', sentPct: 38, included: true },
  { num: 7, theme: 'Customer Support Response', volume: 98, sentiment: -0.79, severity: 'critical', sentPct: 79, included: false },
  { num: 8, theme: 'Data Export Functionality', volume: 64, sentiment: -0.31, severity: 'low', sentPct: 31, included: false },
];

/* ═══════════════════════════════════════════════
   STRUCTURED BRD JSON — AI BA Agent Output
   Follows: INVEST + Gherkin + WSJF (Fibonacci 1-13)
   ═══════════════════════════════════════════════ */

const BRD_JSON = {
  "brd_id": "BRD-AF-2026-03-13-001",
  "generated_at": "2026-03-13T10:43:19Z",
  "agent": "AI Business Analyst Agent v3.1",
  "model": "claude-opus-4",
  "clustering_method": "BERTopic",
  "input_records": 1203,
  "confidence_score": 0.89,
  "hitl_required": false,
  "hitl_threshold": 0.75,

  "context": {
    "product": "AutoFlow Intelligence SaaS Platform",
    "analysis_window": "2026-02-12 to 2026-03-13",
    "data_sources": 7,
    "raw_records": 2847,
    "clean_records": 1203,
    "reduction_rate": "57.7%",
    "themes_identified": 8,
    "themes_included": 6
  },

  "theme_clusters": [
    {
      "cluster_id": "TC-001",
      "theme_name": "PERF_DASHBOARD_LATENCY",
      "display_name": "Performance & Speed Issues",
      "feedback_volume": 312,
      "sentiment_intensity": 0.72,
      "sentiment_direction": "negative",
      "rage_churn_signal": true,
      "auto_elevated": true,
      "top_source": "Twitter/X (38%)",
      "sample_verbatim": [
        "Dashboard takes forever to load, I'm about to cancel my subscription",
        "4+ seconds to see my analytics? This is 2026, not 2010",
        "The lag on data-heavy pages makes this tool unusable for enterprise reporting"
      ]
    },
    {
      "cluster_id": "TC-002",
      "theme_name": "ONBOARD_SETUP_FRICTION",
      "display_name": "Onboarding & Setup Friction",
      "feedback_volume": 198,
      "sentiment_intensity": 0.61,
      "sentiment_direction": "negative",
      "rage_churn_signal": false,
      "auto_elevated": false,
      "top_source": "Support Tickets (51%)",
      "sample_verbatim": [
        "Setup process too confusing for new users, had to contact support twice",
        "Why does onboarding have 12 steps? Most competitors do it in 3",
        "I abandoned setup at the integration page and never came back"
      ]
    },
    {
      "cluster_id": "TC-003",
      "theme_name": "MOBILE_APP_CRASH_RATE",
      "display_name": "Mobile App Instability",
      "feedback_volume": 167,
      "sentiment_intensity": 0.68,
      "sentiment_direction": "negative",
      "rage_churn_signal": true,
      "auto_elevated": true,
      "top_source": "App Store + Google Play (89%)",
      "sample_verbatim": [
        "App crashes every time I try to generate a report on my phone",
        "3 crashes in 10 minutes, uninstalling this garbage",
        "Works fine on desktop but mobile is completely broken"
      ]
    },
    {
      "cluster_id": "TC-004",
      "theme_name": "BILLING_PRICING_OPACITY",
      "display_name": "Billing & Pricing Concerns",
      "feedback_volume": 134,
      "sentiment_intensity": 0.54,
      "sentiment_direction": "negative",
      "rage_churn_signal": false,
      "auto_elevated": false,
      "top_source": "G2 + Trustpilot (62%)",
      "sample_verbatim": [
        "Pricing changes without any notice, got hit with a surprise $200 charge",
        "I can't understand which tier I'm on or what I'm paying for",
        "Usage-based pricing is fine but only if the breakdown is transparent"
      ]
    },
    {
      "cluster_id": "TC-005",
      "theme_name": "INTEGRATION_ECOSYSTEM_GAP",
      "display_name": "Third-Party Integrations",
      "feedback_volume": 121,
      "sentiment_intensity": 0.43,
      "sentiment_direction": "negative",
      "rage_churn_signal": false,
      "auto_elevated": false,
      "top_source": "Reddit (44%)",
      "sample_verbatim": [
        "No native Slack integration in 2026 is a dealbreaker",
        "We need Salesforce sync or this tool is useless for our sales team",
        "Competitors have 12+ integrations, you have 3"
      ]
    },
    {
      "cluster_id": "TC-006",
      "theme_name": "DATA_EXPORT_LIMITATION",
      "display_name": "Reporting & Dashboard UX",
      "feedback_volume": 109,
      "sentiment_intensity": 0.38,
      "sentiment_direction": "negative",
      "rage_churn_signal": false,
      "auto_elevated": false,
      "top_source": "Support Tickets (71%)",
      "sample_verbatim": [
        "Need bulk CSV export, PDF-only is not acceptable for data teams",
        "Where is the API? We need programmatic access to report data",
        "Export functionality is severely lacking compared to alternatives"
      ]
    }
  ],

  "requirements": [
    {
      "requirement_id": "REQ-001",
      "theme_cluster": "TC-001",
      "title": "Dashboard Response Time SLA Enforcement",
      "description": "Reduce analytics dashboard server-side response time from current 4.2s average to under 2.0s (P95) through query optimization, caching layer implementation, and CDN-based asset delivery. Progressive rendering must ensure above-the-fold content appears within 800ms.",
      "priority": "Critical",
      "priority_auto_elevated": true,
      "elevation_reason": "Sentiment intensity 0.72 with rage/churn signals detected in 38% of cluster feedback",
      "wsjf": {
        "business_value": 13,
        "time_criticality": 8,
        "risk_reduction": 8,
        "estimated_effort": 5,
        "wsjf_score": 5.8,
        "formula": "(BV + TC + RR) / Effort = (13 + 8 + 8) / 5 = 5.8"
      },
      "user_stories": [
        {
          "story_id": "US-001",
          "story": "As an authenticated user, I want the analytics dashboard to fully render within 2000ms (P95) so that my workflow is not interrupted by loading delays.",
          "invest": {
            "independent": true,
            "negotiable": true,
            "valuable": true,
            "estimable": true,
            "small": true,
            "testable": true
          },
          "acceptance_criteria": [
            {
              "scenario": "Dashboard loads within SLA",
              "given": "An authenticated user is on the homepage",
              "when": "They navigate to the analytics dashboard",
              "then": "The page fully renders within 2000ms (P95) as measured by server-side response time + client-side paint metrics"
            },
            {
              "scenario": "No timeout errors under standard load",
              "given": "The system is operating under normal traffic (up to 500 concurrent users)",
              "when": "A user requests the analytics dashboard",
              "then": "The request completes without HTTP 504/408 timeout errors and all data widgets display correctly"
            }
          ]
        },
        {
          "story_id": "US-002",
          "story": "As a power user, I want above-the-fold dashboard content to appear within 800ms so that I can begin reading results before all widgets finish loading.",
          "invest": {
            "independent": true,
            "negotiable": true,
            "valuable": true,
            "estimable": true,
            "small": true,
            "testable": true
          },
          "acceptance_criteria": [
            {
              "scenario": "Progressive rendering of dashboard widgets",
              "given": "A user opens the analytics dashboard",
              "when": "The page begins loading",
              "then": "Above-the-fold content (header, KPI cards, primary chart) appears within 800ms"
            },
            {
              "scenario": "Below-fold widgets load without UI blocking",
              "given": "Above-the-fold content has rendered",
              "when": "Below-fold widgets are still loading",
              "then": "The rendered UI remains interactive and scroll events are not blocked"
            }
          ]
        },
        {
          "story_id": "US-003",
          "story": "As an SRE, I want automated PagerDuty alerts triggered when dashboard P95 response time exceeds 2000ms for 5 consecutive minutes so that SLA breaches are detected proactively.",
          "invest": {
            "independent": true,
            "negotiable": true,
            "valuable": true,
            "estimable": true,
            "small": true,
            "testable": true
          },
          "acceptance_criteria": [
            {
              "scenario": "SLA breach alert triggers",
              "given": "Dashboard P95 response time exceeds 2000ms",
              "when": "This condition persists for 5 consecutive minutes",
              "then": "A PagerDuty alert fires with metric values, affected endpoint, and suggested runbook link"
            },
            {
              "scenario": "Alert auto-resolves on recovery",
              "given": "An active SLA breach alert exists",
              "when": "Dashboard P95 drops below 2000ms for 3 consecutive minutes",
              "then": "The alert auto-resolves and a recovery notification is sent"
            }
          ]
        }
      ]
    },
    {
      "requirement_id": "REQ-002",
      "theme_cluster": "TC-002",
      "title": "Onboarding Wizard Streamlining",
      "description": "Reduce onboarding wizard from 12 steps to a maximum of 5 required steps, achieving sub-8-minute completion time. Optional integration setup must be deferrable. Contextual tooltips and progress indicators must replace the current static documentation links.",
      "priority": "High",
      "priority_auto_elevated": false,
      "elevation_reason": null,
      "wsjf": {
        "business_value": 8,
        "time_criticality": 8,
        "risk_reduction": 5,
        "estimated_effort": 3,
        "wsjf_score": 7.0,
        "formula": "(BV + TC + RR) / Effort = (8 + 8 + 5) / 3 = 7.0"
      },
      "user_stories": [
        {
          "story_id": "US-004",
          "story": "As a newly registered user, I want to complete onboarding in 5 or fewer required steps within 8 minutes so that I can activate core features without contacting support.",
          "invest": {
            "independent": true,
            "negotiable": true,
            "valuable": true,
            "estimable": true,
            "small": true,
            "testable": true
          },
          "acceptance_criteria": [
            {
              "scenario": "Onboarding completes within time budget",
              "given": "A newly registered user begins the onboarding wizard",
              "when": "They complete all required steps",
              "then": "Total elapsed time is under 8 minutes and no more than 5 required steps were presented"
            },
            {
              "scenario": "No support contact needed for activation",
              "given": "A user completes onboarding without external help",
              "when": "They reach the main dashboard",
              "then": "All core features (dashboard, reports, settings) are accessible without support escalation"
            }
          ]
        },
        {
          "story_id": "US-005",
          "story": "As a new user, I want contextual tooltips on each onboarding step showing exactly what to do so that I do not need to open external documentation.",
          "invest": {
            "independent": true,
            "negotiable": true,
            "valuable": true,
            "estimable": true,
            "small": true,
            "testable": true
          },
          "acceptance_criteria": [
            {
              "scenario": "Tooltip visibility on form fields",
              "given": "A user is on any onboarding step with input fields",
              "when": "They focus on an input field",
              "then": "A contextual tooltip appears within 200ms explaining the expected input format and purpose"
            },
            {
              "scenario": "Progress indicator accuracy",
              "given": "A user is on step N of the onboarding wizard",
              "when": "They view the progress bar",
              "then": "The bar shows N/total_steps completed and estimated remaining time in minutes"
            }
          ]
        },
        {
          "story_id": "US-006",
          "story": "As an account admin, I want to defer optional integration setup to post-activation so that I can start using core features immediately and configure integrations from Settings later.",
          "invest": {
            "independent": true,
            "negotiable": true,
            "valuable": true,
            "estimable": true,
            "small": true,
            "testable": true
          },
          "acceptance_criteria": [
            {
              "scenario": "Skip optional integration step",
              "given": "A new user reaches the integration configuration step",
              "when": "They click 'Skip for now'",
              "then": "The wizard advances to the next required step and integration setup appears under Settings > Integrations"
            },
            {
              "scenario": "Deferred integration reminder",
              "given": "A user skipped integration setup during onboarding",
              "when": "They log in for the 3rd time without configuring integrations",
              "then": "A non-blocking banner appears suggesting they complete integration setup with a direct link"
            }
          ]
        }
      ]
    },
    {
      "requirement_id": "REQ-003",
      "theme_cluster": "TC-003",
      "title": "Mobile Application Crash Rate Reduction",
      "description": "Reduce mobile crash rate from 3.2% (iOS) and 5.1% (Android) to under 0.5% on both platforms. Primary crash vector is the report generation page consuming >150MB memory. Graceful degradation must handle network timeouts without force-closing the app.",
      "priority": "Critical",
      "priority_auto_elevated": true,
      "elevation_reason": "Sentiment intensity 0.68 with rage/churn signals. App store reviews directly impact acquisition funnel.",
      "wsjf": {
        "business_value": 8,
        "time_criticality": 13,
        "risk_reduction": 8,
        "estimated_effort": 5,
        "wsjf_score": 5.8,
        "formula": "(BV + TC + RR) / Effort = (8 + 13 + 8) / 5 = 5.8"
      },
      "user_stories": [
        {
          "story_id": "US-007",
          "story": "As a mobile user, I want to generate analytics reports on iOS and Android without the app crashing so that I can access insights on the go.",
          "invest": {
            "independent": true,
            "negotiable": true,
            "valuable": true,
            "estimable": true,
            "small": true,
            "testable": true
          },
          "acceptance_criteria": [
            {
              "scenario": "Report generation without crash",
              "given": "A mobile user is on the reports section",
              "when": "They generate a new analytics report with up to 1000 data points",
              "then": "The report renders completely without app crash and memory usage stays below 150MB"
            },
            {
              "scenario": "Crash rate below threshold",
              "given": "The app is deployed to production",
              "when": "Crash rate is measured over a 7-day rolling window",
              "then": "The crash rate is below 0.5% on both iOS and Android platforms"
            }
          ]
        },
        {
          "story_id": "US-008",
          "story": "As a user on an unreliable network, I want the app to show a retry prompt instead of crashing when API requests time out so that I do not lose my session state.",
          "invest": {
            "independent": true,
            "negotiable": true,
            "valuable": true,
            "estimable": true,
            "small": true,
            "testable": true
          },
          "acceptance_criteria": [
            {
              "scenario": "Network timeout graceful handling",
              "given": "A mobile user is performing a network-dependent action",
              "when": "The API request times out after 15 seconds",
              "then": "The app displays a 'Connection lost - Retry?' prompt without crashing or losing screen state"
            },
            {
              "scenario": "Cached data remains accessible offline",
              "given": "A user has previously loaded dashboard data",
              "when": "They lose network connectivity",
              "then": "Previously loaded data remains visible with a 'Data as of [timestamp]' indicator"
            }
          ]
        },
        {
          "story_id": "US-009",
          "story": "As a QA engineer, I want automated crash reporting with symbolicated stack traces uploaded to Sentry within 30 seconds of occurrence so that mobile bugs are triaged within 24 hours.",
          "invest": {
            "independent": true,
            "negotiable": true,
            "valuable": true,
            "estimable": true,
            "small": true,
            "testable": true
          },
          "acceptance_criteria": [
            {
              "scenario": "Crash report auto-upload",
              "given": "The mobile app encounters a crash",
              "when": "The app restarts",
              "then": "A symbolicated crash report is uploaded to Sentry within 30 seconds including device model, OS version, and memory state"
            },
            {
              "scenario": "Crash triage SLA",
              "given": "A new crash type appears in Sentry with >10 occurrences",
              "when": "The engineering team is notified via Slack",
              "then": "The crash is triaged and assigned a severity label within 24 hours"
            }
          ]
        }
      ]
    },
    {
      "requirement_id": "REQ-004",
      "theme_cluster": "TC-004",
      "title": "Billing Transparency & Predictability Module",
      "description": "Implement a billing dashboard with line-item charge breakdowns by feature and usage tier. Proactive notifications must alert users 7 days before pricing tier changes. Custom spend threshold alerts must be configurable by the account owner.",
      "priority": "Medium",
      "priority_auto_elevated": false,
      "elevation_reason": null,
      "wsjf": {
        "business_value": 5,
        "time_criticality": 5,
        "risk_reduction": 8,
        "estimated_effort": 3,
        "wsjf_score": 6.0,
        "formula": "(BV + TC + RR) / Effort = (5 + 5 + 8) / 3 = 6.0"
      },
      "user_stories": [
        {
          "story_id": "US-010",
          "story": "As a billing admin, I want a line-item breakdown of current charges grouped by feature and usage tier so that I can identify cost drivers and forecast monthly spend within 10% accuracy.",
          "invest": {
            "independent": true,
            "negotiable": true,
            "valuable": true,
            "estimable": true,
            "small": true,
            "testable": true
          },
          "acceptance_criteria": [
            {
              "scenario": "Billing breakdown displays all charges",
              "given": "A billing admin navigates to the Billing page",
              "when": "The page loads",
              "then": "A table displays each charge line with feature name, usage quantity, unit cost, and subtotal"
            },
            {
              "scenario": "Billing page loads within 3 seconds",
              "given": "A billing admin clicks on the Billing nav item",
              "when": "The billing data is requested from the API",
              "then": "The billing breakdown renders within 3 seconds with all line items visible"
            }
          ]
        },
        {
          "story_id": "US-011",
          "story": "As a customer, I want to receive an email notification exactly 7 calendar days before any pricing tier change takes effect so that I can adjust usage or update my budget.",
          "invest": {
            "independent": true,
            "negotiable": true,
            "valuable": true,
            "estimable": true,
            "small": true,
            "testable": true
          },
          "acceptance_criteria": [
            {
              "scenario": "Pricing change email sent 7 days in advance",
              "given": "A pricing tier change is scheduled for a customer",
              "when": "The change effective date is 7 calendar days away",
              "then": "An email is sent to the billing contact containing old price, new price, effective date, and a link to manage the subscription"
            },
            {
              "scenario": "Email delivery confirmation logged",
              "given": "A pricing change notification email is sent",
              "when": "The email delivery status is received from the ESP",
              "then": "The delivery status (sent/delivered/bounced) is logged in the audit trail"
            }
          ]
        },
        {
          "story_id": "US-012",
          "story": "As an account owner, I want to configure custom billing alert thresholds (e.g., 80% of budget) so that I receive a notification when projected spend approaches my defined limit.",
          "invest": {
            "independent": true,
            "negotiable": true,
            "valuable": true,
            "estimable": true,
            "small": true,
            "testable": true
          },
          "acceptance_criteria": [
            {
              "scenario": "Custom threshold alert triggers",
              "given": "An account owner has set a billing alert at $500/month",
              "when": "Projected monthly spend reaches $500 based on current usage rate",
              "then": "An email and in-app notification are sent containing current spend, projected total, and days remaining in the billing cycle"
            },
            {
              "scenario": "Multiple thresholds configurable",
              "given": "An account owner is on the Billing Alerts settings page",
              "when": "They add a new threshold",
              "then": "The system accepts thresholds in dollar amounts and/or percentage of plan limit, up to 5 active alerts"
            }
          ]
        }
      ]
    },
    {
      "requirement_id": "REQ-005",
      "theme_cluster": "TC-005",
      "title": "Native Integration Ecosystem Expansion",
      "description": "Expand the integration ecosystem from 3 to a minimum of 8 native connectors, prioritizing Slack, Microsoft Teams, Salesforce, Jira, and HubSpot. An integration marketplace with one-click OAuth setup must eliminate the need for engineering support during configuration.",
      "priority": "Medium",
      "priority_auto_elevated": false,
      "elevation_reason": null,
      "wsjf": {
        "business_value": 5,
        "time_criticality": 3,
        "risk_reduction": 5,
        "estimated_effort": 8,
        "wsjf_score": 1.63,
        "formula": "(BV + TC + RR) / Effort = (5 + 3 + 5) / 8 = 1.63"
      },
      "user_stories": [
        {
          "story_id": "US-013",
          "story": "As a team lead, I want native Slack notifications for pipeline events so that my team receives real-time updates in their existing communication channel without switching tools.",
          "invest": {
            "independent": true,
            "negotiable": true,
            "valuable": true,
            "estimable": true,
            "small": true,
            "testable": true
          },
          "acceptance_criteria": [
            {
              "scenario": "Slack notification on pipeline completion",
              "given": "A user has connected their Slack workspace and selected a notification channel",
              "when": "A pipeline stage completes (success or failure)",
              "then": "A structured Slack message is posted to the configured channel within 10 seconds containing stage name, status, run ID, and duration"
            },
            {
              "scenario": "Slack integration OAuth flow",
              "given": "A user clicks 'Connect Slack' in the integration marketplace",
              "when": "They complete the OAuth consent flow",
              "then": "The integration status shows 'Connected' within 30 seconds and a test notification is sent to the selected channel"
            }
          ]
        },
        {
          "story_id": "US-014",
          "story": "As a sales manager, I want bidirectional Salesforce CRM sync so that customer feedback records are automatically linked to the corresponding Salesforce Account and Opportunity objects.",
          "invest": {
            "independent": true,
            "negotiable": true,
            "valuable": true,
            "estimable": true,
            "small": true,
            "testable": true
          },
          "acceptance_criteria": [
            {
              "scenario": "Feedback linked to Salesforce Account",
              "given": "A feedback record contains an email matching a Salesforce Contact",
              "when": "The Cleaner Agent processes the record",
              "then": "The record is tagged with the corresponding Salesforce Account ID and synced to a custom Salesforce object within 60 seconds"
            },
            {
              "scenario": "Sync failure handling",
              "given": "A Salesforce sync attempt fails due to API rate limit",
              "when": "The retry mechanism activates",
              "then": "The system retries with exponential backoff (max 3 retries) and logs the failure with Salesforce error code in the audit trail"
            }
          ]
        },
        {
          "story_id": "US-015",
          "story": "As an admin, I want a self-service integration marketplace with one-click setup so that connecting new tools requires zero engineering support and completes in under 2 minutes.",
          "invest": {
            "independent": true,
            "negotiable": true,
            "valuable": true,
            "estimable": true,
            "small": true,
            "testable": true
          },
          "acceptance_criteria": [
            {
              "scenario": "Marketplace lists all available integrations",
              "given": "An admin opens the integration marketplace page",
              "when": "The page loads",
              "then": "All available integrations are displayed with name, icon, description, and 'Connect' button; already-connected integrations show 'Connected' status"
            },
            {
              "scenario": "One-click setup completes in under 2 minutes",
              "given": "An admin clicks 'Connect' on a supported integration",
              "when": "They complete the OAuth flow and return to the app",
              "then": "The integration is active with default settings within 2 minutes total elapsed time"
            }
          ]
        }
      ]
    },
    {
      "requirement_id": "REQ-006",
      "theme_cluster": "TC-006",
      "title": "Multi-Format Data Export & API Access",
      "description": "Extend export capabilities from PDF-only to include CSV, Excel (XLSX), and JSON formats. A REST API with paginated endpoints must provide programmatic access to all report data. Scheduled bulk exports with audit trail must support regulatory compliance workflows.",
      "priority": "Low",
      "priority_auto_elevated": false,
      "elevation_reason": null,
      "wsjf": {
        "business_value": 3,
        "time_criticality": 2,
        "risk_reduction": 5,
        "estimated_effort": 5,
        "wsjf_score": 2.0,
        "formula": "(BV + TC + RR) / Effort = (3 + 2 + 5) / 5 = 2.0"
      },
      "user_stories": [
        {
          "story_id": "US-016",
          "story": "As an analyst, I want to export any report as CSV with column headers matching the on-screen table so that I can perform additional analysis in Excel or Google Sheets without manual reformatting.",
          "invest": {
            "independent": true,
            "negotiable": true,
            "valuable": true,
            "estimable": true,
            "small": true,
            "testable": true
          },
          "acceptance_criteria": [
            {
              "scenario": "CSV export downloads correctly",
              "given": "An analyst is viewing any report page",
              "when": "They click 'Export as CSV'",
              "then": "A CSV file downloads within 5 seconds containing all visible report data with column headers matching the on-screen table headers exactly"
            },
            {
              "scenario": "Large dataset export handles pagination",
              "given": "A report contains more than 10,000 rows",
              "when": "The user requests a CSV export",
              "then": "The system generates the CSV in the background, sends an email with a download link when ready, and the download link expires after 24 hours"
            }
          ]
        },
        {
          "story_id": "US-017",
          "story": "As a developer, I want authenticated REST API endpoints for all report data with pagination metadata so that I can build custom integrations and dashboards programmatically.",
          "invest": {
            "independent": true,
            "negotiable": true,
            "valuable": true,
            "estimable": true,
            "small": true,
            "testable": true
          },
          "acceptance_criteria": [
            {
              "scenario": "API returns paginated report data",
              "given": "A developer sends a GET request to /api/v1/reports/{id} with a valid API key",
              "when": "The request is processed",
              "then": "The response returns JSON containing report data, total_count, page, per_page, and next_page_url metadata"
            },
            {
              "scenario": "Unauthorized access rejected",
              "given": "A request is sent to /api/v1/reports/{id} without a valid API key",
              "when": "The server processes the request",
              "then": "The server returns HTTP 401 with error message 'Invalid or missing API key' and no report data is leaked"
            }
          ]
        },
        {
          "story_id": "US-018",
          "story": "As a compliance officer, I want scheduled weekly bulk exports with immutable audit trail entries so that regulatory reporting deadlines are met automatically without manual intervention.",
          "invest": {
            "independent": true,
            "negotiable": true,
            "valuable": true,
            "estimable": true,
            "small": true,
            "testable": true
          },
          "acceptance_criteria": [
            {
              "scenario": "Scheduled export runs on time",
              "given": "A compliance officer has configured a weekly export schedule for every Monday at 06:00 UTC",
              "when": "The scheduled time arrives",
              "then": "The export job runs automatically, generates the file within 15 minutes, and stores it in the configured S3 bucket with a timestamped filename"
            },
            {
              "scenario": "Audit trail entry created",
              "given": "A scheduled export job completes",
              "when": "The audit system processes the event",
              "then": "An immutable audit trail entry is created containing job ID, timestamp, record count, file hash (SHA-256), and the identity of the configuring user"
            }
          ]
        }
      ]
    }
  ],

  "quality_control": {
    "confidence_score": 0.89,
    "threshold": 0.75,
    "hitl_required": false,
    "invest_compliance": "18/18 user stories pass all 6 INVEST criteria",
    "gherkin_coverage": "36 acceptance criteria across 18 user stories (2 per story minimum met)",
    "schema_validation": "PASS",
    "wsjf_scoring": "6/6 requirements scored on Fibonacci scale (1-13)"
  }
};

const FEATURES = BRD_JSON.requirements;
const FEATURE_SUMMARY = BRD_JSON.requirements.map((r, i) => ({
  num: i + 1,
  name: r.title,
  wsjf: r.wsjf.wsjf_score,
  reviews: BRD_JSON.theme_clusters.find(t => t.cluster_id === r.theme_cluster)?.feedback_volume || 0,
  sentiment: BRD_JSON.theme_clusters.find(t => t.cluster_id === r.theme_cluster)?.sentiment_intensity || 0,
  stories: r.user_stories.length,
  priority: r.priority,
  priorityClass: r.priority.toLowerCase(),
  action: r.priority === 'Critical' ? 'Prioritize Q1' : r.priority === 'High' ? 'Prioritize Q1' : r.priority === 'Medium' ? 'Schedule Q2' : 'Backlog',
}));

const TRACEABILITY = BRD_JSON.requirements.map(r => {
  const cluster = BRD_JSON.theme_clusters.find(t => t.cluster_id === r.theme_cluster);
  return {
    feature: r.requirement_id + ' ' + r.title.split(' ').slice(0, 2).join(' '),
    themes: r.theme_cluster,
    topSource: cluster?.top_source || 'N/A',
    verbatim: cluster?.sample_verbatim?.[0] || 'N/A',
  };
});
