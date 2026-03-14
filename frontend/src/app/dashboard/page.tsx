"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Play,
  RotateCcw,
  Settings,
  Terminal,
} from "lucide-react";

type AgentKey = "scraper" | "cleaner" | "analyst" | "critic" | "prioritizer";
type StageKey = "config" | AgentKey;
type StageState = "idle" | "running" | "done";
type FlagState = "open" | "resolved" | "overridden";

type HitlFlag = {
  id: string;
  feature: string;
  story: string;
  type: string;
  issue: string;
  current: string;
  suggested: string;
  state: FlagState;
};

type RankedFeature = {
  id: string;
  requirementId: string;
  name: string;
  bv: number;
  tc: number;
  rr: number;
  effort: number;
  wsjf: number;
  alignment: number;
  priority: "Critical" | "High" | "Medium" | "Low";
  originalRank: number;
};

type Requirement = {
  id: string;
  title: string;
  description: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  wsjf: { bv: number; tc: number; rr: number; effort: number; score: number };
  userStories: {
    id: string;
    story: string;
    criteria: string[];
  }[];
};

const SOURCE_OPTIONS = [
  { id: "reddit", name: "Reddit", desc: "Community discussions" },
  { id: "twitter", name: "Twitter / X", desc: "Real-time mentions" },
  { id: "appstore", name: "App Store", desc: "iOS reviews" },
  { id: "googleplay", name: "Google Play", desc: "Android reviews" },
  { id: "g2", name: "G2 Reviews", desc: "Enterprise reviews" },
  { id: "trustpilot", name: "Trustpilot", desc: "Consumer reviews" },
  { id: "zendesk", name: "Zendesk", desc: "Support tickets" },
];

const SOURCE_BREAKDOWN = [
  { source: "Reddit", collected: 342, clean: 201, pct: "16.7%" },
  { source: "Twitter / X", collected: 891, clean: 389, pct: "32.3%" },
  { source: "App Store (iOS)", collected: 156, clean: 121, pct: "10.1%" },
  { source: "Google Play", collected: 203, clean: 158, pct: "13.1%" },
  { source: "G2 Reviews", collected: 88, clean: 82, pct: "6.8%" },
  { source: "Trustpilot", collected: 114, clean: 97, pct: "8.1%" },
  { source: "Support Tickets", collected: 1053, clean: 155, pct: "12.9%" },
];

const THEME_CLUSTERS = [
  { id: "TC-001", name: "Performance & Speed Issues", volume: 312, sentiment: -0.72, rage: true, elevated: true },
  { id: "TC-002", name: "Onboarding & Setup Friction", volume: 198, sentiment: -0.61, rage: false, elevated: false },
  { id: "TC-003", name: "Mobile App Instability", volume: 167, sentiment: -0.68, rage: true, elevated: true },
  { id: "TC-004", name: "Billing & Pricing Concerns", volume: 134, sentiment: -0.54, rage: false, elevated: false },
  { id: "TC-005", name: "Third-Party Integrations", volume: 121, sentiment: -0.43, rage: false, elevated: false },
  { id: "TC-006", name: "Reporting & Dashboard UX", volume: 109, sentiment: -0.38, rage: false, elevated: false },
];

const REQUIREMENTS: Requirement[] = [
  {
    id: "REQ-001",
    title: "Dashboard Response Time SLA Enforcement",
    description:
      "Reduce analytics dashboard response time from 4.2s average to under 2.0s (P95), with progressive rendering for first meaningful paint under 800ms.",
    priority: "Critical",
    wsjf: { bv: 13, tc: 8, rr: 8, effort: 5, score: 5.8 },
    userStories: [
      {
        id: "US-001",
        story:
          "As an authenticated user, I want the analytics dashboard to fully render within 2 seconds so that my workflow is not blocked.",
        criteria: [
          "Given user opens dashboard, when page loads, then P95 render time is under 2000ms.",
          "Given normal traffic load, when user opens dashboard, then no timeout error appears.",
        ],
      },
      {
        id: "US-002",
        story:
          "As a power user, I want above-the-fold content rendered within 800ms so that I can start reading before all widgets finish.",
        criteria: [
          "Given dashboard request starts, when first paint occurs, then KPI cards appear within 800ms.",
          "Given lower widgets are still loading, when user scrolls, then UI remains responsive.",
        ],
      },
    ],
  },
  {
    id: "REQ-002",
    title: "Onboarding Wizard Streamlining",
    description:
      "Reduce onboarding flow from 12 to max 5 required steps, with optional integration setup deferred and measurable completion target under 8 minutes.",
    priority: "High",
    wsjf: { bv: 8, tc: 8, rr: 5, effort: 3, score: 7.0 },
    userStories: [
      {
        id: "US-004",
        story:
          "As a newly registered user, I want to finish required onboarding in under 8 minutes so that I can activate core value quickly.",
        criteria: [
          "Given new user starts onboarding, when completion happens, then no more than 5 required steps were shown.",
          "Given onboarding completed, when user reaches dashboard, then core features are available without support help.",
        ],
      },
      {
        id: "US-005",
        story:
          "As a user, I want optional integrations separated from required setup so I can skip and continue faster.",
        criteria: [
          "Given optional integration step, when user clicks skip, then onboarding continues without blocking.",
          "Given user skipped integration, when returning later, then setup wizard remains accessible from settings.",
        ],
      },
    ],
  },
  {
    id: "REQ-003",
    title: "Mobile Stability & Crash Prevention",
    description:
      "Reduce mobile crash rate by introducing guardrails around report generation, memory handling, and network retry behavior.",
    priority: "High",
    wsjf: { bv: 8, tc: 7, rr: 7, effort: 7, score: 3.1 },
    userStories: [
      {
        id: "US-007",
        story:
          "As a mobile user, I want report generation to avoid app crashes so I can complete actions reliably on iOS and Android.",
        criteria: [
          "Given report generation on mobile, when request starts, then app does not crash during render.",
          "Given network interruption, when retry policy executes, then user sees graceful recovery state.",
        ],
      },
    ],
  },
];

