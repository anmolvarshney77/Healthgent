"use client";

import { Bell, Search } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-semibold text-slate-800 leading-none">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients, notes..."
            className="pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-64"
          />
        </div>
        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <Bell size={18} className="text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
        </button>
        <div className="relative group">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer"
            style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}
          >
            DR
          </div>
          <div className="absolute right-0 top-10 hidden group-hover:block bg-slate-800 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap shadow-lg">
            Dr. Rahul Mehta
          </div>
        </div>
      </div>
    </header>
  );
}
