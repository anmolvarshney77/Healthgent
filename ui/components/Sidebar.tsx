"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Activity,
  Pill,
  Salad,
  Settings,
  HeartPulse,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/patients", icon: Users, label: "Patients" },
  { href: "/clinical-notes", icon: FileText, label: "Clinical Notes" },
  { href: "/vitals", icon: Activity, label: "Vitals & Monitoring" },
  { href: "/prescriptions", icon: Pill, label: "Prescriptions" },
  { href: "/diet-plans", icon: Salad, label: "Diet Plans" },
];

const secondaryItems = [
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col z-40"
      style={{ width: "260px", background: "#0f1f3d" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}
        >
          <HeartPulse size={20} color="white" />
        </div>
        <div>
          <div className="text-white font-bold text-base leading-none">HealthGent</div>
          <div className="text-xs mt-0.5" style={{ color: "#7dd3fc" }}>
            Agentic Healthcare OS
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        <div className="mb-1 px-3 pb-2">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#475569" }}>
            Main Menu
          </span>
        </div>
        <ul className="space-y-0.5">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative"
                  style={{
                    background: active ? "rgba(59,130,246,0.15)" : "transparent",
                    color: active ? "#93c5fd" : "#94a3b8",
                  }}
                >
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                      style={{ background: "#3b82f6" }}
                    />
                  )}
                  <Icon size={18} className={active ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"} />
                  <span className={active ? "text-blue-300" : "group-hover:text-slate-200"}>
                    {label}
                  </span>
                  {active && <ChevronRight size={14} className="ml-auto text-blue-400" />}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 mb-1 px-3 pb-2">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#475569" }}>
            System
          </span>
        </div>
        <ul className="space-y-0.5">
          {secondaryItems.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group"
                  style={{ color: active ? "#93c5fd" : "#94a3b8" }}
                >
                  <Icon size={18} className="text-slate-500 group-hover:text-slate-300" />
                  <span className="group-hover:text-slate-200">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}
          >
            HG
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-white truncate">HealthGent Admin</div>
            <div className="text-xs" style={{ color: "#475569" }}>
              v1.0.0
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
