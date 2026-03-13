"use client";

import { useState } from "react";
import { mockBrds } from "@/lib/mock-data";
import {
  ArrowUpDown,
  GripVertical,
  Lock,
  Unlock,
  Zap,
  ChevronRight,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { getConfidenceBg } from "@/lib/utils";
import type { Brd } from "@/lib/types";

export default function PriorityPage() {
  // Only show approved + pending_review BRDs for priority management
  const eligibleBrds = mockBrds.filter(
    (b) => b.status === "approved" || b.status === "pending_review"
  );

  const [orderedBrds, setOrderedBrds] = useState<Brd[]>(
    [...eligibleBrds].sort((a, b) => b.wsjfFinalScore - a.wsjfFinalScore)
  );
  const [lockedIds, setLockedIds] = useState<Set<string>>(new Set());
  const [topN, setTopN] = useState(3);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(orderedBrds.slice(0, 3).map((b) => b.id))
  );

  const toggleLock = (id: string) => {
    setLockedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    if (lockedIds.has(orderedBrds[index].id) || lockedIds.has(orderedBrds[index - 1].id)) return;
    const next = [...orderedBrds];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setOrderedBrds(next);
  };

  const moveDown = (index: number) => {
    if (index === orderedBrds.length - 1) return;
    if (lockedIds.has(orderedBrds[index].id) || lockedIds.has(orderedBrds[index + 1].id)) return;
    const next = [...orderedBrds];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setOrderedBrds(next);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5 text-purple-400" />
            Priority Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            HITL Gate #2 — Reorder BRDs and select top items for Epic generation
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Select top
            </span>
            <input
              type="range"
              min={1}
              max={orderedBrds.length}
              value={topN}
              onChange={(e) => {
                const n = parseInt(e.target.value);
                setTopN(n);
                setSelectedIds(
                  new Set(orderedBrds.slice(0, n).map((b) => b.id))
                );
              }}
              className="w-32 accent-purple-500"
            />
            <span className="text-sm font-bold text-purple-400 min-w-[24px]">
              {topN}
            </span>
          </div>
        </div>

        <button
          className="btn-primary"
          id="finalize-priority-btn"
          disabled={selectedIds.size === 0}
          onClick={() =>
            alert(
              `Generating Epics for ${selectedIds.size} BRDs! (Demo)\nSelected: ${[...selectedIds].join(", ")}`
            )
          }
        >
          <Sparkles className="w-4 h-4" />
          Lock Priority & Generate Epics
        </button>
      </div>

      {/* Ranked List */}
      <div className="space-y-2">
        {orderedBrds.map((brd, index) => {
          const isSelected = selectedIds.has(brd.id);
          const isLocked = lockedIds.has(brd.id);

          return (
            <div
              key={brd.id}
              className={`glass-card p-4 flex items-center gap-4 transition-all ${
                isSelected
                  ? "border-purple-500/30 bg-purple-500/5"
                  : ""
              } ${isLocked ? "opacity-80" : ""}`}
            >
              {/* Rank */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  index < topN
                    ? "bg-purple-500/20 text-purple-400"
                    : "bg-white/5 text-slate-600"
                }`}
              >
                {index + 1}
              </div>

              {/* Reorder buttons */}
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <button
                  onClick={() => moveUp(index)}
                  className="w-6 h-5 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-30"
                  disabled={index === 0 || isLocked}
                >
                  <ChevronRight className="w-3 h-3 -rotate-90" />
                </button>
                <button
                  onClick={() => moveDown(index)}
                  className="w-6 h-5 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-30"
                  disabled={index === orderedBrds.length - 1 || isLocked}
                >
                  <ChevronRight className="w-3 h-3 rotate-90" />
                </button>
              </div>

              {/* Checkbox */}
              <button
                onClick={() => toggleSelect(brd.id)}
                className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                  isSelected
                    ? "bg-purple-500 border-purple-500"
                    : "border-white/20 hover:border-white/40"
                }`}
              >
                {isSelected && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-white truncate">
                    {brd.title}
                  </h4>
                  <span className={`badge ${getConfidenceBg(brd.confidenceScore)} text-[10px]`}>
                    {(brd.confidenceScore * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">
                  {brd.problemStatement}
                </p>
              </div>

              {/* WSJF scores on hover — shown inline */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-center">
                  <p className="text-xs text-blue-400 font-bold">
                    {brd.wsjf.businessValue}
                  </p>
                  <p className="text-[9px] text-slate-600">BV</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-amber-400 font-bold">
                    {brd.wsjf.timeCriticality}
                  </p>
                  <p className="text-[9px] text-slate-600">TC</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-purple-400 font-bold">
                    {brd.wsjf.riskReduction}
                  </p>
                  <p className="text-[9px] text-slate-600">RR</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-red-400 font-bold">
                    {brd.wsjf.effort}
                  </p>
                  <p className="text-[9px] text-slate-600">Eff</p>
                </div>
                <div className="text-center pl-2 border-l border-white/10">
                  <p className="text-sm text-white font-bold">
                    {brd.wsjfFinalScore.toFixed(1)}
                  </p>
                  <p className="text-[9px] text-slate-600">WSJF</p>
                </div>
              </div>

              {/* Lock */}
              <button
                onClick={() => toggleLock(brd.id)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                  isLocked
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-white/5 text-slate-600 hover:text-slate-400"
                }`}
              >
                {isLocked ? (
                  <Lock className="w-3.5 h-3.5" />
                ) : (
                  <Unlock className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
