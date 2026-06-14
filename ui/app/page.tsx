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
  Search,
  ClipboardList,
  ShieldAlert,
  Layers,
} from "lucide-react";
import Link from "next/link";
import fs from "fs";
import path from "path";

const NOTES_DIR = path.resolve(process.cwd(), "../clinical-notes");

interface PatientSummary {
  id: string;
  fullName: string;
  encounterDate: string;
  department: string;
  chiefComplaint: string;
  status: string;
  statusColor: string;
  statusBg: string;
  activeMedCount: number;
  safetyFlags: string[];
  assessments: { problem: string }[];
}

function loadPatients(): PatientSummary[] {
  const files = fs.readdirSync(NOTES_DIR).filter((f) => f.endsWith(".json"));
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(NOTES_DIR, file), "utf-8");
    const d = JSON.parse(raw);
    const meds: { status?: string }[] = d.structuredData?.medications ?? [];
    const activeMeds = meds.filter((m) => (m.status ?? "active").toLowerCase() === "active");
    const flags: string[] = d.agentContext?.safetyFlags ?? [];
    const encounterSetting: string = d.encounter?.setting ?? "";
    let status = "Stable";
    let statusColor = "#0891b2";
    let statusBg = "#cffafe";
    if (flags.length > 0) {
      status = "Alert";
      statusColor = "#d97706";
      statusBg = "#fef3c7";
    }
    if (encounterSetting.toLowerCase().includes("urgent") || encounterSetting.toLowerCase().includes("emergency")) {
      status = "Urgent";
      statusColor = "#dc2626";
      statusBg = "#fee2e2";
    }
    return {
      id: file.replace("_clinical_note.json", ""),
      fullName: d.patient?.fullName ?? "Unknown",
      encounterDate: d.encounter?.dateTime ?? "",
      department: d.encounter?.provider?.department ?? "",
      chiefComplaint: d.encounter?.chiefComplaint ?? "",
      status,
      statusColor,
      statusBg,
      activeMedCount: activeMeds.length,
      safetyFlags: flags,
      assessments: d.clinicalNote?.assessment ?? [],
    };
  });
}

const mcpTools = [
  { icon: Search, label: "search_notes", desc: "Find patients by condition, ICD-10, date range, or chief complaint", color: "#7c3aed" },
  { icon: ClipboardList, label: "get_clinical_note", desc: "Retrieve a full patient record by filename or MRN", color: "#3b82f6" },
  { icon: ShieldAlert, label: "validate_clinical_note", desc: "Check schema completeness and flag missing required fields", color: "#d97706" },
  { icon: Layers, label: "extract_section", desc: "Pull a specific section (e.g. medications, vitals) to reduce context", color: "#0891b2" },
];

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DashboardPage() {
  const patients = loadPatients();
  const totalPatients = patients.length;
  const totalNotes = patients.length;
  const activeTreatments = patients.reduce((sum, p) => sum + p.activeMedCount, 0);
  const totalAlerts = patients.filter((p) => p.safetyFlags.length > 0).length;

  const stats = [
    { label: "Total Patients", value: String(totalPatients), change: "Active records", icon: Users, color: "#3b82f6", bg: "#eff6ff" },
    { label: "Clinical Notes", value: String(totalNotes), change: "All up to date", icon: FileText, color: "#0891b2", bg: "#ecfeff" },
    { label: "Active Treatments", value: String(activeTreatments), change: "Across all patients", icon: Activity, color: "#7c3aed", bg: "#f5f3ff" },
    { label: "Safety Flags", value: String(totalAlerts), change: totalAlerts > 0 ? "Requires attention" : "No active alerts", icon: AlertTriangle, color: "#d97706", bg: "#fffbeb" },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Dashboard" subtitle="Welcome back — here's today's overview" />
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
              {patients.map((p) => (
                <Link key={p.id} href={`/patients/${p.id}`} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors group">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
                    {p.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{p.fullName}</div>
                    <div className="text-xs text-slate-400 truncate">{p.chiefComplaint}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium" style={{ color: p.statusColor, background: p.statusBg }}>{p.status}</span>
                    <div className="text-xs text-slate-400 mt-1">{p.department}</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0 w-24 justify-end">
                    <Clock size={11} />{formatDate(p.encounterDate)}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* MCP Tools */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">MCP Tools</h2>
              <p className="text-xs text-slate-400">Available agent capabilities</p>
            </div>
            <div className="px-4 py-3 space-y-1">
              {mcpTools.map(({ icon: Icon, label, desc, color }) => (
                <div key={label} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${color}15` }}>
                    <Icon size={16} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-600 font-mono">{label}</div>
                    <div className="text-xs text-slate-400 leading-tight mt-0.5">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mx-4 mb-4 mt-2 rounded-xl p-4" style={{ background: "#f0fdf4" }}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={14} className="text-green-500" />
                <span className="text-xs font-semibold text-green-700">MCP Server Ready</span>
              </div>
              {["list_clinical_notes", "get_clinical_note", "extract_section"].map((tool) => (
                <div key={tool} className="flex items-center justify-between mb-1 last:mb-0">
                  <span className="text-xs text-slate-500 font-mono">{tool}</span>
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    ready
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
