"use client";

import { ListChecks } from "lucide-react";

const features = [
  {
    title: "Epic Decomposition",
    desc: "Decompose prioritized features into epics with clear acceptance boundaries and dependencies.",
  },
  {
    title: "User Story Refinement",
    desc: "Refine stories with INVEST checks, point suggestions, and acceptance criteria templates.",
  },
  {
    title: "Sprint Planning",
    desc: "Capacity-aware sprint proposal with automated allocation and planning hints.",
  },
  {
    title: "Backlog Management",
    desc: "AI-assisted backlog grooming with dependency-aware ordering and visibility for stakeholders.",
  },
];

export default function EpicsPage() {
  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="glass-card-static bg-white border border-blue-100 rounded-md p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-cyan-100 flex items-center justify-center mx-auto mb-3">
            <ListChecks className="w-7 h-7 text-cyan-700" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Product Owner Workspace</h1>
          <p className="text-slate-500 mt-2">Agent-wise PO workspace for epic decomposition and sprint planning.</p>
        </div>

        <div className="space-y-3">
          {features.map((item, index) => (
            <div key={item.title} className="border border-slate-200 rounded-md p-4 bg-slate-50">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-cyan-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                  <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-md bg-cyan-50 border border-cyan-100">
          <p className="text-xs uppercase tracking-wider text-cyan-700 font-semibold">n8n Integration Point</p>
          <p className="text-sm text-cyan-900 mt-1 font-mono">POST /webhook/po-agent-trigger — Sub-Workflow 7 (Epic Decomposition & Sprint Planning)</p>
        </div>
      </div>
    </div>
  );
}
