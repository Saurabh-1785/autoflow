"use client";

import { useState } from "react";
import Link from "next/link";
import { mockBrds } from "@/lib/mock-data";
import {
  formatStatus,
  getStatusColor,
  getConfidenceBg,
  timeAgo,
} from "@/lib/utils";
import {
  FileText,
  Filter,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
} from "lucide-react";
import type { BrdStatus } from "@/lib/types";

const statusFilters: ("all" | BrdStatus)[] = [
  "all",
  "pending_review",
  "approved",
  "rejected",
  "hitl_queue",
  "needs_revision",
];

export default function BrdsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = mockBrds.filter(
    (brd) => statusFilter === "all" || brd.status === statusFilter
  );

  const pendingCount = mockBrds.filter((b) => b.status === "pending_review").length;
  const hitlCount = mockBrds.filter((b) => b.status === "hitl_queue").length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header with counts */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            BRD Review Queue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {pendingCount} pending review · {hitlCount} in HITL queue
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-4 h-4 text-slate-500" />
          <div className="flex gap-1">
            {statusFilters.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === s
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                }`}
              >
                {s === "all" ? "All" : formatStatus(s)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BRD List */}
      <div className="space-y-3 stagger-children">
        {filtered.map((brd) => (
          <Link
            key={brd.id}
            href={`/brds/${brd.id}`}
            className="no-underline block"
          >
            <div className="glass-card p-5 group cursor-pointer">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                      {brd.title}
                    </h3>
                    <span
                      className={`badge ${getStatusColor(brd.status)}`}
                    >
                      {formatStatus(brd.status)}
                    </span>
                    <span
                      className={`badge ${getConfidenceBg(brd.confidenceScore)}`}
                    >
                      {(brd.confidenceScore * 100).toFixed(0)}% confidence
                    </span>
                  </div>

                  <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                    {brd.problemStatement}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo(brd.createdAt)}
                    </span>
                    <span>
                      WSJF: {brd.wsjfFinalScore.toFixed(1)}
                    </span>
                    <span>
                      Evidence: {brd.sourceEvidence.length} quotes
                    </span>
                    {brd.criticScore !== null && (
                      <span>Critic: {(brd.criticScore * 100).toFixed(0)}%</span>
                    )}
                    {brd.reviewerEmail && (
                      <span>Reviewer: {brd.reviewerEmail}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
