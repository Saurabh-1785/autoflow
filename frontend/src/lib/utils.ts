import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function truncateHash(hash: string, len = 8): string {
  if (!hash) return "";
  return `${hash.slice(0, len)}...${hash.slice(-6)}`;
}

export function getConfidenceColor(score: number): string {
  if (score >= 0.85) return "text-emerald-400";
  if (score >= 0.75) return "text-amber-400";
  return "text-red-400";
}

export function getConfidenceBg(score: number): string {
  if (score >= 0.85) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  if (score >= 0.75) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  return "bg-red-500/20 text-red-400 border-red-500/30";
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending_review: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    needs_revision: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    hitl_queue: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    generating_epics: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    done: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    pending_generation: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    draft: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    healthy: "bg-emerald-500/20 text-emerald-400",
    degraded: "bg-amber-500/20 text-amber-400",
    down: "bg-red-500/20 text-red-400",
  };
  return colors[status] || "bg-slate-500/20 text-slate-400 border-slate-500/30";
}

export function formatStatus(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
