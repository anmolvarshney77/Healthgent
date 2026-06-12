import TopBar from "@/components/TopBar";
import {
  Users,
  FileText,
  Activity,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowUpRight,
  Pill,
  Brain,
  Stethoscope,
  HeartPulse,
} from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Total Patients", value: "5", change: "+2 this month", icon: Users, color: "#3b82f6", bg: "#eff6ff" },
  { label: "Clinical Notes", value: "5", change: "All up to date", icon: FileText, color: "#0891b2", bg: "#ecfeff" },
  { label: "Active Treatments", value: "12", change: "3 need review", icon: Activity, color: "#7c3aed", bg: "#f5f3ff" },
  { label: "Alerts", value: "3", change: "Requires attention", icon: AlertTriangle, color: "#d97706", bg: "#fffbeb" },
];

const recentPatients = [
  { id: "Grover559_Keeling57", name: "Grover Keeling", condition: "Asthma — Persistent Moderate", status: "Monitoring", statusColor: "#d97706", statusBg: "#fef3c7", date: "May 6, 2026", dept: "Pediatrics" },
  { id: "Jimmie93_Waelchi213", name: "Jimmie Waelchi", condition: "Type 2 Diabetes / Hypertension", status: "Active", statusColor: "#16a34a", statusBg: "#dcfce7", date: "May 9, 2026", dept: "Internal Medicine" },
  { id: "Lane844_Carroll471", name: "Lane Carroll", condition: "COPD / CHF", status: "Critical", statusColor: "#dc2626", statusBg: "#fee2e2", date: "May 8, 2026", dept: "Pulmonology" },
  { id: "Lincoln623_Bednar518", name: "Lincoln Bednar", condition: "Lumbar Disc Herniation", status: "Stable", statusColor: "#0891b2", statusBg: "#cffafe", date: "May 7, 2026", dept: "Orthopedics" },
  { id: "Tamera164_Wisozk929", name: "Tamera Wisozk", condition: "Major Depressive Disorder", status: "Follow-up", statusColor: "#7c3aed", statusBg: "#ede9fe", date: "May 5, 2026", dept: "Psychiatry" },
];

const agentActivities = [
  { icon: Brain, label: "HistoryServer", desc: "Patient context synced — 5 records", time: "2m ago", color: "#7c3aed" },
  { icon: Pill, label: "TreatmentBot", desc: "Medication schedule updated for Jimmie W.", time: "15m ago", color: "#3b82f6" },
  { icon: Stethoscope, label: "WellnessServer", desc: "Diet plan generated for Lane Carroll", time: "1h ago", color: "#0891b2" },
  { icon: HeartPulse, label: "MonitorBot", desc: "SpO2 alert cleared — Grover K.", time: "2h ago", color: "#16a34a" },
];

export default function DashboardPage() {
  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Dashboard" subtitle="Welcome back, Dr. Sample — here's today's overview" />
      <main className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map(({ label, value, change, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <ArrowUpRight size={16} className="text-slate-300" />
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-800">{value}</div>
                <div className="text-sm text-slate-500 mt-0.5">{label}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp size={12} style={{ color }} />
                <span className="text-xs font-medium" style={{ color }}>{change}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Recent Patients */}
          <div className="col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-semibold text-slate-700">Recent Patients</h2>
                <p className="text-xs text-slate-400">Latest encounters</p>
              </div>
              <Link href="/patients" className="text-xs font-medium text-blue-500 hover:text-blue-600 flex items-center gap-1">
                View all <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {recentPatients.map((p) => (
                <Link key={p.id} href={`/patients/${p.id}`} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors group">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
                    {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{p.name}</div>
                    <div className="text-xs text-slate-400 truncate">{p.condition}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium" style={{ color: p.statusColor, background: p.statusBg }}>{p.status}</span>
                    <div className="text-xs text-slate-400 mt-1">{p.dept}</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0 w-24 justify-end">
                    <Clock size={11} />{p.date}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Agent Activity */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">Agent Activity</h2>
              <p className="text-xs text-slate-400">MCP servers — live feed</p>
            </div>
            <div className="px-4 py-3 space-y-1">
              {agentActivities.map(({ icon: Icon, label, desc, time, color }) => (
                <div key={label} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${color}15` }}>
                    <Icon size={16} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-600">{label}</div>
                    <div className="text-xs text-slate-400 leading-tight mt-0.5">{desc}</div>
                  </div>
                  <div className="text-xs text-slate-300 flex-shrink-0">{time}</div>
                </div>
              ))}
            </div>
            <div className="mx-4 mb-4 mt-2 rounded-xl p-4" style={{ background: "#f0fdf4" }}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={14} className="text-green-500" />
                <span className="text-xs font-semibold text-green-700">All MCP Servers Online</span>
              </div>
              {["HistoryServer", "TreatmentBot", "WellnessServer"].map((srv) => (
                <div key={srv} className="flex items-center justify-between mb-1 last:mb-0">
                  <span className="text-xs text-slate-500">{srv}</span>
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
