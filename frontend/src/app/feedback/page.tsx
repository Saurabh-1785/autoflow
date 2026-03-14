"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { hasPipelineRunInSession } from "@/lib/pipeline-session";
import { timeAgo, getStatusColor, formatStatus } from "@/lib/utils";
import {
  MessageSquareText,
  Filter,
  Search,
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  Minus,
  ExternalLink,
} from "lucide-react";
import type { RawFeedback } from "@/lib/types";

const sourceFilters = ["all", "reddit", "app_store", "twitter", "google_play", "sheet"] as const;
const sentimentFilters = ["all", "positive", "negative", "neutral"] as const;

const sourceLabels: Record<string, string> = {
  reddit: "Reddit",
  app_store: "App Store",
  twitter: "Twitter/X",
  google_play: "Google Play",
  sheet: "Google Sheet",
};

const sourceIcons: Record<string, string> = {
  reddit: "R",
  app_store: "A",
  twitter: "X",
  google_play: "G",
  sheet: "S",
};

function SentimentIcon({ sentiment }: { sentiment: string }) {
  if (sentiment === "positive")
    return <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />;
  if (sentiment === "negative")
    return <ThumbsDown className="w-3.5 h-3.5 text-red-400" />;
  return <Minus className="w-3.5 h-3.5 text-slate-500" />;
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<RawFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [pipelineReady, setPipelineReady] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const ready = hasPipelineRunInSession();
    setPipelineReady(ready);

    if (!ready) {
      setFeedback([]);
      setLoading(false);
      return;
    }

    async function fetchFeedback() {
      try {
        const res = await api.getFeedback();
        const allowedSources = new Set(["reddit", "app_store", "twitter", "google_play", "sheet"]);
        const allowedSentiments = new Set(["positive", "negative", "neutral"]);
        const allowedTiers = new Set(["free", "pro", "enterprise"]);

        const mapped: RawFeedback[] = (res.feedback || []).map((row: any) => ({
          id: row.id,
          source: allowedSources.has(row.source) ? row.source : "sheet",
          text: row.text || "",
          authorId: row.author_id || "unknown_user",
          authorTier: allowedTiers.has(row.author_tier) ? row.author_tier : "free",
          sentiment: allowedSentiments.has(row.sentiment) ? row.sentiment : "neutral",
          sentimentScore: Number(row.sentiment_score ?? 0),
          isDuplicate: Boolean(row.is_duplicate),
          clusterId: row.cluster_id || null,
          createdAt: row.created_at,
          collectedAt: row.collected_at,
        }));

        setFeedback(mapped);
      } catch (error) {
        console.error("Failed to load feedback:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeedback();
  }, []);

  const filtered = feedback.filter((fb) => {
    if (sourceFilter !== "all" && fb.source !== sourceFilter) return false;
    if (sentimentFilter !== "all" && fb.sentiment !== sentimentFilter) return false;
    if (searchQuery && !fb.text.toLowerCase().includes(searchQuery.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquareText className="w-5 h-5 text-blue-400" />
            Raw Feedback Inbox
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {pipelineReady ? `${feedback.length} items collected from your pipeline` : "Run pipeline from Dashboard to load feedback"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Source
            </span>
          </div>
          <div className="flex gap-1">
            {sourceFilters.map((s) => (
              <button
                key={s}
                onClick={() => setSourceFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  sourceFilter === s
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                }`}
              >
                {s === "all" ? "All" : sourceLabels[s]}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-white/10" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Sentiment
            </span>
          </div>
          <div className="flex gap-1">
            {sentimentFilters.map((s) => (
              <button
                key={s}
                onClick={() => setSentimentFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  sentimentFilter === s
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 h-8 pl-8 pr-3 bg-white/5 border border-white/8 rounded-lg text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-2 stagger-children">
        {loading ? (
          <div className="glass-card p-12 text-center">
            <p className="text-slate-500 text-sm">Loading feedback from database...</p>
          </div>
        ) : !pipelineReady ? (
          <div className="glass-card p-12 text-center">
            <p className="text-slate-500 text-sm">Run the pipeline first from Dashboard. Feedback will appear after execution.</p>
          </div>
        ) : filtered.map((fb) => (
          <FeedbackCard key={fb.id} feedback={fb} />
        ))}
        {!loading && filtered.length === 0 && (
          <div className="glass-card p-12 text-center">
            <p className="text-slate-500 text-sm">No feedback matches your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FeedbackCard({ feedback }: { feedback: RawFeedback }) {
  return (
    <div className="glass-card p-4 group">
      <div className="flex gap-4">
        {/* Source Icon */}
        <div className={`source-icon source-${feedback.source} flex-shrink-0 mt-0.5`}>
          {sourceIcons[feedback.source]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-200 leading-relaxed">
            &ldquo;{feedback.text}&rdquo;
          </p>
          <div className="flex items-center gap-4 mt-2.5">
            <span className="text-xs text-slate-600">{feedback.authorId}</span>
            <span className={`badge ${getStatusColor(feedback.sentiment)}`}>
              <SentimentIcon sentiment={feedback.sentiment} />
              <span className="ml-1">{feedback.sentiment}</span>
            </span>
            <span className="text-xs text-slate-600">
              Score: {(feedback.sentimentScore * 100).toFixed(0)}%
            </span>
            {feedback.authorTier !== "free" && (
              <span className="badge bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]">
                {feedback.authorTier.toUpperCase()}
              </span>
            )}
            <span className="text-xs text-slate-600 ml-auto">
              {timeAgo(feedback.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
