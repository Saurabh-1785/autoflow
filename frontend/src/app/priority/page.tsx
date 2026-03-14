"use client";

import { Target } from "lucide-react";

const features = [
  {
    title: "WSJF Scoring",
    desc: "Auto-calculate Weighted Shortest Job First scores using business value, time criticality, risk reduction, and job size.",
  },
  {
    title: "Feature Prioritization",
    desc: "Agent-assisted prioritization board with override controls for PM review before final ranking.",
  },
  {
    title: "Roadmap Generation",
    desc: "Generate quarterly roadmap proposals aligned to product goals and engineering capacity.",
  },
  {
    title: "Stakeholder Reports",
    desc: "One-click summary pack with confidence, QA score, and expected business impact.",
  },
];

export default function PriorityPage() {
  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="glass-card-static bg-white border border-blue-100 rounded-md p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
            <Target className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Product Manager Workspace</h1>
          <p className="text-slate-500 mt-2">Agent-wise PM workspace for feature prioritization and roadmap planning.</p>
        </div>

        <div className="space-y-3">
          {features.map((item, index) => (
            <div key={item.title} className="border border-slate-200 rounded-md p-4 bg-slate-50">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
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

        <div className="mt-6 p-4 rounded-md bg-blue-50 border border-blue-100">
          <p className="text-xs uppercase tracking-wider text-blue-700 font-semibold">n8n Integration Point</p>
          <p className="text-sm text-blue-900 mt-1 font-mono">POST /webhook/pm-agent-trigger — Sub-Workflow 5 (Feature Prioritization)</p>
        </div>
      </div>
    </div>
  );
}
