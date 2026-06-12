import TopBar from "@/components/TopBar";
import { Server, Shield, Bell, Database, Brain } from "lucide-react";

const mcpServers = [
  { name: "HistoryServer", desc: "Retrieves longitudinal patient health records via FHIR", status: "online", color: "#7c3aed" },
  { name: "TreatmentBot", desc: "Manages ongoing procedure tracking and medication schedules", status: "online", color: "#3b82f6" },
  { name: "WellnessServer", desc: "Computes diet and lifestyle recommendations", status: "online", color: "#0891b2" },
  { name: "MonitorBot", desc: "Real-time vital sign monitoring and alerting", status: "idle", color: "#16a34a" },
];

export default function SettingsPage() {
  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Settings" subtitle="System configuration and MCP server management" />
      <main className="flex-1 p-6 space-y-6 max-w-3xl">
        {/* MCP Servers */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
            <Brain size={16} className="text-blue-500" />
            <h2 className="text-sm font-semibold text-slate-700">MCP Servers</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {mcpServers.map((srv) => (
              <div key={srv.name} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${srv.color}15` }}>
                    <Server size={15} style={{ color: srv.color }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-700">{srv.name}</div>
                    <div className="text-xs text-slate-400">{srv.desc}</div>
                  </div>
                </div>
                <span
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                  style={srv.status === "online" ? { color: "#16a34a", background: "#dcfce7" } : { color: "#64748b", background: "#f1f5f9" }}
                >
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${srv.status === "online" ? "bg-green-500 animate-pulse" : "bg-slate-400"}`} />
                  {srv.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
            <Shield size={16} className="text-blue-500" />
            <h2 className="text-sm font-semibold text-slate-700">Security & Compliance</h2>
          </div>
          <div className="px-6 py-4 space-y-3">
            {[
              { label: "HIPAA Compliance Mode", desc: "Strict data access controls via MCP tool-based architecture", enabled: true },
              { label: "OAuth 2.0 / JWT Auth", desc: "Secure authentication for all external agent handshakes", enabled: true },
              { label: "Audit Logging", desc: "Every agent action traced back to its source tool", enabled: true },
              { label: "Data Encryption at Rest", desc: "AES-256 encryption for all stored patient data", enabled: false },
            ].map(({ label, desc, enabled }) => (
              <div key={label} className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm font-medium text-slate-700">{label}</div>
                  <div className="text-xs text-slate-400">{desc}</div>
                </div>
                <div
                  className="w-10 h-5 rounded-full flex items-center px-0.5 cursor-pointer"
                  style={{ background: enabled ? "#3b82f6" : "#e2e8f0" }}
                >
                  <div
                    className="w-4 h-4 rounded-full bg-white shadow-sm transition-transform"
                    style={{ transform: enabled ? "translateX(20px)" : "translateX(0)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
            <Bell size={16} className="text-blue-500" />
            <h2 className="text-sm font-semibold text-slate-700">Notifications</h2>
          </div>
          <div className="px-6 py-4 space-y-3">
            {[
              { label: "Critical Alert Notifications", enabled: true },
              { label: "Agent Activity Feed", enabled: true },
              { label: "Medication Reminders", enabled: false },
              { label: "Lab Result Alerts", enabled: true },
            ].map(({ label, enabled }) => (
              <div key={label} className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-700">{label}</span>
                <div className="w-10 h-5 rounded-full flex items-center px-0.5 cursor-pointer" style={{ background: enabled ? "#3b82f6" : "#e2e8f0" }}>
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm transition-transform" style={{ transform: enabled ? "translateX(20px)" : "translateX(0)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
            <Database size={16} className="text-blue-500" />
            <h2 className="text-sm font-semibold text-slate-700">Data & Storage</h2>
          </div>
          <div className="px-6 py-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Clinical Notes Directory</span>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">../clinical-notes/</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Schema Version</span>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">1.0</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Transport Layer</span>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">SSE + stdio</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
