"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { clearPipelineRunSession, markPipelineRun } from "@/lib/pipeline-session";
import { Play, CircleDashed, CheckCircle2, FileText, Settings, Database, Network } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [runFinished, setRunFinished] = useState(false);

  const startPipeline = async () => {
    clearPipelineRunSession();
    setIsRunning(true);
    setRunFinished(false);

    try {
      // Trigger the real n8n backend workflow (01_data_ingestion)
      await api.triggerPipeline();
      markPipelineRun();
      
      // Simulate network wait for better UX
      setTimeout(() => {
        setIsRunning(false);
        setRunFinished(true);
      }, 1500);
    } catch (err) {
      console.error("Pipeline trigger failed:", err);
      clearPipelineRunSession();
      setIsRunning(false);
      alert("Failed to trigger pipeline. Backend is reachable, but n8n webhook/workflow is not active or reachable.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pt-8">
      {/* 
        Data Flow Visualizer 
      */}
      <div className="glass-card-static bg-white border border-blue-100 rounded-xl p-8 mb-8 shadow-sm">
         <h2 className="text-xl font-bold text-slate-900 text-center mb-8">AutoFlow Integration Architecture</h2>
         
         <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-2xl mx-auto">
            {/* Step 1: Google Sheets */}
            <div className="flex flex-col items-center gap-2 text-center w-32">
               <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center border-2 border-emerald-300">
                  <Database className="w-8 h-8 text-emerald-600" />
               </div>
               <p className="text-sm font-semibold text-slate-800">Google Sheets</p>
               <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Raw Data</p>
            </div>

            <div className="h-0.5 w-16 bg-slate-300 hidden md:block relative">
               <div className="absolute right-0 top-1/2 -mt-1.5 w-3 h-3 border-t-2 border-r-2 border-slate-300 transform rotate-45"></div>
            </div>

            {/* Step 2: n8n Backend */}
            <div className="flex flex-col items-center gap-2 text-center w-32">
               <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center border-2 border-blue-300">
                  <Network className="w-8 h-8 text-blue-600" />
               </div>
               <p className="text-sm font-semibold text-slate-800">n8n Pipeline</p>
               <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">AI Agents (Gemini)</p>
            </div>

            <div className="h-0.5 w-16 bg-slate-300 hidden md:block relative">
               <div className="absolute right-0 top-1/2 -mt-1.5 w-3 h-3 border-t-2 border-r-2 border-slate-300 transform rotate-45"></div>
            </div>

            {/* Step 3: AutoFlow UI */}
            <div className="flex flex-col items-center gap-2 text-center w-32">
               <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center border-2 border-purple-300">
                  <Settings className="w-8 h-8 text-purple-600" />
               </div>
               <p className="text-sm font-semibold text-slate-800">AutoFlow UI</p>
               <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Postgres DB</p>
            </div>
         </div>
      </div>

      {/* 
         Trigger Controls 
      */}
      <div className="glass-card p-12 text-center space-y-6 shadow-md border border-white/20">
        <h1 className="text-3xl font-bold text-white mb-2">Trigger AutoFlow Pipeline</h1>
        <p className="text-slate-300 max-w-lg mx-auto leading-relaxed">
          Start the backend ingestion process. The system will retrieve new feedback directly from your <b>Google Sheet</b>, pass it through the <b>n8n AI Agents</b>, and securely store the clustered requirements in the PostgreSQL database.
        </p>

        <div className="pt-8">
          {runFinished ? (
            <div className="space-y-6 animate-scale-in">
              <div className="inline-flex flex-col sm:flex-row items-center gap-3 text-emerald-400 bg-emerald-400/10 px-6 py-4 rounded-xl border border-emerald-400/20 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                <span className="font-medium text-left">Pipeline Triggered Successfully!<br/><span className="text-sm text-emerald-400/80">n8n is actively processing your data in the background.</span></span>
              </div>
              <div>
                <Link href="/brds" className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-sm transition-transform hover:scale-105 shadow-xl shadow-blue-500/20">
                  <FileText className="w-4 h-4" />
                  Go to BRD Review Queue to see results
                </Link>
              </div>
            </div>
          ) : (
            <button 
              onClick={startPipeline}
              disabled={isRunning}
              className={`btn-primary text-base font-semibold px-8 py-4 transition-all hover:scale-105 shadow-xl shadow-blue-500/20 ${isRunning ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isRunning ? (
                <span className="flex items-center gap-2">
                  <CircleDashed className="w-5 h-5 animate-spin" />
                  Firing n8n Webhook...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Play className="w-5 h-5 fill-white" />
                  Execute End-to-End Pipeline
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
