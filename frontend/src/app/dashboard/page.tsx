"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MessageSquareText,
  Sparkles,
  Filter,
  Brain,
  FileText,
  ShieldCheck,
  UserCheck,
  ArrowUpDown,
  Blocks,
  Shield,
  CheckCircle2,
  XCircle,
  Edit3,
  Zap,
  ArrowRight,
  Hash,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

/* -------------------------------------------------------
   Step definitions
   ------------------------------------------------------- */
const STEPS = [
  { id: 1, title: "Collecting Customer Feedback", icon: MessageSquareText, color: "#3b82f6", duration: 4000 },
  { id: 2, title: "Cleaning and Normalizing Data", icon: Filter, color: "#06b6d4", duration: 3500 },
  { id: 3, title: "Detecting Product Issues", icon: Brain, color: "#8b5cf6", duration: 4000 },
  { id: 4, title: "Generating Business Requirements", icon: FileText, color: "#f59e0b", duration: 4500 },
  { id: 5, title: "Validating Requirements", icon: ShieldCheck, color: "#10b981", duration: 3500 },
  { id: 6, title: "Human Review Required", icon: UserCheck, color: "#ec4899", duration: 0 }, // manual
  { id: 7, title: "Calculating Feature Priority", icon: ArrowUpDown, color: "#f97316", duration: 4000 },
  { id: 8, title: "Creating Epics and User Stories", icon: Blocks, color: "#a855f7", duration: 4000 },
  { id: 9, title: "Recording Immutable Audit Trail", icon: Shield, color: "#14b8a6", duration: 4000 },
  { id: 10, title: "AutoFlow Analysis Complete", icon: Zap, color: "#3b82f6", duration: 0 },
];

const DESCRIPTIONS: Record<number, string> = {
  1: "Aggregating signals from Reddit, app store reviews, and support tickets.",
  2: "Removing duplicates, filtering noise, detecting language, and preparing structured feedback.",
  3: "Grouping similar feedback into themes using AI clustering.",
  4: "Analyst Agent synthesizing clustered feedback into structured BRDs.",
  5: "Critic Agent reviewing generated BRDs for ambiguity, completeness, and acceptance criteria.",
  6: "Review the AI-generated BRD before it proceeds to prioritization.",
  7: "Applying WSJF scoring based on business value, urgency, and risk reduction.",
  8: "Story Writer Agent converting BRDs into developer-ready epics.",
  9: "Storing requirement hashes and decision history on blockchain.",
  10: "Pipeline execution finished. All requirements processed successfully.",
};

/* =======================================================
   DASHBOARD PAGE
   ======================================================= */
