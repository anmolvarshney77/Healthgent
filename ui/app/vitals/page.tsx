"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import { Activity, Heart, Wind, Thermometer, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface VitalsEntry {
  patientId: string;
  patientName: string;
  mrn: string;
  vitalSigns: Record<string, string | number>;
}

const vitalIcons: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  heartRate: { icon: Heart, color: "#dc2626", bg: "#fee2e2", label: "Heart Rate" },
  bloodPressure: { icon: Activity, color: "#3b82f6", bg: "#eff6ff", label: "Blood Pressure" },
  respiratoryRate: { icon: Wind, color: "#0891b2", bg: "#ecfeff", label: "Resp. Rate" },
  temperature: { icon: Thermometer, color: "#d97706", bg: "#fffbeb", label: "Temperature" },
  oxygenSaturation: { icon: Activity, color: "#7c3aed", bg: "#f5f3ff", label: "SpO2" },
  weight: { icon: Activity, color: "#16a34a", bg: "#f0fdf4", label: "Weight" },
  height: { icon: Activity, color: "#64748b", bg: "#f8fafc", label: "Height" },
  bmi: { icon: Activity, color: "#64748b", bg: "#f8fafc", label: "BMI" },
};

export default function VitalsPage() {
  const [vitals, setVitals] = useState<VitalsEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/patients")
      .then((r) => r.json())
      .then((patients: { id: string; fullName: string; mrn: string }[]) => {
        Promise.all(
          patients.map((p) =>
            fetch(`/api/patients/${p.id}`)
              .then((r) => r.json())
              .then((d) => {
                if (d.structuredData?.vitalSigns) {
                  return { patientId: p.id, patientName: p.fullName, mrn: p.mrn, vitalSigns: d.structuredData.vitalSigns } as VitalsEntry;
                }
                return null;
              })
          )
        ).then((results) => {
          setVitals(results.filter(Boolean) as VitalsEntry[]);
          setLoading(false);
        });
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Vitals & Monitoring" subtitle="Patient vital signs from latest encounters" />
      <main className="flex-1 p-6 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading...</div>
        ) : vitals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Activity size={40} className="text-slate-300" />
            <p className="text-slate-400 text-sm">No vital signs recorded yet.</p>
          </div>
        ) : (
          vitals.map((entry) => (
            <div key={entry.patientId} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
                    {entry.patientName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{entry.patientName}</div>
                    <div className="text-xs text-slate-400">{entry.mrn}</div>
                  </div>
                </div>
                <Link href={`/patients/${entry.patientId}`} className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium">
                  Full Record <ArrowUpRight size={12} />
                </Link>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(entry.vitalSigns).map(([key, value]) => {
                  const info = vitalIcons[key] ?? { icon: Activity, color: "#64748b", bg: "#f8fafc", label: key };
                  const Icon = info.icon;
                  return (
                    <div key={key} className="p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: info.bg }}>
                        <Icon size={15} style={{ color: info.color }} />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">{info.label}</div>
                        <div className="text-sm font-semibold text-slate-700">{String(value)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
