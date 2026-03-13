"use client";

import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/feedback": "Feedback Inbox",
  "/brds": "BRD Review Queue",
  "/priority": "Priority Management",
  "/epics": "Engineering Epics",
  "/audit": "Blockchain Audit Trail",
  "/settings": "Settings",
};

export function TopBar() {
  const pathname = usePathname();

  const getTitle = () => {
    if (pathname.startsWith("/brds/")) return "BRD Detail";
    if (pathname.startsWith("/epics/")) return "Epic Detail";
    return pageTitles[pathname] || "AutoFlow Intelligence";
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-navy-950/50 backdrop-blur-lg flex-shrink-0">
      <h2 className="text-lg font-semibold text-white">{getTitle()}</h2>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search BRDs, Epics..."
            className="w-64 h-9 pl-9 pr-4 bg-white/5 border border-white/8 rounded-lg text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors">
          <Bell className="w-4 h-4 text-slate-400" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            3
          </span>
        </button>
      </div>
    </header>
  );
}