export default function DashboardPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [transitioning, setTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  const goToStep = useCallback((next: number) => {
    setTransitioning(true);
    setTimeout(() => {
      setCurrentStep(next);
      setProgress(0);
      setTransitioning(false);
    }, 400);
  }, []);

  /* Auto-advance for non-manual steps */
  useEffect(() => {
    if (!isStarted) return;

    const step = STEPS[currentStep - 1];
    if (!step || step.duration === 0) return;

    const interval = 50;
    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += interval;
      setProgress(Math.min((elapsed / step.duration) * 100, 100));
      if (elapsed >= step.duration) {
        clearInterval(timer);
        if (currentStep < STEPS.length) {
          goToStep(currentStep + 1);
        }
      }
    }, interval);

    return () => clearInterval(timer);
  }, [currentStep, goToStep, isStarted]);

  const step = STEPS[currentStep - 1];

  return (
    <div className="dashboard-flow h-full flex flex-col items-center justify-start relative overflow-x-hidden pt-8 pb-8 -m-6">
      {/* Background glow */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[200px] opacity-15 pointer-events-none transition-all duration-1000"
        style={{ background: step.color, top: "10%", left: "30%" }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full blur-[150px] opacity-10 pointer-events-none transition-all duration-1000"
        style={{ background: step.color, bottom: "10%", right: "20%" }}
      />

      {/* Step progress bar (top) */}
      <div className="fixed top-[64px] left-[260px] right-0 z-30 px-8 py-3">
        <div className="flex items-center gap-1.5 max-w-4xl mx-auto">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1.5 flex-1">
              <div
                className={`step-dot ${
                  i + 1 < currentStep ? "completed" : i + 1 === currentStep ? "active" : "pending"
                }`}
              />
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-[2px] rounded-full overflow-hidden bg-white/5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: i + 1 < currentStep ? "100%" : i + 1 === currentStep ? `${progress}%` : "0%",
                      background: `linear-gradient(90deg, ${STEPS[i].color}, ${STEPS[i + 1].color})`,
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-1">
          <span className="text-[10px] uppercase tracking-widest text-slate-600">
            Step {currentStep} of {STEPS.length}
          </span>
        </div>
      </div>

      {/* Main card area */}
      <div
        className={`w-full max-w-2xl px-6 mt-20 md:mt-24 transition-all duration-400 ${
          transitioning ? "opacity-0 scale-95 translate-y-4" : "opacity-100 scale-100 translate-y-0"
        }`}
      >
        {!isStarted && (
          <div className="pipeline-card p-8 mb-6 step-enter text-center">
            <h3 className="text-xl font-bold text-white mb-2">Pipeline Ready</h3>
            <p className="text-sm text-slate-500 mb-5">
              Click start to begin processing from Step 1.
            </p>
            <button
              onClick={() => {
                setCurrentStep(1);
                setProgress(0);
                setIsStarted(true);
              }}
              className="btn-primary"
            >
              Start Pipeline
            </button>
          </div>
        )}

        {/* Step icon + title */}
        <div className={`text-center mb-6 step-enter ${!isStarted ? "opacity-50" : ""}`}>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: step.color + "20", color: step.color }}
          >
            <step.icon className="w-8 h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{step.title}</h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            {DESCRIPTIONS[currentStep]}
          </p>
        </div>

        {/* Step-specific content */}
        {isStarted && (
          <div className="pipeline-card p-8 glow-border-anim step-enter" style={{ animationDelay: "0.15s" }}>
            <StepContent step={currentStep} onAction={() => goToStep(currentStep + 1)} />
          </div>
        )}

        {/* Skip / manual controls */}
        {isStarted && currentStep < STEPS.length && STEPS[currentStep - 1].duration > 0 && (
          <div className="text-center mt-4 step-enter" style={{ animationDelay: "0.3s" }}>
            <button
              onClick={() => goToStep(currentStep + 1)}
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors cursor-pointer"
            >
              Skip →
            </button>
          </div>
        )}

        {/* Restart on final step */}
        {currentStep === 10 && (
          <div className="text-center mt-6 step-enter" style={{ animationDelay: "0.4s" }}>
            <button
              onClick={() => {
                setIsStarted(false);
                goToStep(1);
              }}
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Run Pipeline Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   Step-specific content components
   ------------------------------------------------------- */
function StepContent({ step, onAction }: { step: number; onAction: () => void }) {
  switch (step) {
    case 1: return <Step1Feedback />;
    case 2: return <Step2Cleaning />;
    case 3: return <Step3Clustering />;
    case 4: return <Step4BRDGen />;
    case 5: return <Step5Validation />;
    case 6: return <Step6HumanReview onAction={onAction} />;
    case 7: return <Step7Priority />;
    case 8: return <Step8Epics />;
    case 9: return <Step9Blockchain />;
    case 10: return <Step10Final />;
    default: return null;
  }
}

/* --- STEP 1: Feedback Ingestion --- */
function Step1Feedback() {
  const sources = [
    { name: "Reddit", count: 847, color: "#ff6b35" },
    { name: "App Store", count: 312, color: "#007aff" },
    { name: "Google Play", count: 489, color: "#34a853" },
    { name: "Support Tickets", count: 156, color: "#8b5cf6" },
  ];

  return (
    <div className="space-y-4">
      {sources.map((src, i) => (
        <div
          key={src.name}
          className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/5"
          style={{ animation: `rank-slide 0.5s ${i * 0.1}s ease both` }}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: src.color + "20", color: src.color }}>
            {src.name[0]}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-white">{src.name}</div>
            <div className="h-1.5 rounded-full bg-white/5 mt-1.5 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  background: src.color,
                  width: `${(src.count / 847) * 100}%`,
                  animation: `progress-fill 1.5s ${0.3 + i * 0.15}s ease both`,
                }}
              />
            </div>
          </div>
          <span className="text-xs font-mono text-slate-500">{src.count}</span>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: src.color }} />
        </div>
      ))}
      <div className="text-center pt-2">
        <span className="text-xs text-slate-600 font-mono">1,804 signals collected</span>
      </div>
    </div>
  );
}

