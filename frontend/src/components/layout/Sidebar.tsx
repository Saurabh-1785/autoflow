"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquareText,
  FileText,
  ArrowUpDown,
  Blocks,
  Shield,
  Settings,
  Zap,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/feedback", label: "Feedback", icon: MessageSquareText },
  { href: "/brds", label: "BRD Review", icon: FileText },
  { href: "/priority", label: "Priority", icon: ArrowUpDown },
  { href: "/epics", label: "Epics", icon: Blocks },
  { href: "/audit", label: "Audit Trail", icon: Shield },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar w-64 flex-shrink-0 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 pb-2">
        <Link href="/dashboard" className="flex items-center gap-3 no-underline">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">
              AutoFlow
            </h1>
            <p className="text-[10px] font-medium text-blue-400/70 uppercase tracking-widest mt-0.5">
              Intelligence
            </p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? "active" : ""}`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-white/5">
        <div className="glass-card-static p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
              PM
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                Demo User
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                pm@autoflow.io
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
