"use client";

import Link from "next/link";
import { mockEpics } from "@/lib/mock-data";
import { timeAgo, getStatusColor, formatStatus, truncateHash } from "@/lib/utils";
import {
  Blocks,
  ArrowRight,
  BookOpen,
  Hash,
  Shield,
  Clock,
} from "lucide-react";

export default function EpicsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Blocks className="w-5 h-5 text-purple-400" />
          Engineering Epics
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {mockEpics.length} epics generated from approved BRDs
        </p>
      </div>

      {/* Epic Cards */}
      <div className="grid grid-cols-1 gap-4 stagger-children">
        {mockEpics.map((epic) => {
          const totalStories = epic.userStories.length;
          return (
            <Link
              key={epic.id}
              href={`/epics/${epic.id}`}
              className="no-underline block"
            >
              <div className="glass-card p-5 group cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-purple-500/20 text-purple-400">
                        {epic.epicRef}
                      </span>
                      <h3 className="text-base font-semibold text-white group-hover:text-purple-400 transition-colors">
                        {epic.title}
                      </h3>
                      <span className={`badge ${getStatusColor(epic.status)}`}>
                        {formatStatus(epic.status)}
                      </span>
                    </div>

                    <p className="text-sm text-slate-400 mb-3">
                      {epic.description}
                    </p>

                    <div className="flex items-center gap-5 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {totalStories} User Stories
                      </span>
                      <span className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {epic.totalPoints} Story Points
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(epic.createdAt)}
                      </span>
                      {epic.blockchainTxHash && (
                        <span className="flex items-center gap-1 text-cyan-500/60">
                          <Shield className="w-3 h-3" />
                          On-chain
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors flex-shrink-0">
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
