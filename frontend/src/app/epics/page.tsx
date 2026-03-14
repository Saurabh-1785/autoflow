"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { hasPipelineRunInSession } from "@/lib/pipeline-session";
import type { Epic } from "@/lib/types";
import { ListChecks, AlertCircle, Play, CheckCircle2, Blocks, GitCommit } from "lucide-react";

export default function EpicsPage() {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(true);
  const [delivering, setDelivering] = useState<string | null>(null);
  const [pipelineReady, setPipelineReady] = useState(false);

  useEffect(() => {
    const ready = hasPipelineRunInSession();
    setPipelineReady(ready);

    if (!ready) {
      setEpics([]);
      setLoading(false);
      return;
    }

    async function loadEpics() {
      try {
        const res = await api.getEpics();
        if (res.epics) {
          // Fetch full data for each epic to get user stories
          const hydrated = await Promise.all(
            res.epics.map(async (row: Record<string, unknown>) => {
              const fullEpicData = await api.getEpic(String(row.id || ""));
              return {
                id: String(row.id || ""),
                brdId: String(row.brd_id || ""),
                epicRef: String(row.epic_ref || ""),
                title: String(row.title || ""),
                description: String(row.description || ""),
                totalPoints: Number(row.total_points ?? 0),
                status: String(row.status || "draft"),
                blockchainTxHash: null,
                createdAt: String(row.created_at || new Date().toISOString()),
                userStories: fullEpicData.user_stories.map((story: Record<string, unknown>) => ({
                    id: String(story.id || ""),
                    epicId: String(story.epic_id || ""),
                    storyRef: String(story.story_ref || ""),
                    title: String(story.title || ""),
                    storyText: String(story.story_text || ""),
                    storyPoints: Number(story.story_points ?? 0),
                    priority: String(story.priority || "medium") as "high" | "medium" | "low",
                    needsClarification: Boolean(story.needs_clarification),
                    acceptanceCriteria: Array.isArray(story.acceptance_criteria) ? story.acceptance_criteria.map(String) : [],
                    definitionOfDone: Array.isArray(story.definition_of_done) ? story.definition_of_done.map(String) : [],
                    status: String(story.status || "draft"),
                    createdAt: String(story.created_at || new Date().toISOString())
                }))
              } as Epic;
            })
          );
          setEpics(hydrated);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadEpics();
  }, []);

  const handleDeliver = async (epicId: string) => {
    setDelivering(epicId);
    // Simulate Delivery Agent logic (handoff to Jira)
    await new Promise(resolve => setTimeout(resolve, 2000));
    setEpics(prev => prev.map(e => e.id === epicId ? { ...e, status: 'delivered' } : e));
    setDelivering(null);
    alert("Delivery Agent has successfully pushed the Epic and Stories to the Engineering Backlog!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-cyan-400" />
            PO Workspace: Epics & Story Writer
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {pipelineReady ? "Review AI-generated Epics and dispatch them to the Engineering Backlog via the Delivery Agent." : "Run pipeline from Dashboard to load epics."}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="text-slate-500 text-sm py-8 text-center bg-white/5 rounded-lg border border-slate-700">
            Loading Story Writer Agent outputs...
          </div>
        ) : !pipelineReady ? (
          <div className="text-slate-500 text-sm py-8 text-center bg-white/5 rounded-lg border border-slate-700 mt-6">
            Run the pipeline first from Dashboard. Epics will appear after execution.
          </div>
        ) : epics.length === 0 ? (
          <div className="text-slate-500 text-sm py-8 text-center bg-white/5 rounded-lg border border-slate-700 mt-6">
            <Blocks className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            No Epics found. Run the PM Priority board&apos;s &quot;Finalize&quot; button to generate Epics!
          </div>
        ) : (
          epics.map((epic) => (
            <div key={epic.id} className="glass-card overflow-hidden">
               {/* Epic Header */}
               <div className="p-6 border-b border-slate-700 flex flex-wrap gap-4 items-start justify-between bg-cyan-900/10">
                 <div className="flex-1">
                     <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">{epic.epicRef}</span>
                        <h2 className="text-lg font-bold text-white">{epic.title}</h2>
                        {epic.status === 'delivered' && (
                           <span className="text-xs flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20"><CheckCircle2 className="w-3 h-3"/> Delivered</span>
                        )}
                     </div>
                     <p className="text-sm text-slate-400 max-w-4xl">{epic.description}</p>
                 </div>
                 
                 <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <div className="text-right">
                       <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Points</p>
                       <p className="text-2xl font-black text-white">{epic.totalPoints}</p>
                    </div>
                    {epic.status !== 'delivered' && (
                        <button 
                            onClick={() => handleDeliver(epic.id)}
                            disabled={delivering === epic.id}
                            className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                            {delivering === epic.id ? "Delivery Agent running..." : "Dispatch to Engineering"}
                            <Play className="w-3 h-3" />
                        </button>
                    )}
                 </div>
               </div>

               {/* User Stories */}
               <div className="p-6 bg-slate-900/30">
                  <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                      <GitCommit className="w-4 h-4 text-slate-500" />
                      Decomposed User Stories ({epic.userStories.length})
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                     {epic.userStories.map(story => (
                        <div key={story.id} className="bg-slate-800/50 rounded-lg p-5 border border-slate-700 hover:border-cyan-500/30 transition-colors group">
                           <div className="flex justify-between items-start mb-3">
                              <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">{story.storyRef}</span>
                              <div className="flex items-center gap-2">
                                  {story.needsClarification && <AlertCircle className="w-3.5 h-3.5 text-amber-500"/>}
                                  <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{story.storyPoints} pts</span>
                              </div>
                           </div>
                           <h4 className="text-sm font-semibold text-white mb-2">{story.title}</h4>
                           <p className="text-xs text-slate-400 italic mb-4">&ldquo;{story.storyText}&rdquo;</p>
                           
                           <div className="space-y-1">
                               <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Acceptance Criteria</p>
                               {story.acceptanceCriteria.map((ac, i) => (
                                   <div key={i} className="flex gap-2 items-start text-xs text-slate-400">
                                       <span className="text-cyan-500/50 mt-0.5">•</span>
                                       <span className="leading-snug">{ac}</span>
                                   </div>
                               ))}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
