"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { hasPipelineRunInSession } from "@/lib/pipeline-session";
import type { Brd } from "@/lib/types";
import {
  formatStatus,
  getStatusColor,
  getConfidenceBg,
  getConfidenceColor,
  timeAgo,
} from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Pencil,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Quote,
  Target,
  BarChart3,
  Ban,
  Lightbulb,
  Users,
  FileText,
  MessageSquare,
} from "lucide-react";

export default function BrdDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [brd, setBrd] = useState<Brd | null>(null);
  const [loading, setLoading] = useState(true);
  const [pipelineReady, setPipelineReady] = useState(false);
  
  const [showEvidence, setShowEvidence] = useState(false);
  const [showCritic, setShowCritic] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [priorityHint, setPriorityHint] = useState("medium");
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    const ready = hasPipelineRunInSession();
    setPipelineReady(ready);

    if (!ready) {
      setLoading(false);
      return;
    }

    async function fetchBrd() {
      try {
        const res = await api.getBrd(id);
        if (res.brd) {
          const row = res.brd;
          const mapped: Brd = {
            id: row.id,
            clusterId: row.cluster_id,
            title: row.title,
            problemStatement: row.problem_statement,
            targetAudience: row.target_audience,
            businessValue: row.business_value,
            proposedSolution: row.proposed_solution,
            successMetrics: row.success_metrics || [],
            outOfScope: row.out_of_scope || [],
            sourceEvidence: row.source_evidence || [],
            wsjf: row.wsjf || { businessValue: 0, timeCriticality: 0, riskReduction: 0, effort: 0 },
            wsjfFinalScore: parseFloat(row.wsjf_final_score) || 0,
            confidenceScore: parseFloat(row.confidence_score) || 0,
            confidenceReason: row.confidence_reason,
            criticScore: row.critic_score !== null ? parseFloat(row.critic_score) : null,
            criticIssues: row.critic_issues || [],
            status: row.status,
            reviewerEmail: row.reviewer_email,
            reviewedAt: row.reviewed_at,
            blockchainTxHash: null,
            ipfsCid: null,
            createdAt: row.created_at,
          };
          setBrd(mapped);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchBrd();
  }, [id]);

  if (!pipelineReady && !loading) {
    return (
      <div className="max-w-7xl mx-auto animate-fade-in">
        <div className="glass-card p-12 text-center">
          <p className="text-slate-500">Run pipeline first from Dashboard to access BRD details.</p>
          <Link href="/dashboard" className="text-blue-400 text-sm mt-2 inline-block">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleApprove = async () => {
    try {
      await api.approveBrd(id);
      alert("BRD Approved and sent to n8n pipeline!");
      router.push('/brds');
    } catch (err) {
      console.error(err);
      alert("Failed to approve BRD.");
    }
  };

  const handleReject = async () => {
    if (!rejectReason) return alert("Please provide a reason.");
    try {
      await api.rejectBrd(id, rejectReason);
      alert("BRD Rejected.");
      router.push('/brds');
    } catch (err) {
      console.error(err);
      alert("Failed to reject BRD.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto animate-fade-in">
        <div className="glass-card p-12 text-center">
          <p className="text-slate-500">Loading BRD details...</p>
        </div>
      </div>
    );
  }

  if (!brd) {
    return (
      <div className="max-w-7xl mx-auto animate-fade-in">
        <div className="glass-card p-12 text-center">
          <p className="text-slate-500">BRD not found</p>
          <Link href="/brds" className="text-blue-400 text-sm mt-2 inline-block">
            ← Back to BRD Queue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Back Link */}
      <Link
        href="/brds"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-400 transition-colors no-underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to BRD Queue
      </Link>

      <div className="grid grid-cols-5 gap-6">
        {/* ========= LEFT PANEL (60%) ========= */}
        <div className="col-span-3 space-y-4">
          {/* Title + Status Bar */}
          <div className="glass-card p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-xl font-bold text-white">{brd.title}</h1>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`badge ${getStatusColor(brd.status)}`}>
                  {formatStatus(brd.status)}
                </span>
                <span className={`badge ${getConfidenceBg(brd.confidenceScore)}`}>
                  {(brd.confidenceScore * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Confidence Reason */}
            <div className="p-3 rounded-lg bg-white/3 border border-white/5 mb-4">
              <p className="text-xs text-slate-500 font-medium mb-1">
                AI Confidence Reasoning
              </p>
              <p className="text-sm text-slate-400">{brd.confidenceReason}</p>
            </div>

            {/* Core Stats */}
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-3 rounded-lg bg-white/3">
                <p className="text-lg font-bold text-white">
                  {brd.wsjfFinalScore.toFixed(1)}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">
                  WSJF Score
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/3">
                <p className="text-lg font-bold text-blue-400">
                  {brd.wsjf.businessValue}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">
                  Biz Value
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/3">
                <p className="text-lg font-bold text-amber-400">
                  {brd.wsjf.timeCriticality}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">
                  Time Crit.
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/3">
                <p className="text-lg font-bold text-purple-400">
                  {brd.wsjf.effort}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">
                  Effort
                </p>
              </div>
            </div>
          </div>

          {/* Problem Statement */}
          <SectionCard
            icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
            title="Problem Statement"
          >
            <p className="text-sm text-slate-300 leading-relaxed">
              {brd.problemStatement}
            </p>
          </SectionCard>

          {/* Target Audience */}
          <SectionCard
            icon={<Users className="w-4 h-4 text-blue-400" />}
            title="Target Audience"
          >
            <p className="text-sm text-slate-300">{brd.targetAudience}</p>
          </SectionCard>

          {/* Business Value */}
          <SectionCard
            icon={<BarChart3 className="w-4 h-4 text-emerald-400" />}
            title="Business Value"
          >
            <p className="text-sm text-slate-300 leading-relaxed">
              {brd.businessValue}
            </p>
          </SectionCard>

          {/* Proposed Solution */}
          <SectionCard
            icon={<Lightbulb className="w-4 h-4 text-yellow-400" />}
            title="Proposed Solution Hint"
          >
            <p className="text-sm text-slate-300">{brd.proposedSolution}</p>
          </SectionCard>

          {/* Success Metrics */}
          <SectionCard
            icon={<Target className="w-4 h-4 text-cyan-400" />}
            title="Success Metrics"
          >
            <ul className="space-y-2">
              {brd.successMetrics.map((m, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-slate-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  {m}
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* Out of Scope */}
          <SectionCard
            icon={<Ban className="w-4 h-4 text-red-400" />}
            title="Out of Scope"
          >
            <ul className="space-y-2">
              {brd.outOfScope.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-slate-400"
                >
                  <XCircle className="w-3.5 h-3.5 text-red-400/60 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* Source Evidence (Expandable) */}
          <div className="glass-card overflow-hidden">
            <button
              onClick={() => setShowEvidence(!showEvidence)}
              className="w-full flex items-center justify-between p-5 hover:bg-white/2 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Quote className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-white">
                  Source Evidence ({brd.sourceEvidence.length} quotes)
                </span>
              </div>
              {showEvidence ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>
            {showEvidence && (
              <div className="px-5 pb-5 space-y-3 animate-fade-in">
                {brd.sourceEvidence.map((quote, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10"
                  >
                    <p className="text-sm text-slate-300 italic">
                      &ldquo;{quote}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Critic Agent Findings (Expandable) */}
          {brd.criticScore !== null && (
            <div className="glass-card overflow-hidden">
              <button
                onClick={() => setShowCritic(!showCritic)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/2 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-semibold text-white">
                    Critic Agent QA — Score:{" "}
                    {(brd.criticScore * 100).toFixed(0)}%
                  </span>
                </div>
                {showCritic ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>
              {showCritic && (
                <div className="px-5 pb-5 animate-fade-in">
                  {brd.criticIssues.length === 0 ? (
                    <p className="text-sm text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      No issues found — BRD passes QA review
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {brd.criticIssues.map((issue, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-lg border ${
                            issue.severity === "blocker"
                              ? "bg-red-500/5 border-red-500/20"
                              : issue.severity === "warning"
                              ? "bg-amber-500/5 border-amber-500/20"
                              : "bg-blue-500/5 border-blue-500/20"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider ${
                                issue.severity === "blocker"
                                  ? "text-red-400"
                                  : issue.severity === "warning"
                                  ? "text-amber-400"
                                  : "text-blue-400"
                              }`}
                            >
                              {issue.severity}
                            </span>
                            <span className="text-xs text-slate-500">
                              [{issue.criterion}] → {issue.field}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300">
                            {issue.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* ========= RIGHT PANEL (40%) ========= */}
        <div className="col-span-2 space-y-4">
          {/* Actions Card */}
          {brd.status === "pending_review" || brd.status === "hitl_queue" ? (
            <div className="glass-card p-6 glow-blue sticky top-6">
              <h3 className="text-sm font-semibold text-white mb-4">
                Review Actions
              </h3>

              {/* Priority Hint */}
              <div className="mb-4">
                <label className="text-xs text-slate-500 font-medium mb-1.5 block">
                  Priority Hint (for WSJF)
                </label>
                <select
                  value={priorityHint}
                  onChange={(e) => setPriorityHint(e.target.value)}
                  className="w-full h-9 px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500/50"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              <div className="space-y-2">
                {/* Approve */}
                <button
                  className="btn-success w-full"
                  id="approve-brd-btn"
                  onClick={handleApprove}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve BRD
                </button>

                {/* Approve with Edits */}
                <button
                  className="btn-primary w-full"
                  id="approve-edit-btn"
                  onClick={() =>
                    alert("Edit mode would open here. (Demo)")
                  }
                >
                  <Pencil className="w-4 h-4" />
                  Approve with Edits
                </button>

                {/* Reject */}
                <button
                  className="btn-danger w-full"
                  id="reject-brd-btn"
                  onClick={() => setShowRejectModal(!showRejectModal)}
                >
                  <XCircle className="w-4 h-4" />
                  Reject BRD
                </button>

                {showRejectModal && (
                  <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 animate-scale-in">
                    <textarea
                      placeholder="Reason for rejection..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full h-20 p-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 resize-none"
                    />
                    <button
                      className="btn-danger w-full mt-2 text-xs"
                      onClick={handleReject}
                    >
                      Confirm Rejection
                    </button>
                  </div>
                )}

                {/* Request More Data */}
                <button className="btn-secondary w-full text-sm">
                  <FileText className="w-4 h-4" />
                  Request More Data
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-white mb-3">
                Review Complete
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className={`badge ${getStatusColor(brd.status)}`}>
                    {formatStatus(brd.status)}
                  </span>
                </div>
                {brd.reviewerEmail && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reviewed by</span>
                    <span className="text-slate-300">{brd.reviewerEmail}</span>
                  </div>
                )}
                {brd.reviewedAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reviewed</span>
                    <span className="text-slate-300">
                      {timeAgo(brd.reviewedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WSJF Breakdown */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-white mb-4">
              WSJF Score Breakdown
            </h3>
            <div className="space-y-3">
              <WsjfBar
                label="Business Value"
                value={brd.wsjf.businessValue}
                max={10}
                color="bg-blue-500"
              />
              <WsjfBar
                label="Time Criticality"
                value={brd.wsjf.timeCriticality}
                max={10}
                color="bg-amber-500"
              />
              <WsjfBar
                label="Risk Reduction"
                value={brd.wsjf.riskReduction}
                max={10}
                color="bg-purple-500"
              />
              <WsjfBar
                label="Effort (lower = better)"
                value={brd.wsjf.effort}
                max={10}
                color="bg-red-500"
              />
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-xs text-slate-500">
                WSJF = (BV×Weight + TC + RR) / Effort
              </span>
              <span className="text-lg font-bold text-white">
                {brd.wsjfFinalScore.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Meta Info */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-white mb-3">Metadata</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">BRD ID</span>
                <code className="text-xs text-slate-400 font-mono">
                  {brd.id}
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cluster ID</span>
                <code className="text-xs text-slate-400 font-mono">
                  {brd.clusterId}
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Created</span>
                <span className="text-slate-300">{timeAgo(brd.createdAt)}</span>
              </div>
              {brd.ipfsCid && (
                <div className="flex justify-between">
                  <span className="text-slate-500">IPFS CID</span>
                  <code className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">
                    {brd.ipfsCid}
                  </code>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function WsjfBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-xs text-slate-300 font-medium">
          {value}/{max}
        </span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  );
}