const SCRAPER_LOGS = [
  "[10:42:01] Initializing Scraper Agent v2.1...",
  "[10:42:03] Reddit + Twitter/X collection started...",
  "[10:42:06] App Store + Google Play reviews fetched",
  "[10:42:11] G2 + Trustpilot + Zendesk ingestion complete",
  "[10:42:18] Merged 2,847 raw records into staging",
  "[10:42:23] ✓ Scraper Agent complete",
];

const CLEANER_LOGS = [
  "[10:42:31] Cleaner Agent initialized (2,847 input)",
  "[10:42:35] Deduplication pass: 891 duplicates removed",
  "[10:42:38] Language normalization + translation complete",
  "[10:42:41] Noise filter removed low-quality records",
  "[10:42:44] PII scrubbed + normalized dataset written",
  "[10:42:46] ✓ Cleaner Agent complete (1,203 clean records)",
];

const ANALYST_LOGS = [
  "[10:43:01] Analyst Agent started with BERTopic clustering",
  "[10:43:05] 8 themes identified from 1,203 clean records",
  "[10:43:09] Top themes: Performance, Onboarding, Mobile",
  "[10:43:12] Generating BRD using claude-opus-4 template",
  "[10:43:16] INVEST schema check pass (18/18 stories)",
  "[10:43:19] ✓ Analyst Agent complete (confidence 0.89)",
];

const CRITIC_LOGS = [
  "[10:44:01] Critic Agent initialized for BRD QA",
  "[10:44:07] INVEST check: 17/18 pass, 1 flagged",
  "[10:44:12] Contradiction scan: no conflicts",
  "[10:44:20] Ambiguity scan: 2 flags raised",
  "[10:44:27] Completeness score: 0.97",
  "[10:44:30] ✓ Critic complete (overall QA 0.91)",
];

const PRIORITIZER_LOGS = [
  "[10:45:01] PM Prioritizer Agent initialized",
  "[10:45:05] WSJF scoring model loaded (with source weighting)",
  "[10:45:09] Strategic alignment scores merged",
  "[10:45:14] Ranking complete — override window opened",
  "[10:45:17] ✓ Prioritizer complete, awaiting human finalize",
];

const INITIAL_FEATURES: RankedFeature[] = [
  {
    id: "f1",
    requirementId: "REQ-001",
    name: "System Performance Optimization",
    bv: 9,
    tc: 8,
    rr: 7,
    effort: 5,
    wsjf: 8.4,
    alignment: 0.91,
    priority: "Critical",
    originalRank: 1,
  },
  {
    id: "f2",
    requirementId: "REQ-002",
    name: "Onboarding Flow Redesign",
    bv: 8,
    tc: 7,
    rr: 6,
    effort: 6,
    wsjf: 7.2,
    alignment: 0.87,
    priority: "High",
    originalRank: 2,
  },
  {
    id: "f3",
    requirementId: "REQ-003",
    name: "Mobile App Stability",
    bv: 8,
    tc: 7,
    rr: 7,
    effort: 7,
    wsjf: 6.8,
    alignment: 0.84,
    priority: "High",
    originalRank: 3,
  },
  {
    id: "f4",
    requirementId: "REQ-004",
    name: "Billing Transparency Dashboard",
    bv: 7,
    tc: 6,
    rr: 6,
    effort: 6,
    wsjf: 5.9,
    alignment: 0.79,
    priority: "Medium",
    originalRank: 4,
  },
  {
    id: "f5",
    requirementId: "REQ-005",
    name: "Integration Expansion",
    bv: 6,
    tc: 5,
    rr: 5,
    effort: 6,
    wsjf: 5.1,
    alignment: 0.72,
    priority: "Medium",
    originalRank: 5,
  },
  {
    id: "f6",
    requirementId: "REQ-006",
    name: "Enhanced Data Export",
    bv: 5,
    tc: 4,
    rr: 4,
    effort: 6,
    wsjf: 4.3,
    alignment: 0.68,
    priority: "Low",
    originalRank: 6,
  },
];

