"use client";

import { useEffect, useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import Link from "next/link";
import Image from "next/image";
import {
  Zap,
  ArrowRight,
  MessageSquareText,
  Brain,
  FileText,
  UserCheck,
  ArrowUpDown,
  Blocks,
  Shield,
  Truck,
  ChevronDown,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";

/* -------------------------------------------------------
   Scroll-animated wrapper
   ------------------------------------------------------- */
function ScrollSection({
  children,
  animation = "scroll-fade-up",
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  animation?: string;
  className?: string;
  delay?: number;
}) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.12 });

  return (
    <div
      ref={ref}
      className={`scroll-hidden ${animation} ${isVisible ? "scroll-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------
   Pipeline stages data
   ------------------------------------------------------- */
const pipelineSteps = [
  { icon: MessageSquareText, label: "Ingest Feedback", desc: "Reddit · Twitter · App Store · Google Play", color: "#2563eb" },
  { icon: Brain, label: "AI Clustering", desc: "BERTopic NLP + Sentiment Analysis", color: "#7c3aed" },
  { icon: FileText, label: "BRD Generation", desc: "Claude AI writes Business Requirement Docs", color: "#0891b2" },
  { icon: UserCheck, label: "Human Review", desc: "HITL Gate #1 — Approve, Edit, or Reject", color: "#059669" },
  { icon: ArrowUpDown, label: "Priority Ranking", desc: "WSJF scoring + Human reordering", color: "#d97706" },
  { icon: Blocks, label: "Epic Generation", desc: "User stories with Gherkin acceptance criteria", color: "#db2777" },
  { icon: Shield, label: "Blockchain Audit", desc: "Immutable hash on Polygon + IPFS storage", color: "#0d9488" },
  { icon: Truck, label: "SA Delivery", desc: "Engineering-ready Epics delivered to Jira", color: "#ea580c" },
];

const techStack = [
  { name: "Next.js", category: "Frontend" },
  { name: "TypeScript", category: "Language" },
  { name: "Tailwind CSS", category: "Styling" },
  { name: "Claude AI", category: "AI Engine" },
  { name: "n8n", category: "Orchestration" },
  { name: "PostgreSQL", category: "Database" },
  { name: "Polygon", category: "Blockchain" },
  { name: "IPFS / Pinata", category: "Storage" },
  { name: "BERTopic", category: "NLP" },
  { name: "Redis", category: "Cache" },
  { name: "Docker", category: "DevOps" },
  { name: "Solidity", category: "Smart Contracts" },
];

/* =======================================================
   LANDING PAGE
   ======================================================= */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Theme class on root */
  const t = dark ? "dark" : "light";

  return (
    <div
      className={`min-h-screen overflow-x-hidden transition-colors duration-300 ${
        dark ? "bg-[#0a0e1a] text-slate-200" : "bg-white text-slate-800"
      }`}
    >
      {/* ===== FIXED NAVBAR ===== */}
      <nav
        className={`fixed top-0 left-0 right-0 z-100 px-6 md:px-12 py-3.5 flex items-center justify-between transition-all duration-300 ${
          scrolled
            ? dark
              ? "bg-[#0a0e1a]/95 shadow-lg shadow-black/20 border-b border-white/5"
              : "bg-white/95 shadow-md shadow-black/5 border-b border-slate-200"
            : dark
              ? "bg-transparent"
              : "bg-transparent"
        }`}
        style={{ backdropFilter: scrolled ? "blur(16px)" : "none" }}
      >
        <div />
        <div className="flex items-center gap-2 md:gap-4">
          <a
            href="#features"
            className={`text-sm font-medium px-3 py-1.5 no-underline transition-colors ${
              dark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Features
          </a>
          <a
            href="#pipeline"
            className={`text-sm font-medium px-3 py-1.5 no-underline transition-colors ${
              dark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Pipeline
          </a>
          <a
            href="#tech"
            className={`text-sm font-medium px-3 py-1.5 no-underline transition-colors ${
              dark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tech Stack
          </a>

          {/* Theme Toggle */}
          <button
            onClick={() => setDark(!dark)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
              dark
                ? "bg-white/10 border-white/10 hover:bg-white/20 text-yellow-400"
                : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-600"
            }`}
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <Link
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg no-underline inline-flex items-center gap-2 transition-colors"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-28 pb-20 px-6 overflow-hidden">
        {/* Subtle gradient bg */}
        {!dark && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 pointer-events-none" />
        )}
        {dark && (
          <>
            <div className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/8 blur-[120px] hero-gradient-orb pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/8 blur-[100px] hero-gradient-orb pointer-events-none" style={{ animationDelay: "3s" }} />
          </>
        )}

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Brand Title */}
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-4 animate-fade-in">
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              AutoFlow
            </span>
          </h1>

          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-fade-in ${
              dark
                ? "bg-blue-500/10 border border-blue-500/20"
                : "bg-blue-50 border border-blue-200"
            }`}
            style={{ animationDelay: "0.1s" }}
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-600 font-semibold">
              AI-Powered HITL Pipeline
            </span>
          </div>

          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.15] tracking-tight mb-6 animate-fade-in ${
              dark ? "text-white" : "text-slate-900"
            }`}
            style={{ animationDelay: "0.2s" }}
          >
            From Customer Feedback<br />
            to Engineering Epics —{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              in 48 Hours
            </span>
          </h2>

          <p
            className={`text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-fade-in leading-relaxed ${
              dark ? "text-slate-400" : "text-slate-500"
            }`}
            style={{ animationDelay: "0.3s" }}
          >
            AutoFlow Intelligence automates the journey from raw user feedback to
            architect-ready Engineering Epics with a transparent, blockchain-audited
            Human-in-the-Loop AI pipeline.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold px-8 py-3.5 rounded-lg no-underline inline-flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/25"
            >
              Open Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#pipeline"
              className={`text-base font-semibold px-8 py-3.5 rounded-lg no-underline inline-flex items-center gap-2 transition-all border ${
                dark
                  ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
              }`}
            >
              See How It Works
              <ChevronDown className="w-5 h-5" />
            </a>
          </div>

          {/* Hero Image */}
          <div className="mt-16 relative animate-fade-in" style={{ animationDelay: "0.55s" }}>
            <div
              className={`relative rounded-2xl overflow-hidden shadow-2xl ${
                dark
                  ? "border border-white/8 shadow-blue-500/10"
                  : "border border-slate-200 shadow-slate-300/50"
              }`}
            >
              <Image
                src="/images/hero-dashboard.png"
                alt="AutoFlow Dashboard"
                width={1200}
                height={700}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROBLEM SECTION ===== */}
      <section
        className={`py-24 px-6 border-t ${
          dark ? "border-white/5" : "border-slate-100"
        }`}
      >
        <div className="max-w-5xl mx-auto">
          <ScrollSection animation="scroll-fade-up">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-4 block">
                The Problem
              </span>
              <h2
                className={`text-3xl md:text-4xl font-bold mb-4 ${
                  dark ? "text-white" : "text-slate-900"
                }`}
              >
                Product teams waste{" "}
                <span className="text-amber-500">4–7 weeks</span> translating
                feedback into features
              </h2>
              <p className={`text-lg max-w-2xl mx-auto ${dark ? "text-slate-500" : "text-slate-500"}`}>
                Manual processes create bottlenecks. Feedback gets lost. Requirements
                are inconsistent. And there&apos;s no audit trail.
              </p>
            </div>
          </ScrollSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Clock className="w-6 h-6 text-red-500" />, stat: "4–7 weeks", label: "Average feedback-to-feature cycle", desc: "Manual clustering, writing requirements, and prioritization burns weeks of PM time." },
              { icon: <AlertTriangle className="w-6 h-6 text-amber-500" />, stat: "60%", label: "Of feedback is never acted on", desc: "Critical user signals get buried in spreadsheets and Slack channels, never reaching engineering." },
              { icon: <TrendingUp className="w-6 h-6 text-blue-500" />, stat: "0%", label: "Audit trail transparency", desc: "No record of why requirements were prioritized, how decisions were made, or what changed." },
            ].map((card, i) => (
              <ScrollSection key={card.stat} animation="scroll-fade-up" delay={i * 150}>
                <div
                  className={`p-6 rounded-2xl text-center h-full transition-all ${
                    dark
                      ? "bg-white/[0.03] border border-white/6 hover:border-white/12"
                      : "bg-white border border-slate-200 shadow-sm hover:shadow-md"
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                      dark ? "bg-white/5" : "bg-slate-50"
                    }`}
                  >
                    {card.icon}
                  </div>
                  <p className={`text-3xl font-extrabold mb-1 ${dark ? "text-white" : "text-slate-900"}`}>
                    {card.stat}
                  </p>
                  <p className={`text-sm font-semibold mb-2 ${dark ? "text-slate-300" : "text-slate-700"}`}>
                    {card.label}
                  </p>
                  <p className={`text-sm leading-relaxed ${dark ? "text-slate-500" : "text-slate-500"}`}>
                    {card.desc}
                  </p>
                </div>
              </ScrollSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PIPELINE SECTION ===== */}
      <section
        id="pipeline"
        className={`py-24 px-6 border-t ${
          dark
            ? "border-white/5 bg-gradient-to-b from-transparent via-blue-500/[0.02] to-transparent"
            : "border-slate-100 bg-gradient-to-b from-slate-50 via-blue-50/30 to-white"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <ScrollSection animation="scroll-fade-up">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-4 block">
                How It Works
              </span>
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${dark ? "text-white" : "text-slate-900"}`}>
                An 8-stage intelligent pipeline
              </h2>
              <p className={`text-lg max-w-2xl mx-auto ${dark ? "text-slate-500" : "text-slate-500"}`}>
                Every step is automated where possible, and human-reviewed where it
                matters. Every decision is logged to the blockchain.
              </p>
            </div>
          </ScrollSection>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pipelineSteps.map((step, i) => (
              <ScrollSection key={step.label} animation="scroll-fade-up" delay={i * 80}>
                <div
                  className={`p-5 rounded-xl text-center group hover:scale-[1.03] transition-all border ${
                    dark
                      ? "bg-white/[0.03] border-white/6 hover:border-white/15"
                      : "bg-white border-slate-200 shadow-sm hover:shadow-md"
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: step.color + "15", color: step.color }}
                  >
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div className={`text-[10px] font-bold mb-1 ${dark ? "text-slate-600" : "text-slate-400"}`}>
                    STEP {i + 1}
                  </div>
                  <h4 className={`text-sm font-bold mb-1 ${dark ? "text-white" : "text-slate-900"}`}>
                    {step.label}
                  </h4>
                  <p className={`text-xs leading-relaxed ${dark ? "text-slate-500" : "text-slate-500"}`}>
                    {step.desc}
                  </p>
                </div>
              </ScrollSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section
        id="features"
        className={`py-24 px-6 border-t ${dark ? "border-white/5" : "border-slate-100"}`}
      >
        <div className="max-w-6xl mx-auto">
          <ScrollSection animation="scroll-fade-up">
            <div className="text-center mb-20">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600 mb-4 block">
                Key Features
              </span>
              <h2 className={`text-3xl md:text-4xl font-bold ${dark ? "text-white" : "text-slate-900"}`}>
                Human-in-the-Loop, powered by AI
              </h2>
            </div>
          </ScrollSection>

          {/* Feature 1 — Image Right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-28">
            <ScrollSection animation="scroll-slide-left">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-4">
                  <UserCheck className="w-3.5 h-3.5" /> HITL Gate #1
                </span>
                <h3 className={`text-2xl md:text-3xl font-bold mb-4 ${dark ? "text-white" : "text-slate-900"}`}>
                  AI-Generated BRDs with Human Review
                </h3>
                <p className={`text-base leading-relaxed mb-6 ${dark ? "text-slate-400" : "text-slate-500"}`}>
                  Claude AI analyzes clustered feedback and writes comprehensive Business
                  Requirements Documents — complete with problem statements, success metrics,
                  WSJF scoring, and source evidence. A built-in Critic Agent QA-checks every
                  BRD before it reaches you.
                </p>
                <ul className="space-y-3">
                  <FeaturePoint dark={dark} text="92% average AI confidence score" />
                  <FeaturePoint dark={dark} text="One-click approve, reject, or edit workflow" />
                  <FeaturePoint dark={dark} text="Source evidence with real customer quotes" />
                  <FeaturePoint dark={dark} text="Critic Agent QA catches issues before you do" />
                </ul>
              </div>
            </ScrollSection>
            <ScrollSection animation="scroll-slide-right">
              <FeatureImage dark={dark} src="/images/feature-brd-review.png" alt="BRD Review Interface" />
            </ScrollSection>
          </div>

          {/* Feature 2 — Image Left */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-28">
            <ScrollSection animation="scroll-slide-left" className="md:order-1">
              <FeatureImage dark={dark} src="/images/feature-priority.png" alt="Priority Management" />
            </ScrollSection>
            <ScrollSection animation="scroll-slide-right" className="md:order-2">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-600 text-xs font-bold uppercase tracking-wider mb-4">
                  <ArrowUpDown className="w-3.5 h-3.5" /> HITL Gate #2
                </span>
                <h3 className={`text-2xl md:text-3xl font-bold mb-4 ${dark ? "text-white" : "text-slate-900"}`}>
                  Smart Priority with WSJF Scoring
                </h3>
                <p className={`text-base leading-relaxed mb-6 ${dark ? "text-slate-400" : "text-slate-500"}`}>
                  AI ranks requirements using Weighted Shortest Job First (WSJF) — balancing
                  Business Value, Time Criticality, Risk Reduction, and Effort. You can
                  reorder, lock items, and select the top-N for Epic generation.
                </p>
                <ul className="space-y-3">
                  <FeaturePoint dark={dark} text="WSJF scoring with 4-axis breakdown" />
                  <FeaturePoint dark={dark} text="Drag-and-drop manual reordering" />
                  <FeaturePoint dark={dark} text="Lock/unlock items to prevent AI re-ranking" />
                  <FeaturePoint dark={dark} text="Top-N selection for batch Epic generation" />
                </ul>
              </div>
            </ScrollSection>
          </div>

          {/* Feature 3 — Image Right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <ScrollSection animation="scroll-slide-left">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-600 text-xs font-bold uppercase tracking-wider mb-4">
                  <Shield className="w-3.5 h-3.5" /> Blockchain Audit
                </span>
                <h3 className={`text-2xl md:text-3xl font-bold mb-4 ${dark ? "text-white" : "text-slate-900"}`}>
                  Tamper-Proof Decision Audit Trail
                </h3>
                <p className={`text-base leading-relaxed mb-6 ${dark ? "text-slate-400" : "text-slate-500"}`}>
                  Every BRD generation, approval, edit, and delivery is hashed and logged to
                  Polygon blockchain. Full documents are stored on IPFS. Anyone can verify
                  that nothing was tampered with — ever.
                </p>
                <ul className="space-y-3">
                  <FeaturePoint dark={dark} text="Immutable records on Polygon testnet" />
                  <FeaturePoint dark={dark} text="Full document storage on IPFS via Pinata" />
                  <FeaturePoint dark={dark} text="One-click verify — re-hash and compare on-chain" />
                  <FeaturePoint dark={dark} text="TX hash links to Polygonscan explorer" />
                </ul>
              </div>
            </ScrollSection>
            <ScrollSection animation="scroll-slide-right">
              <FeatureImage dark={dark} src="/images/feature-audit.png" alt="Blockchain Audit Trail" />
            </ScrollSection>
          </div>
        </div>
      </section>

      {/* ===== TECH STACK ===== */}
      <section
        id="tech"
        className={`py-24 px-6 border-t ${
          dark
            ? "border-white/5 bg-gradient-to-b from-transparent via-purple-500/[0.02] to-transparent"
            : "border-slate-100 bg-gradient-to-b from-slate-50 via-purple-50/20 to-white"
        }`}
      >
        <div className="max-w-5xl mx-auto">
          <ScrollSection animation="scroll-fade-up">
            <div className="text-center mb-12">
              <span className={`text-xs font-bold uppercase tracking-[0.2em] mb-4 block ${dark ? "text-slate-500" : "text-slate-400"}`}>
                Built With
              </span>
              <h2 className={`text-3xl md:text-4xl font-bold ${dark ? "text-white" : "text-slate-900"}`}>
                Modern, Production-Grade Stack
              </h2>
            </div>
          </ScrollSection>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {techStack.map((tech, i) => (
              <ScrollSection key={tech.name} animation="scroll-scale-up" delay={i * 60}>
                <div
                  className={`p-4 rounded-xl text-center transition-all group border ${
                    dark
                      ? "bg-white/[0.03] border-white/6 hover:border-white/15 hover:bg-white/[0.06]"
                      : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md"
                  }`}
                >
                  <p className={`text-sm font-bold group-hover:text-blue-600 transition-colors ${dark ? "text-white" : "text-slate-800"}`}>
                    {tech.name}
                  </p>
                  <p className={`text-[10px] uppercase tracking-wider mt-1 ${dark ? "text-slate-600" : "text-slate-400"}`}>
                    {tech.category}
                  </p>
                </div>
              </ScrollSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA FOOTER ===== */}
      <section
        className={`py-24 px-6 border-t ${dark ? "border-white/5" : "border-slate-100"}`}
      >
        <ScrollSection animation="scroll-fade-up">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${dark ? "text-white" : "text-slate-900"}`}>
              Ready to transform your workflow?
            </h2>
            <p className={`text-lg mb-10 ${dark ? "text-slate-500" : "text-slate-500"}`}>
              Stop wasting weeks on manual requirement gathering. Let AI handle the
              heavy lifting while you focus on decisions that matter.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold px-10 py-4 rounded-lg no-underline inline-flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/25"
              >
                Open Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </ScrollSection>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className={`py-8 px-6 border-t ${dark ? "border-white/5" : "border-slate-100"}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className={`text-sm font-medium ${dark ? "text-slate-600" : "text-slate-400"}`}>
              AutoFlow Intelligence
            </span>
          </div>
          <p className={`text-xs ${dark ? "text-slate-700" : "text-slate-400"}`}>
            AI-Powered HITL Pipeline · Blockchain Audited · © 2026
          </p>
        </div>
      </footer>
    </div>
  );
}

/* -------------------------------------------------------
   Sub-components
   ------------------------------------------------------- */
function FeatureImage({ dark, src, alt }: { dark: boolean; src: string; alt: string }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden transition-all ${
        dark
          ? "border border-white/8 shadow-xl shadow-blue-500/5"
          : "border border-slate-200 shadow-lg shadow-slate-200/60"
      }`}
    >
      <Image src={src} alt={alt} width={700} height={480} className="w-full h-auto" />
    </div>
  );
}

function FeaturePoint({ text, dark }: { text: string; dark: boolean }) {
  return (
    <li className={`flex items-start gap-3 text-sm ${dark ? "text-slate-300" : "text-slate-600"}`}>
      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
      {text}
    </li>
  );
}