/* --- STEP 2: Cleaning --- */
function Step2Cleaning() {
  const operations = [
    { label: "Duplicates removed", value: 234, icon: "×" },
    { label: "Language detected", value: "EN, ES, FR", icon: "🌐" },
    { label: "Noise filtered", value: 89, icon: "⊘" },
    { label: "Records normalized", value: "1,481", icon: "✓" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {operations.map((op, i) => (
        <div
          key={op.label}
          className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-center"
          style={{ animation: `step-enter 0.5s ${i * 0.1}s ease both` }}
        >
          <div className="text-2xl mb-2">{op.icon}</div>
          <div className="text-lg font-bold text-white">{op.value}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{op.label}</div>
        </div>
      ))}
    </div>
  );
}

/* --- STEP 3: Clustering --- */
function Step3Clustering() {
  const clusters = [
    { name: "Upload Failures", count: 127, pct: 38 },
    { name: "Performance Issues", count: 89, pct: 27 },
    { name: "UI/UX Problems", count: 64, pct: 19 },
    { name: "Feature Requests", count: 53, pct: 16 },
  ];

  return (
    <div className="space-y-3">
      {clusters.map((c, i) => (
        <div
          key={c.name}
          className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/5"
          style={{ animation: `rank-slide 0.5s ${i * 0.12}s ease both` }}
        >
          <div className="w-10 h-10 rounded-lg bg-purple-500/15 flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-white">{c.name}</span>
              <span className="text-xs text-slate-500">{c.count} mentions</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                style={{ width: `${c.pct}%`, animation: `progress-fill 1s ${0.3 + i * 0.1}s ease both` }}
              />
            </div>
          </div>
        </div>
      ))}
      <div className="text-center pt-1">
        <span className="text-xs font-mono text-slate-600">4 clusters identified via BERTopic</span>
      </div>
    </div>
  );
}

/* --- STEP 4: BRD Generation --- */
function Step4BRDGen() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
        <Sparkles className="w-5 h-5 text-yellow-400" />
        <span className="text-sm text-yellow-300 font-medium">Analyst Agent is writing…</span>
      </div>
      {["Upload Reliability BRD", "Performance Optimization BRD"].map((title, i) => (
        <div
          key={title}
          className="p-4 rounded-xl bg-white/[0.03] border border-white/5"
          style={{ animation: `step-enter 0.6s ${0.4 + i * 0.3}s ease both` }}
        >
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-semibold text-white">{title}</span>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400">Generating</span>
          </div>
          <div className="space-y-1.5 pl-8">
            {["Problem Statement", "Success Metrics", "Acceptance Criteria", "WSJF Score"].map((f, j) => (
              <div key={f} className="flex items-center gap-2" style={{ animation: `rank-slide 0.4s ${0.6 + i * 0.3 + j * 0.1}s ease both` }}>
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span className="text-xs text-slate-500">{f}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* --- STEP 5: Validation --- */
function Step5Validation() {
  const checks = [
    { label: "No ambiguous language", pass: true },
    { label: "Acceptance criteria present", pass: true },
    { label: "Measurable success metrics", pass: true },
    { label: "WSJF score > threshold", pass: true },
    { label: "Evidence linked", pass: true },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold text-white">Upload Reliability BRD</span>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold">
            CONFIDENCE: 92%
          </span>
        </div>
        <div className="space-y-2">
          {checks.map((c, i) => (
            <div
              key={c.label}
              className="flex items-center gap-3 text-sm"
              style={{ animation: `rank-slide 0.4s ${i * 0.15}s ease both` }}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400">{c.label}</span>
            </div>
          ))}
        </div>
        {/* Scan animation overlay */}
        <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent pointer-events-none" style={{ animation: "scan-line 2s ease-in-out infinite" }} />
      </div>
      <div className="text-center">
        <span className="text-xs font-mono text-slate-600">Critic Agent: all checks passed ✓</span>
      </div>
    </div>
  );
}

/* --- STEP 6: Human Review (manual) --- */
function Step6HumanReview({ onAction }: { onAction: () => void }) {
  return (
    <div className="space-y-5">
      {/* BRD Preview */}
      <div className="p-5 rounded-xl bg-white/[0.03] border border-blue-500/15">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">AI-Generated BRD Preview</span>
        </div>

        <div className="mb-4">
          <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-1">Problem Statement</h4>
          <p className="text-sm text-slate-300 leading-relaxed">
            Users experience crashes during photo uploads on mobile devices. Analysis of 127 feedback mentions
            reveals upload failures on files &gt;5MB, with no retry mechanism or progress indication.
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Acceptance Criteria</h4>
          <ul className="space-y-1.5">
            {[
              "Upload success for files ≤10MB",
              "Automatic retry on network failure (max 3 attempts)",
              "Display real-time upload progress indicator",
              "Graceful error messaging for unsupported file types",
            ].map((text) => (
              <li key={text} className="flex items-start gap-2 text-sm text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="text-[11px] text-slate-600">
            <span className="text-slate-500">Confidence:</span>{" "}
            <span className="text-emerald-400 font-bold">92%</span>
          </div>
          <div className="text-[11px] text-slate-600">
            <span className="text-slate-500">WSJF:</span>{" "}
            <span className="text-blue-400 font-bold">12.5</span>
          </div>
          <div className="text-[11px] text-slate-600">
            <span className="text-slate-500">Evidence:</span>{" "}
            <span className="text-purple-400 font-bold">127 mentions</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm cursor-pointer transition-all shadow-lg shadow-emerald-500/20"
        >
          <CheckCircle2 className="w-4 h-4" />
          Approve
        </button>
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-semibold text-sm cursor-pointer transition-all"
        >
          <Edit3 className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-red-500/20 hover:bg-red-500/10 text-red-400 font-semibold text-sm cursor-pointer transition-all"
        >
          <XCircle className="w-4 h-4" />
          Reject
        </button>
      </div>
    </div>
  );
}

/* --- STEP 7: Priority --- */
function Step7Priority() {
  const items = [
    { rank: 1, name: "Photo Upload Stability", score: 12.5, bv: 10, tc: 9, rr: 8 },
    { rank: 2, name: "Performance Optimization", score: 8.8, bv: 9, tc: 8, rr: 6 },
    { rank: 3, name: "UI Navigation Fix", score: 7.3, bv: 7, tc: 6, rr: 3 },
  ];

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={item.rank}
          className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/5"
          style={{ animation: `rank-slide 0.5s ${i * 0.15}s ease both` }}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-yellow-500/20 flex items-center justify-center">
            <span className="text-sm font-bold text-orange-400">#{item.rank}</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-white">{item.name}</div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-slate-600">BV:{item.bv}</span>
              <span className="text-[10px] text-slate-600">TC:{item.tc}</span>
              <span className="text-[10px] text-slate-600">RR:{item.rr}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-white">{item.score}</span>
            <span className="text-[10px] text-slate-600 block">WSJF</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* --- STEP 8: Epic Generation --- */
function Step8Epics() {
  const stories = [
    { id: "US-001", title: "Implement chunked upload", points: 5 },
    { id: "US-002", title: "Add retry mechanism", points: 3 },
    { id: "US-003", title: "Build progress indicator", points: 3 },
    { id: "US-004", title: "Error handling for file types", points: 2 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
        <Blocks className="w-5 h-5 text-purple-400" />
        <div>
          <span className="text-sm font-semibold text-white">Epic: Photo Upload Stability</span>
          <span className="text-xs text-slate-500 ml-2">4 stories · 13 points</span>
        </div>
      </div>
      {stories.map((s, i) => (
        <div
          key={s.id}
          className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5"
          style={{ animation: `rank-slide 0.5s ${0.2 + i * 0.12}s ease both` }}
        >
          <span className="text-[10px] font-mono text-slate-600 w-14">{s.id}</span>
          <span className="text-sm text-slate-300 flex-1">{s.title}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-bold">
            {s.points} pts
          </span>
        </div>
      ))}
    </div>
  );
}

/* --- STEP 9: Blockchain --- */
function Step9Blockchain() {
  const records = [
    { event: "BRD Generated", hash: "0xabc123...345678" },
    { event: "BRD Approved", hash: "0xdef456...789012" },
    { event: "Epic Created", hash: "0x456789...901234" },
  ];

  return (
    <div className="space-y-3">
      {records.map((r, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-teal-500/10"
          style={{ animation: `rank-slide 0.5s ${i * 0.2}s ease both` }}
        >
          <div className="w-10 h-10 rounded-lg bg-teal-500/15 flex items-center justify-center" style={{ animation: "chain-pulse 2s infinite", animationDelay: `${i * 0.3}s` }}>
            <Shield className="w-5 h-5 text-teal-400" />
          </div>
          <div className="flex-1">
            <span className="text-sm font-semibold text-white">{r.event}</span>
            <div className="flex items-center gap-1 mt-0.5">
              <Hash className="w-3 h-3 text-slate-600" />
              <span className="text-xs font-mono text-teal-400">{r.hash}</span>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-600" />
        </div>
      ))}
      <div className="text-center pt-1">
        <span className="text-xs font-mono text-slate-600">Polygon Amoy Testnet · 3 TX confirmed</span>
      </div>
    </div>
  );
}

/* --- STEP 10: Final Report --- */
function Step10Final() {
  return (
    <div className="space-y-4">
      {/* Top issue */}
      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/15 text-center" style={{ animation: "step-enter 0.5s ease both" }}>
        <span className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">Top Issue Detected</span>
        <h3 className="text-lg font-bold text-white mt-1">Photo Upload Failure</h3>
        <span className="text-sm text-slate-500">127 mentions across 3 sources</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "BRDs Generated", value: "2", color: "text-yellow-400" },
          { label: "Epics Created", value: "1", color: "text-purple-400" },
          { label: "Blockchain TX", value: "3", color: "text-teal-400" },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center"
            style={{ animation: `step-enter 0.5s ${0.2 + i * 0.1}s ease both` }}
          >
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Links */}
      <div className="flex items-center justify-center gap-3 pt-2" style={{ animation: "step-enter 0.5s 0.5s ease both" }}>
        <Link href="/brds" className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 no-underline transition-colors">
          <FileText className="w-4 h-4" /> View BRDs <ArrowRight className="w-3 h-3" />
        </Link>
        <span className="text-slate-700">·</span>
        <Link href="/epics" className="inline-flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 no-underline transition-colors">
          <Blocks className="w-4 h-4" /> View Epics <ArrowRight className="w-3 h-3" />
        </Link>
        <span className="text-slate-700">·</span>
        <Link href="/audit" className="inline-flex items-center gap-1.5 text-sm text-teal-400 hover:text-teal-300 no-underline transition-colors">
          <Shield className="w-4 h-4" /> Audit Trail <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