const INITIAL_FLAGS: HitlFlag[] = [
  {
    id: "flag-1",
    feature: "F-002",
    story: "US-005",
    type: "INVEST",
    issue: "Story not independently deployable",
    current: "As a new user, I want the onboarding steps to guide me intuitively...",
    suggested: "Split into two atomic stories (setup config + guidance overlay)",
    state: "open",
  },
  {
    id: "flag-2",
    feature: "F-002",
    story: "US-005",
    type: "Ambiguity",
    issue: "Term: intuitive onboarding",
    current: "Contains non-measurable term 'intuitive'",
    suggested: "Replace with: completable within 8 minutes without support",
    state: "open",
  },
  {
    id: "flag-3",
    feature: "F-005",
    story: "US-013",
    type: "Ambiguity",
    issue: "Term: seamless integration",
    current: "Contains non-measurable term 'seamless'",
    suggested: "Replace with: API response <300ms and 99.9% uptime",
    state: "open",
  },
];

const STAGE_TITLES: Record<StageKey, string> = {
  config: "Config",
  scraper: "Scraper",
  cleaner: "Cleaner",
  analyst: "Analyst",
  critic: "Critic",
  prioritizer: "Prioritizer",
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function DashboardPage() {
  const [sources, setSources] = useState<string[]>(SOURCE_OPTIONS.map((s) => s.id));
  const [dateWindow, setDateWindow] = useState("30d");
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.75);

  const [runStarted, setRunStarted] = useState(false);
  const [runFinished, setRunFinished] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStage, setActiveStage] = useState<StageKey>("config");

  const [stageStatus, setStageStatus] = useState<Record<StageKey, StageState>>({
    config: "idle",
    scraper: "idle",
    cleaner: "idle",
    analyst: "idle",
    critic: "idle",
    prioritizer: "idle",
  });

  const [logs, setLogs] = useState<Record<AgentKey, string[]>>({
    scraper: [],
    cleaner: [],
    analyst: [],
    critic: [],
    prioritizer: [],
  });

  const [summary, setSummary] = useState({
    raw: "—",
    clean: "—",
    reduction: "—",
    themes: "—",
    features: "—",
    stories: "—",
    confidence: "—",
    qaScore: "—",
    qaFlags: "—",
    topWsjf: "—",
    overrides: "0",
  });

  const [hitlFlags, setHitlFlags] = useState<HitlFlag[]>([]);
  const [showHitl, setShowHitl] = useState(false);
  const [rankedFeatures, setRankedFeatures] = useState<RankedFeature[]>([]);
  const [prioritiesFinalized, setPrioritiesFinalized] = useState(false);

  const runId = "#AF-2026-03-14-001";

  const doneCount = useMemo(
    () =>
      Object.values(stageStatus).filter((s) => s === "done").length -
      (stageStatus.config === "done" ? 1 : 0),
    [stageStatus]
  );

  const progress = useMemo(() => {
    if (!runStarted) return 0;
    if (runFinished) return 100;
    return Math.min(95, Math.round((doneCount / 5) * 100 + (isRunning ? 10 : 0)));
  }, [doneCount, isRunning, runFinished, runStarted]);

  const flagCounts = useMemo(() => {
    const resolved = hitlFlags.filter((f) => f.state === "resolved").length;
    const overridden = hitlFlags.filter((f) => f.state === "overridden").length;
    return { total: hitlFlags.length, resolved, overridden };
  }, [hitlFlags]);

  const overrideAudit = useMemo(() => {
    return rankedFeatures
      .map((feature, idx) => ({
        name: feature.name,
        from: feature.originalRank,
        to: idx + 1,
      }))
      .filter((entry) => entry.from !== entry.to);
  }, [rankedFeatures]);

  const brdJsonOutput = useMemo(() => {
    const payload = {
      brd_id: "BRD-AF-2026-03-14-001",
      generated_at: "2026-03-14T10:45:31Z",
      run_id: runId,
      model: "claude-opus-4",
      confidence_score: 0.89,
      hitl_required: false,
      hitl_threshold: confidenceThreshold,
      context: {
        data_sources: sources.length,
        date_window: dateWindow,
        raw_records: 2847,
        clean_records: 1203,
        themes_identified: 8,
        features_generated: 6,
      },
      qa: {
        invest: 0.94,
        contradiction: 1.0,
        ambiguity: 0.88,
        completeness: 0.97,
        overall: 0.91,
      },
      requirements: REQUIREMENTS,
      wsjf_ranking: rankedFeatures,
      hitl_flags: hitlFlags,
      override_audit: overrideAudit,
    };

    return JSON.stringify(payload, null, 2);
  }, [confidenceThreshold, dateWindow, hitlFlags, overrideAudit, rankedFeatures, runId, sources.length]);

  const pushLog = (agent: AgentKey, line: string) => {
    setLogs((prev) => ({ ...prev, [agent]: [...prev[agent], line] }));
  };

  const setStage = (stage: StageKey, state: StageState) => {
    setStageStatus((prev) => ({ ...prev, [stage]: state }));
  };

  const runAgent = async (agent: AgentKey, lines: string[]) => {
    setActiveStage(agent);
    setStage(agent, "running");
    for (const line of lines) {
      await delay(430);
      pushLog(agent, line);
    }
    setStage(agent, "done");
  };

  const startPipeline = async () => {
    if (isRunning || sources.length === 0) return;

    setRunStarted(true);
    setRunFinished(false);
    setIsRunning(true);
    setShowHitl(false);
    setPrioritiesFinalized(false);
    setRankedFeatures([]);
    setHitlFlags([]);
    setLogs({ scraper: [], cleaner: [], analyst: [], critic: [], prioritizer: [] });
    setSummary({
      raw: "—",
      clean: "—",
      reduction: "—",
      themes: "—",
      features: "—",
      stories: "—",
      confidence: "—",
      qaScore: "—",
      qaFlags: "—",
      topWsjf: "—",
      overrides: "0",
    });

    setStageStatus({
      config: "done",
      scraper: "idle",
      cleaner: "idle",
      analyst: "idle",
      critic: "idle",
      prioritizer: "idle",
    });

    await runAgent("scraper", SCRAPER_LOGS);
    setSummary((prev) => ({ ...prev, raw: "2,847" }));

    await runAgent("cleaner", CLEANER_LOGS);
    setSummary((prev) => ({ ...prev, clean: "1,203", reduction: "57.7%" }));

    await runAgent("analyst", ANALYST_LOGS);
    setSummary((prev) => ({ ...prev, themes: "8", features: "6", stories: "18", confidence: "0.89" }));

    await runAgent("critic", CRITIC_LOGS);
    setHitlFlags(INITIAL_FLAGS);
    setShowHitl(true);
    setSummary((prev) => ({ ...prev, qaScore: "0.91", qaFlags: "3" }));

    await runAgent("prioritizer", PRIORITIZER_LOGS);
    setRankedFeatures(INITIAL_FEATURES);
    setSummary((prev) => ({ ...prev, topWsjf: "8.4" }));

    setActiveStage("prioritizer");
    setIsRunning(false);
    setRunFinished(true);
  };

  const resetPipeline = () => {
    setRunStarted(false);
    setRunFinished(false);
    setIsRunning(false);
    setActiveStage("config");
    setStageStatus({
      config: "idle",
      scraper: "idle",
      cleaner: "idle",
      analyst: "idle",
      critic: "idle",
      prioritizer: "idle",
    });
    setLogs({ scraper: [], cleaner: [], analyst: [], critic: [], prioritizer: [] });
    setHitlFlags([]);
    setShowHitl(false);
    setPrioritiesFinalized(false);
    setRankedFeatures([]);
    setSummary({
      raw: "—",
      clean: "—",
      reduction: "—",
      themes: "—",
      features: "—",
      stories: "—",
      confidence: "—",
      qaScore: "—",
      qaFlags: "—",
      topWsjf: "—",
      overrides: "0",
    });
  };

  const updateFlag = (id: string, state: FlagState) => {
    setHitlFlags((prev) => prev.map((f) => (f.id === id ? { ...f, state } : f)));
  };

  const moveFeature = (index: number, direction: -1 | 1) => {
    if (prioritiesFinalized) return;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= rankedFeatures.length) return;

    setRankedFeatures((prev) => {
      const copy = [...prev];
      [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
      return copy;
    });
  };

  const resetAiOrder = () => {
    if (prioritiesFinalized) return;
    setRankedFeatures([...INITIAL_FEATURES]);
  };

  const finalizePriorities = () => {
    if (!rankedFeatures.length) return;
    const overrides = rankedFeatures.filter((f, idx) => f.originalRank !== idx + 1).length;
    setPrioritiesFinalized(true);
    setSummary((prev) => ({ ...prev, overrides: String(overrides) }));
  };

  return (
    <div className="max-w-[1280px] mx-auto grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 animate-fade-in">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Pipeline Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              Scraper → Cleaner → Analyst → Critic QA → Prioritizer → Ranked BRD
            </p>
          </div>
          <div className="text-right text-xs font-mono text-slate-500">
            Run ID: {runId}
            <br />
            Status: <span className="text-blue-600 font-semibold">{runFinished ? "Complete" : isRunning ? "Running" : "Configuring"}</span>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {(Object.keys(STAGE_TITLES) as StageKey[]).map((stage, idx, arr) => {
              const status = stageStatus[stage];
              const isActive = activeStage === stage && isRunning;
              return (
                <div key={stage} className="flex items-center gap-2">
                  <div className="text-center min-w-[90px]">
                    <div
                      className={`w-8 h-8 mx-auto rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                        status === "done"
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : isActive
                          ? "bg-blue-100 border-blue-500 text-blue-700"
                          : "bg-white border-slate-300 text-slate-500"
                      }`}
                    >
                      {idx}
                    </div>
                    <p
                      className={`text-[10px] font-semibold mt-1 ${
                        isActive
                          ? "text-blue-600"
                          : status === "done"
                          ? "text-emerald-600"
                          : "text-slate-500"
                      }`}
                    >
                      {STAGE_TITLES[stage].toUpperCase()}
                    </p>
                  </div>
                  {idx < arr.length - 1 && (
                    <div className={`w-8 h-[2px] ${status === "done" ? "bg-emerald-500" : "bg-slate-300"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card-static bg-white border border-blue-100 rounded-md overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-base font-semibold text-slate-900">Pipeline Configuration</p>
                <p className="text-xs text-slate-500">Configured from your agent workflow. Start to execute each agent in sequence.</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-5">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Feedback Sources</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {SOURCE_OPTIONS.map((source) => {
                  const checked = sources.includes(source.id);
                  return (
                    <label
                      key={source.id}
                      className={`border rounded-md px-3 py-2 cursor-pointer ${
                        checked ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setSources((prev) =>
                              e.target.checked
                                ? [...prev, source.id]
                                : prev.filter((id) => id !== source.id)
                            );
                          }}
                          className="mt-0.5"
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-800">{source.name}</p>
                          <p className="text-xs text-slate-500">{source.desc}</p>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Date Range</p>
                <select
                  className="w-full h-9 px-3 border border-slate-300 rounded-md text-sm text-slate-700"
                  value={dateWindow}
                  onChange={(e) => setDateWindow(e.target.value)}
                >
                  <option value="7d">Last 7 days</option>
                  <option value="14d">Last 14 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Confidence Threshold</p>
                <div className="rounded-md border border-slate-300 px-3 py-2">
                  <input
                    type="range"
                    min={0.5}
                    max={1}
                    step={0.05}
                    value={confidenceThreshold}
                    onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-sm font-mono text-blue-600 text-right">{confidenceThreshold.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <p className="text-xs text-slate-500">Now generates full BRD report sections after pipeline completes.</p>
              <div className="flex items-center gap-2">
                <button className="btn-secondary" onClick={resetPipeline}>
                  <RotateCcw className="w-4 h-4" /> Reset
                </button>
                <button
                  className="btn-primary"
                  onClick={startPipeline}
                  disabled={isRunning || sources.length === 0}
                >
                  <Play className="w-4 h-4" />
                  {isRunning ? "Running..." : "Generate Ranked BRD"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {runStarted && (
          <div className="glass-card p-5 border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CircleDashed className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-semibold text-slate-800">
                  {runFinished ? "Pipeline completed" : `Running ${activeStage} agent...`}
                </p>
              </div>
              <span className="text-sm font-mono font-bold text-blue-700">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {runStarted && (
          <div className="space-y-4">
            <AgentCard
              title="Scraper Agent"
              status={stageStatus.scraper}
              logs={logs.scraper}
              output={summary.raw !== "—" ? "Records collected: 2,847" : undefined}
            />
            <AgentCard
              title="Cleaner Agent"
              status={stageStatus.cleaner}
              logs={logs.cleaner}
              output={summary.clean !== "—" ? "Output clean records: 1,203" : undefined}
            />
            <AgentCard
              title="Analyst Agent"
              status={stageStatus.analyst}
              logs={logs.analyst}
              output={
                summary.themes !== "—" ? "Themes: 8 | Stories: 18 | Confidence: 0.89" : undefined
              }
            />
            <AgentCard
              title="Critic Agent"
              status={stageStatus.critic}
              logs={logs.critic}
              output={summary.qaScore !== "—" ? "QA score: 0.91 | Flags: 3" : undefined}
            />
            <AgentCard
              title="Prioritizer Agent"
              status={stageStatus.prioritizer}
              logs={logs.prioritizer}
              output={summary.topWsjf !== "—" ? "Top WSJF: 8.4" : undefined}
            />
          </div>
        )}

        {runFinished && (
          <div className="space-y-5">
            <div className="glass-card-static bg-white border border-blue-100 rounded-md p-5">
              <h3 className="text-lg font-semibold text-slate-900">Executive Summary</h3>
              <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                This BRD consolidates 1,203 validated customer signals (from 2,847 raw records) across
                7 data sources. BERTopic clustering identified 8 major themes and generated 6 priority
                requirements. Critic QA scored the output at 0.91 against a 0.80 threshold, so the BRD
                is approved with minor quality flags for optional human review.
              </p>
            </div>

            <div className="glass-card-static bg-white border border-blue-100 rounded-md overflow-hidden">
              <div className="p-4 bg-blue-100 border-b border-blue-200">
                <h3 className="text-lg font-bold text-blue-800 uppercase tracking-wide">
                  BRD Quality Assurance — Critic Agent
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-300">
                <ScoreCell title="INVEST" score="0.94" detail="17/18 pass" status="✅ PASS" statusClass="text-emerald-600" />
                <ScoreCell title="CONTRADICTION" score="1.00" detail="No conflicts" status="✅ PASS" statusClass="text-emerald-600" />
                <ScoreCell title="AMBIGUITY" score="0.88" detail="2 flags" status="⚠ FLAG" statusClass="text-amber-600" />
                <ScoreCell title="COMPLETENESS" score="0.97" detail="6/6 features" status="✅ PASS" statusClass="text-emerald-600" />
              </div>
              <div className="bg-emerald-100 border-t border-emerald-200 px-4 py-3 text-center text-slate-800 font-mono font-semibold">
                OVERALL QA: 0.91 &nbsp;&nbsp; Threshold: 0.80 &nbsp;&nbsp; ✅ APPROVED
              </div>
            </div>

            <div className="glass-card-static bg-white border border-blue-100 rounded-md p-5">
              <h3 className="text-base font-semibold text-slate-900 mb-3">Data Source Summary</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 text-xs uppercase">
                      <th className="px-3 py-2 text-left">Source</th>
                      <th className="px-3 py-2 text-right">Collected</th>
                      <th className="px-3 py-2 text-right">After Cleaning</th>
                      <th className="px-3 py-2 text-right">% of Clean Dataset</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SOURCE_BREAKDOWN.map((row) => (
                      <tr key={row.source} className="border-b border-slate-200">
                        <td className="px-3 py-2 text-slate-800">{row.source}</td>
                        <td className="px-3 py-2 text-right text-slate-700">{row.collected}</td>
                        <td className="px-3 py-2 text-right text-slate-700">{row.clean}</td>
                        <td className="px-3 py-2 text-right text-slate-700">{row.pct}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-card-static bg-white border border-blue-100 rounded-md p-5">
              <h3 className="text-base font-semibold text-slate-900 mb-3">Cluster Analysis</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 text-xs uppercase">
                      <th className="px-3 py-2 text-left">Cluster</th>
                      <th className="px-3 py-2 text-left">Theme</th>
                      <th className="px-3 py-2 text-right">Volume</th>
                      <th className="px-3 py-2 text-right">Sentiment</th>
                      <th className="px-3 py-2 text-center">Rage/Churn</th>
                      <th className="px-3 py-2 text-center">Auto Elevated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {THEME_CLUSTERS.map((cluster) => (
                      <tr key={cluster.id} className="border-b border-slate-200">
                        <td className="px-3 py-2 font-mono text-slate-800">{cluster.id}</td>
                        <td className="px-3 py-2 text-slate-800">{cluster.name}</td>
                        <td className="px-3 py-2 text-right text-slate-700">{cluster.volume}</td>
                        <td className="px-3 py-2 text-right text-slate-700">{cluster.sentiment.toFixed(2)}</td>
                        <td className="px-3 py-2 text-center">{cluster.rage ? "YES" : "No"}</td>
                        <td className="px-3 py-2 text-center">{cluster.elevated ? "YES" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-card-static bg-white border border-blue-100 rounded-md p-5">
              <h3 className="text-base font-semibold text-slate-900 mb-3">Functional Requirements</h3>
              <div className="space-y-4">
                {REQUIREMENTS.map((req) => (
                  <div key={req.id} className="border border-slate-200 rounded-md p-4 bg-slate-50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 font-mono">{req.id}</span>
                      <h4 className="text-sm font-semibold text-slate-900">{req.title}</h4>
                      <span
                        className={`ml-auto text-xs px-2 py-1 rounded ${
                          req.priority === "Critical"
                            ? "bg-red-100 text-red-700"
                            : req.priority === "High"
                            ? "bg-amber-100 text-amber-700"
                            : req.priority === "Medium"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {req.priority}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mb-3">{req.description}</p>
                    <p className="text-xs text-slate-600 font-mono mb-2">
                      WSJF = ({req.wsjf.bv} + {req.wsjf.tc} + {req.wsjf.rr}) / {req.wsjf.effort} = {req.wsjf.score.toFixed(1)}
                    </p>
                    <div className="space-y-2">
                      {req.userStories.map((story) => (
                        <div key={story.id} className="border border-slate-200 rounded p-3 bg-white">
                          <p className="text-xs font-mono text-blue-700 mb-1">{story.id}</p>
                          <p className="text-sm text-slate-800 mb-2">{story.story}</p>
                          <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                            {story.criteria.map((criterion, idx) => (
                              <li key={idx}>{criterion}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {showHitl && (
              <div className="glass-card-static bg-white border border-amber-200 rounded-md p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Quality Flags
                  </p>
                  <p className="text-xs text-slate-600">
                    {flagCounts.total} flags | {flagCounts.resolved} resolved | {flagCounts.overridden} overridden
                  </p>
                </div>

                <div className="space-y-2">
                  {hitlFlags.map((flag) => (
                    <div
                      key={flag.id}
                      className={`rounded-md border p-3 ${
                        flag.state === "resolved"
                          ? "bg-emerald-50 border-emerald-200"
                          : flag.state === "overridden"
                          ? "bg-slate-50 border-slate-200"
                          : "bg-white border-amber-200"
                      }`}
                    >
                      <p className="text-xs font-semibold text-slate-800">
                        {flag.feature} / {flag.story} · {flag.type}
                      </p>
                      <p className="text-sm text-slate-700 mt-1">{flag.issue}</p>
                      <p className="text-xs text-slate-500 mt-1">Current: {flag.current}</p>
                      <p className="text-xs text-blue-700 mt-1">Suggested: {flag.suggested}</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700"
                          onClick={() => updateFlag(flag.id, "resolved")}
                        >
                          Resolve
                        </button>
                        <button
                          className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700"
                          onClick={() => updateFlag(flag.id, "overridden")}
                        >
                          Override
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rankedFeatures.length > 0 && (
              <div className="glass-card-static bg-white border border-blue-100 rounded-md overflow-hidden">
                <div className="p-5 border-b border-slate-200">
                  <p className="text-lg font-semibold text-slate-900">
                    WSJF Prioritization Requirement Ranking
                  </p>
                  <p className="text-sm text-slate-500">
                    Human override controls included below as requested.
                  </p>
                </div>
                <div className="p-5 space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 text-xs uppercase">
                          <th className="px-2 py-2 text-left">Rank</th>
                          <th className="px-2 py-2 text-left">Requirement</th>
                          <th className="px-2 py-2 text-left">Feature</th>
                          <th className="px-2 py-2 text-center">BV</th>
                          <th className="px-2 py-2 text-center">TC</th>
                          <th className="px-2 py-2 text-center">RR</th>
                          <th className="px-2 py-2 text-center">E</th>
                          <th className="px-2 py-2 text-center">WSJF</th>
                          <th className="px-2 py-2 text-center">Align</th>
                          <th className="px-2 py-2 text-left">Priority</th>
                          <th className="px-2 py-2 text-left">Move</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rankedFeatures.map((f, idx) => (
                          <tr key={f.id} className="border-b border-slate-200 text-slate-700">
                            <td className="px-2 py-2 font-mono">{idx + 1}</td>
                            <td className="px-2 py-2 font-mono text-blue-700">{f.requirementId}</td>
                            <td className="px-2 py-2 font-medium">{f.name}</td>
                            <td className="px-2 py-2 text-center">{f.bv}</td>
                            <td className="px-2 py-2 text-center">{f.tc}</td>
                            <td className="px-2 py-2 text-center">{f.rr}</td>
                            <td className="px-2 py-2 text-center">{f.effort}</td>
                            <td className="px-2 py-2 text-center font-semibold text-blue-700">
                              {f.wsjf.toFixed(1)}
                            </td>
                            <td className="px-2 py-2 text-center font-mono">
                              {f.alignment.toFixed(2)}
                            </td>
                            <td className="px-2 py-2">
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  f.priority === "Critical"
                                    ? "bg-red-100 text-red-700"
                                    : f.priority === "High"
                                    ? "bg-amber-100 text-amber-700"
                                    : f.priority === "Medium"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {f.priority}
                              </span>
                            </td>
                            <td className="px-2 py-2">
                              <div className="flex items-center gap-1">
                                <button
                                  className="px-2 py-1 rounded bg-slate-100 text-slate-700 disabled:opacity-40"
                                  onClick={() => moveFeature(idx, -1)}
                                  disabled={idx === 0 || prioritiesFinalized}
                                >
                                  ↑
                                </button>
                                <button
                                  className="px-2 py-1 rounded bg-slate-100 text-slate-700 disabled:opacity-40"
                                  onClick={() => moveFeature(idx, 1)}
                                  disabled={idx === rankedFeatures.length - 1 || prioritiesFinalized}
                                >
                                  ↓
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button className="btn-secondary" onClick={resetAiOrder} disabled={prioritiesFinalized}>
                      Reset to AI Order
                    </button>
                    <button className="btn-primary" onClick={finalizePriorities} disabled={prioritiesFinalized}>
                      <CheckCircle2 className="w-4 h-4" />
                      {prioritiesFinalized ? "Finalized" : "Finalize & Forward"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="glass-card-static bg-white border border-blue-100 rounded-md p-5">
              <h3 className="text-base font-semibold text-slate-900 mb-3">Human Override Audit</h3>
              {overrideAudit.length === 0 ? (
                <p className="text-sm text-slate-600">No override movement yet. Ranking still in AI order.</p>
              ) : (
                <div className="space-y-2">
                  {overrideAudit.map((entry) => (
                    <div key={entry.name} className="text-sm text-slate-700 border border-slate-200 rounded px-3 py-2 bg-slate-50">
                      {entry.name}: rank {entry.from} → rank {entry.to}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card-static bg-white border border-blue-100 rounded-md p-5">
              <h3 className="text-base font-semibold text-slate-900 mb-3">Raw JSON Output</h3>
              <pre className="bg-slate-900 text-sky-200 text-xs p-4 rounded-md overflow-auto max-h-[420px]">
                {brdJsonOutput}
              </pre>
            </div>
          </div>
        )}
      </div>

      <aside className="space-y-4">
        <div className="glass-card-static bg-white border border-blue-100 rounded-md p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">Pipeline Summary</p>
          <SidebarStat label="Raw Records" value={summary.raw} />
          <SidebarStat label="Clean Records" value={summary.clean} />
          <SidebarStat label="Reduction" value={summary.reduction} />
          <SidebarStat label="Themes" value={summary.themes} />
          <SidebarStat label="Features" value={summary.features} />
          <SidebarStat label="User Stories" value={summary.stories} />
          <SidebarStat label="Confidence" value={summary.confidence} />
          <SidebarStat label="QA Score" value={summary.qaScore} />
          <SidebarStat label="QA Flags" value={summary.qaFlags} />
          <SidebarStat label="Top WSJF" value={summary.topWsjf} />
          <SidebarStat label="Overrides" value={summary.overrides} />
          <SidebarStat label="Stage" value={runStarted ? `${doneCount} / 5` : "0 / 5"} />
        </div>

        <div className="glass-card-static bg-white border border-blue-100 rounded-md p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">Agent Status</p>
          {(["scraper", "cleaner", "analyst", "critic", "prioritizer"] as AgentKey[]).map((agent) => {
            const status = stageStatus[agent];
            const dot =
              status === "done"
                ? "bg-emerald-500"
                : status === "running"
                ? "bg-blue-500 animate-pulse"
                : "bg-slate-300";
            const text =
              status === "done"
                ? "text-emerald-600"
                : status === "running"
                ? "text-blue-600"
                : "text-slate-500";
            return (
              <div key={agent} className="flex items-center gap-2 py-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                <span className="text-sm text-slate-700 capitalize">{agent}</span>
                <span className={`ml-auto text-xs font-medium ${text}`}>{status}</span>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}

function AgentCard({
  title,
  status,
  logs,
  output,
}: {
  title: string;
  status: StageState;
  logs: string[];
  output?: string;
}) {
  return (
    <div className="glass-card-static bg-white border border-blue-100 rounded-md overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <span
          className={`text-xs px-2 py-0.5 rounded ${
            status === "done"
              ? "bg-emerald-100 text-emerald-700"
              : status === "running"
              ? "bg-blue-100 text-blue-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {status.toUpperCase()}
        </span>
      </div>
      <div className="p-4">
        <div className="rounded-md bg-slate-900 border border-slate-700 p-3 h-36 overflow-auto">
          {logs.length === 0 ? (
            <p className="text-slate-500 text-xs font-mono">Waiting to run...</p>
          ) : (
            <div className="space-y-1">
              {logs.map((line, idx) => (
                <p key={`${line}-${idx}`} className="text-[11px] text-sky-300 font-mono leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
        {output && (
          <div className="mt-2 text-xs bg-blue-50 border border-blue-100 text-blue-700 rounded px-2 py-1 flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5" /> {output}
          </div>
        )}
      </div>
    </div>
  );
}

function SidebarStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-none">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
  );
}

function ScoreCell({
  title,
  score,
  detail,
  status,
  statusClass,
}: {
  title: string;
  score: string;
  detail: string;
  status: string;
  statusClass: string;
}) {
  return (
    <div className="p-6 text-center bg-slate-50">
      <p className="text-xs tracking-[0.18em] text-slate-500 font-semibold">{title}</p>
      <p className="text-3xl font-bold text-slate-800 font-mono mt-2">{score}</p>
      <p className="text-lg text-slate-600 mt-2">{detail}</p>
      <p className={`text-xl font-semibold mt-2 ${statusClass}`}>{status}</p>
    </div>
  );
}
