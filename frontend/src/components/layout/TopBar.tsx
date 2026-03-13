"use client";

import { Bell, Moon, Search, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import { useDashboardTheme } from "./DashboardThemeContext";

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
  const { theme, toggleTheme } = useDashboardTheme();
  const isLight = theme === "light";

  const getTitle = () => {
    if (pathname.startsWith("/brds/")) return "BRD Detail";
    if (pathname.startsWith("/epics/")) return "Epic Detail";
    return pageTitles[pathname] || "AutoFlow Intelligence";
  };

  return (
    <header
      className={`h-16 flex items-center justify-between px-6 backdrop-blur-lg flex-shrink-0 border-b ${
        isLight ? "bg-white/90 border-blue-100" : "bg-navy-950/50 border-white/5"
      }`}
    >
      <h2 className={`text-lg font-semibold ${isLight ? "text-slate-800" : "text-white"}`}>{getTitle()}</h2>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLight ? "text-slate-400" : "text-slate-500"}`} />
          <input
            type="text"
            placeholder="Search BRDs, Epics..."
            className={`w-64 h-9 pl-9 pr-4 rounded-lg text-sm focus:outline-none transition-all ${
              isLight
                ? "bg-blue-50 border border-blue-100 text-slate-700 placeholder:text-slate-400 focus:border-blue-400"
                : "bg-white/5 border border-white/8 text-slate-300 placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-white/8"
            }`}
          />
        </div>

        <button
          onClick={toggleTheme}
          className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
            isLight
              ? "bg-blue-50 border-blue-100 hover:bg-blue-100 text-blue-600"
              : "bg-white/5 border-white/8 hover:bg-white/10 text-yellow-400"
          }`}
          aria-label="Toggle dashboard theme"
        >
          {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button
          className={`relative w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
            isLight ? "bg-blue-50 border-blue-100 hover:bg-blue-100" : "bg-white/5 border-white/8 hover:bg-white/10"
          }`}
        >
          <Bell className={`w-4 h-4 ${isLight ? "text-slate-500" : "text-slate-400"}`} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            3
          </span>
        </button>
      </div>
    </header>
  );
}
