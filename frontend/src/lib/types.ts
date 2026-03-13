// ============================================
// AutoFlow Intelligence — Core Types
// ============================================

export type PipelineStage =
  | "idle"
  | "ingesting"
  | "cleaning"
  | "clustering"
  | "generating_brds"
  | "awaiting_review"
  | "prioritizing"
  | "writing_epics"
  | "delivered";

export interface PipelineStatus {
  currentStage: PipelineStage;
  progress: number; // 0-100
  lastRunAt: string;
  isRunning: boolean;
}

export interface StatsOverview {
  totalFeedback: number;
  brdsAwaitingReview: number;
  epicsReady: number;
  blockchainRecords: number;
}

export interface ActivityEvent {
  id: string;
  type: "brd_generated" | "brd_approved" | "brd_rejected" | "epic_created" | "blockchain_write" | "pipeline_started";
  title: string;
  description: string;
  timestamp: string;
  actor: string;
}

export interface SourceHealth {
  name: string;
  status: "healthy" | "degraded" | "down";
  lastPullAt: string;
}

export interface RawFeedback {
  id: string;
  source: "reddit" | "app_store" | "twitter" | "google_play" | "sheet";
  text: string;
  authorId: string;
  authorTier: "free" | "pro" | "enterprise";
  sentiment: "positive" | "negative" | "neutral";
  sentimentScore: number;
  isDuplicate: boolean;
  clusterId: string | null;
  createdAt: string;
  collectedAt: string;
}

export interface WsjfScores {
  businessValue: number;
  timeCriticality: number;
  riskReduction: number;
  effort: number;
}

export type BrdStatus =
  | "pending_generation"
  | "pending_review"
  | "approved"
  | "rejected"
  | "needs_revision"
  | "hitl_queue"
  | "generating_epics"
  | "done";

export interface CriticIssue {
  criterion: string;
  severity: "blocker" | "warning" | "info";
  field: string;
  description: string;
}

export interface Brd {
  id: string;
  clusterId: string;
  title: string;
  problemStatement: string;
  targetAudience: string;
  businessValue: string;
  proposedSolution: string;
  successMetrics: string[];
  outOfScope: string[];
  sourceEvidence: string[];
  wsjf: WsjfScores;
  wsjfFinalScore: number;
  confidenceScore: number;
  confidenceReason: string;
  criticScore: number | null;
  criticIssues: CriticIssue[];
  status: BrdStatus;
  reviewerEmail: string | null;
  reviewedAt: string | null;
  blockchainTxHash: string | null;
  ipfsCid: string | null;
  createdAt: string;
}

export interface UserStory {
  id: string;
  epicId: string;
  storyRef: string;
  title: string;
  storyText: string;
  storyPoints: number;
  priority: "high" | "medium" | "low";
  needsClarification: boolean;
  acceptanceCriteria: string[];
  definitionOfDone: string[];
  status: string;
  createdAt: string;
}

export interface Epic {
  id: string;
  brdId: string;
  epicRef: string;
  title: string;
  description: string;
  totalPoints: number;
  status: string;
  blockchainTxHash: string | null;
  userStories: UserStory[];
  createdAt: string;
}

export type AuditEventType =
  | "BRD_GENERATED"
  | "BRD_APPROVED"
  | "BRD_EDITED"
  | "PRIORITY_SET"
  | "EPIC_CREATED"
  | "SA_DELIVERY";

export interface AuditRecord {
  id: string;
  recordId: string;
  eventType: AuditEventType;
  contentHash: string;
  ipfsCid: string;
  txHash: string;
  actor: string;
  createdAt: string;
  verified?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
