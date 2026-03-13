"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { DashboardThemeContext, type DashboardTheme } from "./DashboardThemeContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const [theme, setTheme] = useState<DashboardTheme>("light");

  useEffect(() => {
    const saved = window.localStorage.getItem("autoflow-dashboard-theme");
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      window.localStorage.setItem("autoflow-dashboard-theme", next);
      return next;
    });
  };

  const themeValue = useMemo(() => ({ theme, toggleTheme }), [theme]);

  if (isLanding) {
    return <>{children}</>;
  }

  return (
    <DashboardThemeContext.Provider value={themeValue}>
      <div
        className={`flex h-screen overflow-hidden ${
          theme === "light" ? "dashboard-theme-light bg-white text-slate-800" : "dashboard-theme-dark bg-navy-950 text-slate-200"
        }`}
      >
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          <main className={`flex-1 overflow-y-auto p-6 ${theme === "light" ? "bg-white" : "bg-navy-950"}`}>
            {children}
          </main>
        </div>
      </div>
    </DashboardThemeContext.Provider>
  );
}
