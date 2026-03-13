"use client";

import { useState } from "react";
import { mockAuditRecords } from "@/lib/mock-data";
import {
  Shield,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  FileDown,
  Link2,
} from "lucide-react";
import { timeAgo, truncateHash, formatDateTime } from "@/lib/utils";
import type { AuditEventType } from "@/lib/types";

const eventTypeColors: Record<AuditEventType, string> = {
  BRD_GENERATED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  BRD_APPROVED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  BRD_EDITED: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  PRIORITY_SET: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  EPIC_CREATED: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  SA_DELIVERY: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

const allEventTypes: AuditEventType[] = [
  "BRD_GENERATED",
  "BRD_APPROVED",
  "BRD_EDITED",
  "PRIORITY_SET",
  "EPIC_CREATED",
  "SA_DELIVERY",
];

export default function AuditPage() {
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [verifyId, setVerifyId] = useState("");
  const [verifyResult, setVerifyResult] = useState<
    null | "verified" | "tampered"
  >(null);

  const filtered = mockAuditRecords.filter(
    (r) => eventFilter === "all" || r.eventType === eventFilter
  );

  const handleVerify = () => {
    if (!verifyId.trim()) return;
    // Simulate verification — in real app, would re-hash and compare
    const found = mockAuditRecords.find(
      (r) => r.recordId === verifyId.trim()
    );
    setVerifyResult(found ? "verified" : "tampered");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            Blockchain Audit Trail
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {mockAuditRecords.length} immutable records on Polygon testnet
          </p>
        </div>
        <button className="btn-secondary" id="download-audit-btn">
          <FileDown className="w-4 h-4" />
          Download Report
        </button>
      </div>

      {/* Verify Widget */}
      <div className="glass-card p-5 glow-cyan">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          Verify Record Integrity
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter BRD ID (e.g., brd-1)"
            value={verifyId}
            onChange={(e) => {
              setVerifyId(e.target.value);
              setVerifyResult(null);
            }}
            className="flex-1 h-10 px-4 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
          />
          <button className="btn-primary" onClick={handleVerify}>
            Verify
          </button>
        </div>
        {verifyResult && (
          <div
            className={`mt-3 p-3 rounded-lg flex items-center gap-2 animate-scale-in ${
              verifyResult === "verified"
                ? "bg-emerald-500/10 border border-emerald-500/20"
                : "bg-red-500/10 border border-red-500/20"
            }`}
          >
            {verifyResult === "verified" ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm text-emerald-400 font-semibold">
                  VERIFIED ✅ — On-chain hash matches current database record
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-sm text-red-400 font-semibold">
                  NOT FOUND ⚠️ — No on-chain record found for this ID
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Filter */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-4 h-4 text-slate-500" />
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setEventFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                eventFilter === "all"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              }`}
            >
              All
            </button>
            {allEventTypes.map((type) => (
              <button
                key={type}
                onClick={() => setEventFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  eventFilter === type
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                }`}
              >
                {type.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="glass-card-static overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Event Type</th>
                <th>Record ID</th>
                <th>Content Hash</th>
                <th>TX Hash</th>
                <th>Actor</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="stagger-children">
              {filtered.map((record) => (
                <tr key={record.id}>
                  <td>
                    <div>
                      <p className="text-sm text-slate-300">
                        {formatDateTime(record.createdAt)}
                      </p>
                      <p className="text-xs text-slate-600">
                        {timeAgo(record.createdAt)}
                      </p>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        eventTypeColors[record.eventType]
                      }`}
                    >
                      {record.eventType.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td>
                    <code className="text-xs text-slate-400 font-mono">
                      {record.recordId}
                    </code>
                  </td>
                  <td>
                    <code className="text-xs text-slate-500 font-mono">
                      {truncateHash(record.contentHash)}
                    </code>
                  </td>
                  <td>
                    <a
                      href={`https://mumbai.polygonscan.com/tx/${record.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-400 font-mono flex items-center gap-1 hover:underline"
                    >
                      {truncateHash(record.txHash)}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td>
                    <span className="text-sm text-slate-400">
                      {record.actor}
                    </span>
                  </td>
                  <td>
                    {record.ipfsCid && (
                      <a
                        href={`https://gateway.pinata.cloud/ipfs/${record.ipfsCid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-400 flex items-center gap-1 hover:underline"
                      >
                        <Link2 className="w-3 h-3" />
                        IPFS
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
