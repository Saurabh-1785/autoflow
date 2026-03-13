"use client";

import {
  MessageSquareText,
  FileText,
  Blocks,
  Shield,
  Play,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Zap,
  ArrowRight,
} from "lucide-react";
import {
  mockPipelineStatus,
  mockStats,
  mockActivities,
  mockSourceHealth,
} from "@/lib/mock-data";
import type { PipelineStage, ActivityEvent } from "@/lib/types";
import { timeAgo, formatStatus } from "@/lib/utils";
import Link from "next/link";

const pipelineStages: { key: PipelineStage; label: string }[] = [
  { key: "ingesting", label: "Ingesting" },
  { key: "cleaning", label: "Cleaning" },
  { key: "clustering", label: "Clustering" },
  { key: "generating_brds", label: "Gen. BRDs" },
  { key: "awaiting_review", label: "Review" },
  { key: "prioritizing", label: "Prioritizing" },
  { key: "writing_epics", label: "Epics" },
  { key: "delivered", label: "Delivered" },
];

function getStageStatus(
  stage: PipelineStage,
  current: PipelineStage
): "completed" | "active" | "pending" {
  const stageKeys = pipelineStages.map((s) => s.key);
  const ci = stageKeys.indexOf(current);
  const si = stageKeys.indexOf(stage);
  if (si < ci) return "completed";
  if (si === ci) return "active";
  return "pending";
}

function getActivityIcon(type: ActivityEvent["type"]) {
  switch (type) {
    case "brd_generated":
      return <FileText className="w-4 h-4 text-blue-400" />;
    case "brd_approved":
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    case "brd_rejected":
      return <XCircle className="w-4 h-4 text-red-400" />;
    case "epic_created":
      return <Blocks className="w-4 h-4 text-purple-400" />;
    case "blockchain_write":
      return <Shield className="w-4 h-4 text-cyan-400" />;
    case "pipeline_started":
      return <Play className="w-4 h-4 text-amber-400" />;
    default:
      return <Activity className="w-4 h-4 text-slate-400" />;
  }
}

export default function DashboardPage() {
  const pipeline = mockPipelineStatus;
  const stats = mockStats;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Pipeline Progress */}
      <div className="glass-card p-6 glow-blue">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Pipeline Status
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Last run: {timeAgo(pipeline.lastRunAt)}
            </p>
          </div>
          <button
            className="btn-primary"
            id="trigger-pipeline-btn"
          >
            <Play className="w-4 h-4" />
            Run Pipeline Now
          </button>
        </div>

        {/* Progress Bar */}
        <div className="pipeline-bar mb-4">
          <div
            className="pipeline-bar-fill"
            style={{ width: `${pipeline.progress}%` }}
          />
        </div>

        {/* Stage Indicators */}
        <div className="flex items-center justify-between">
          {pipelineStages.map((stage, i) => {
            const status = getStageStatus(stage.key, pipeline.currentStage);
            return (
              <div key={stage.key} className="flex items-center gap-1.5">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`stage-dot ${status}`} />
                  <span
                    className={`text-[10px] font-medium ${
                      status === "active"
                        ? "text-blue-400"
                        : status === "completed"
                        ? "text-emerald-400"
                        : "text-slate-600"
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
                {i < pipelineStages.length - 1 && (
                  <div
                    className={`w-6 h-px mx-1 mb-5 ${
                      status === "completed" || status === "active"
                        ? "bg-blue-500/40"
                        : "bg-white/5"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 stagger-children">
        <StatsCard
          icon={<MessageSquareText className="w-5 h-5" />}
          label="Feedback This Week"
          value={stats.totalFeedback}
          trend="+12%"
          trendUp={true}
          color="blue"
          href="/feedback"
        />
        <StatsCard
          icon={<FileText className="w-5 h-5" />}
          label="BRDs Awaiting Review"
          value={stats.brdsAwaitingReview}
          trend="3 new"
          trendUp={false}
          color="amber"
          href="/brds"
        />
        <StatsCard
          icon={<Blocks className="w-5 h-5" />}
          label="Epics Ready"
          value={stats.epicsReady}
          trend="+5"
          trendUp={true}
          color="purple"
          href="/epics"
        />
        <StatsCard
          icon={<Shield className="w-5 h-5" />}
          label="Blockchain Records"
          value={stats.blockchainRecords}
          trend="All verified"
          trendUp={true}
          color="cyan"
          href="/audit"
        />
      </div>

      {/* Bottom Grid: Activity + Source Health */}
      <div className="grid grid-cols-3 gap-4">
        {/* Activity Feed */}
        <div className="col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Recent Activity
            </h3>
            <span className="text-xs text-slate-600">Last 10 events</span>
          </div>

          <div className="space-y-1 stagger-children">
            {mockActivities.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-white/3 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  {getActivityIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">
                    {event.description}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {event.actor}
                  </p>
                </div>
                <span className="text-xs text-slate-600 flex-shrink-0">
                  {timeAgo(event.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Source Health */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-amber-400" />
            Data Sources
          </h3>

          <div className="space-y-3">
            {mockSourceHealth.map((source) => (
              <div
                key={source.name}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/2"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      source.status === "healthy"
                        ? "bg-emerald-400 shadow-lg shadow-emerald-500/30"
                        : source.status === "degraded"
                        ? "bg-amber-400 shadow-lg shadow-amber-500/30"
                        : "bg-red-400 shadow-lg shadow-red-500/30"
                    }`}
                  />
                  <span className="text-sm text-slate-300">{source.name}</span>
                </div>
                <span className="text-xs text-slate-600">
                  {timeAgo(source.lastPullAt)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Quick Actions
            </h4>
            <div className="space-y-2">
              <Link
                href="/brds"
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15 transition-colors text-sm text-blue-400 no-underline"
              >
                Review BRDs
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/priority"
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/15 transition-colors text-sm text-purple-400 no-underline"
              >
                Manage Priority
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  icon,
  label,
  value,
  trend,
  trendUp,
  color,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  trend: string;
  trendUp: boolean;
  color: "blue" | "amber" | "purple" | "cyan";
  href: string;
}) {
  const gradients = {
    blue: "from-blue-500/20 to-blue-600/5",
    amber: "from-amber-500/20 to-amber-600/5",
    purple: "from-purple-500/20 to-purple-600/5",
    cyan: "from-cyan-500/20 to-cyan-600/5",
  };

  const iconColors = {
    blue: "text-blue-400",
    amber: "text-amber-400",
    purple: "text-purple-400",
    cyan: "text-cyan-400",
  };

  return (
    <Link href={href} className="no-underline">
      <div
        className={`glass-card p-5 bg-gradient-to-br ${gradients[color]} cursor-pointer group`}
      >
        <div className="flex items-center justify-between mb-3">
          <div
            className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${iconColors[color]} group-hover:scale-110 transition-transform`}
          >
            {icon}
          </div>
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trendUp ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            {trend}
          </div>
        </div>
        <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
        <p className="text-xs text-slate-500 mt-1">{label}</p>
      </div>
    </Link>
  );
}
