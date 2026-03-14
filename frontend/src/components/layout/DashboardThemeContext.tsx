"use client";

import { createContext, useContext } from "react";

export type DashboardTheme = "light" | "dark";

type DashboardThemeContextValue = {
  theme: DashboardTheme;
  toggleTheme: () => void;
};

export const DashboardThemeContext = createContext<DashboardThemeContextValue | null>(null);

export function useDashboardTheme() {
  const context = useContext(DashboardThemeContext);
  if (!context) {
    return { theme: "light" as DashboardTheme, toggleTheme: () => {} };
  }
  return context;
}
