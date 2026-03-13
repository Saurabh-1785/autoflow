"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { mockEpics } from "@/lib/mock-data";
import {
  ArrowLeft,
  Blocks,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Hash,
  Shield,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { getStatusColor, formatStatus, truncateHash, timeAgo } from "@/lib/utils";

export default function EpicDetailPage() {
  const params = useParams();
  const epic = mockEpics.find((e) => e.id === params.id);

  if (!epic) {
    return (
      <div className="max-w-7xl mx-auto animate-fade-in">
        <div className="glass-card p-12 text-center">
          <p className="text-slate-500">Epic not found</p>
          <Link href="/epics" className="text-blue-400 text-sm mt-2 inline-block">
            ← Back to Epics
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Back */}
      <Link
        href="/epics"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-purple-400 transition-colors no-underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Epics
      </Link>

      {/* Epic Header */}
      <div className="glass-card p-6 glow-purple">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg text-sm font-mono font-bold bg-purple-500/20 text-purple-400 border border-purple-500/20">
              {epic.epicRef}
            </span>
            <h1 className="text-xl font-bold text-white">{epic.title}</h1>
          </div>
          <span className={`badge ${getStatusColor(epic.status)}`}>
            {formatStatus(epic.status)}
          </span>
        </div>

        <p className="text-sm text-slate-400 mb-4">{epic.description}</p>

        <div className="grid grid-cols-4 gap-3">
          <StatBlock label="User Stories" value={epic.userStories.length.toString()} icon={<BookOpen className="w-4 h-4 text-blue-400" />} />
          <StatBlock label="Total Points" value={epic.totalPoints.toString()} icon={<Hash className="w-4 h-4 text-purple-400" />} />
          <StatBlock label="Created" value={timeAgo(epic.createdAt)} icon={<Blocks className="w-4 h-4 text-cyan-400" />} />
          <StatBlock
            label="Blockchain"
            value={epic.blockchainTxHash ? "On-chain ✓" : "Pending"}
            icon={<Shield className="w-4 h-4 text-emerald-400" />}
          />
        </div>
      </div>

      {/* User Stories */}
      <div className="space-y-3 stagger-children">
        {epic.userStories.map((story) => (
          <UserStoryCard key={story.id} story={story} />
        ))}
      </div>

      {/* Blockchain Info */}
      {epic.blockchainTxHash && (
        <div className="glass-card p-4 flex items-center gap-3">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-slate-500">Blockchain TX:</span>
          <code className="text-xs text-cyan-400 font-mono">
            {truncateHash(epic.blockchainTxHash, 12)}
          </code>
          <a
            href={`https://mumbai.polygonscan.com/tx/${epic.blockchainTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 flex items-center gap-1 hover:underline ml-auto"
          >
            View on Polygonscan
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}

function StatBlock({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-3 rounded-lg bg-white/3 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-base font-bold text-white">{value}</p>
      <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
        {label}
      </p>
    </div>
  );
}

function UserStoryCard({
  story,
}: {
  story: (typeof mockEpics)[0]["userStories"][0];
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 text-left hover:bg-white/2 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400">
                {story.storyRef}
              </span>
              <h4 className="text-sm font-semibold text-white">
                {story.title}
              </h4>
              {story.needsClarification && (
                <span className="badge bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Needs Clarification
                </span>
              )}
              <span className={`badge ${story.priority === "high" ? "bg-red-500/20 text-red-400 border-red-500/30" : story.priority === "medium" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-slate-500/20 text-slate-400 border-slate-500/30"} text-[10px]`}>
                {story.priority}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400">
                {story.storyPoints} pts
              </span>
            </div>
            <p className="text-sm text-slate-400 italic">
              &ldquo;{story.storyText}&rdquo;
            </p>
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 animate-fade-in">
          {/* Acceptance Criteria */}
          <div>
            <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Acceptance Criteria (Gherkin)
            </h5>
            <div className="space-y-2">
              {story.acceptanceCriteria.map((ac, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10"
                >
                  <p className="text-sm text-slate-300 font-mono text-xs leading-relaxed">
                    {ac}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Definition of Done */}
          <div>
            <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Definition of Done
            </h5>
            <div className="space-y-1">
              {story.definitionOfDone.map((dod, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-slate-400"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/60 flex-shrink-0" />
                  {dod}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
