"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { hasPipelineRunInSession } from "@/lib/pipeline-session";
import type { Brd } from "@/lib/types";
import { Target, ArrowRight, Activity, Clock, Shield, TrendingUp, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function PriorityPage() {
  const [priorities, setPriorities] = useState<Brd[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [pipelineReady, setPipelineReady] = useState(false);

  useEffect(() => {
    const ready = hasPipelineRunInSession();
    setPipelineReady(ready);

    if (!ready) {
      setPriorities([]);
      setLoading(false);
      return;
    }

    async function fetchPriorities() {
      try {
        const res = await api.getPriorities();
        if (res.priorities) {
          const mapped: Brd[] = res.priorities.map((row: Record<string, unknown>) => ({
            id: String(row.id || ""),
            clusterId: String(row.cluster_id || ""),
            title: String(row.title || ""),
            problemStatement: String(row.problem_statement || ""),
            wsjf: row.wsjf || { businessValue: 0, timeCriticality: 0, riskReduction: 0, effort: 0 },
            wsjfFinalScore: Number(row.wsjf_final_score ?? 0),
            confidenceScore: Number(row.confidence_score ?? 0),
            status: String(row.status || "pending_review") as Brd["status"],
            createdAt: String(row.created_at || new Date().toISOString()),
          }));
          setPriorities(mapped);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPriorities();
  }, []);

  const handleFinalize = async () => {
    setGenerating(true);
    try {
      await api.finalizePriorities(priorities.map(p => p.id));
      alert("Success! The n8n Epic Generation workflow has been triggered.");
    } catch (err) {
      console.error(err);
      alert("Failed to start epic generation.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            PM Workspace: Priority Board
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {pipelineReady ? "Review AI-scored WSJF ranking and finalize requirements for Engineering." : "Run pipeline from Dashboard to load priorities."}
          </p>
        </div>
        <button 
          onClick={handleFinalize}
          disabled={!pipelineReady || generating || priorities.length === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          {generating ? "Sending to n8n..." : "Finalize & Generate Epics"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 stagger-children">
        {loading ? (
           <div className="text-slate-500 text-sm py-8 text-center bg-white/5 rounded-lg border border-slate-700">
            Loading prioritized features...
          </div>
        ) : !pipelineReady ? (
          <div className="text-slate-500 text-sm py-8 text-center bg-white/5 rounded-lg border border-slate-700">
            Run the pipeline first from Dashboard. Priorities will appear after execution.
          </div>
        ) : priorities.length === 0 ? (
          <div className="text-slate-500 text-sm py-8 text-center bg-white/5 rounded-lg border border-slate-700">
            No approved BRDs found. Approve some BRDs in the Review Queue first!
          </div>
        ) : (
          priorities.map((p, idx) => (
            <div key={p.id} className="glass-card p-5 group flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-500/10 flex flex-col items-center justify-center border border-blue-500/20">
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Rank</span>
                <span className="text-xl font-black text-blue-300 leading-none mt-0.5">#{idx + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/brds/${p.id}`} className="group/link no-underline inline-block">
                  <h3 className="text-base font-semibold text-white mb-1 group-hover/link:text-blue-400 transition-colors flex items-center gap-2">
                    {p.title}
                    <MessageSquare className="w-3 h-3 text-slate-500 group-hover/link:text-blue-400 opacity-0 group-hover/link:opacity-100 transition-all" />
                  </h3>
                </Link>
                <p className="text-sm text-slate-400 truncate max-w-3xl">{p.problemStatement}</p>
                
                {/* WSJF Metrics */}
                <div className="flex flex-wrap items-center gap-3 mt-4">
                   <div className="px-2 py-1 bg-white/10 rounded border border-white/10 text-slate-200 flex items-center gap-2">
                     <span className="text-sm font-mono font-black text-white">{p.wsjfFinalScore.toFixed(1)}</span>
                     <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Final WSJF</span>
                   </div>
                   <div className="h-4 w-px bg-slate-700 mx-1"></div>
                   <div className="text-xs font-medium text-slate-400 flex items-center gap-4">
                     <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-emerald-400"/> BV: {p.wsjf?.businessValue || 0}</span>
                     <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-400"/> TC: {p.wsjf?.timeCriticality || 0}</span>
                     <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-blue-400"/> RR: {p.wsjf?.riskReduction || 0}</span>
                     <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-rose-400"/> Effort: {p.wsjf?.effort || 0}</span>
                   </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
