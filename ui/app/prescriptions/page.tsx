"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import { Pill, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface MedEntry {
  patientId: string;
  patientName: string;
  mrn: string;
  name: string;
  dose: string;
  route: string;
  frequency: string;
  status: string;
  indication: string;
}

export default function PrescriptionsPage() {
  const [meds, setMeds] = useState<MedEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/patients")
      .then((r) => r.json())
      .then((patients: { id: string; fullName: string; mrn: string; medications: { name: string; dose: string; route: string; frequency: string; status: string; indication: string }[] }[]) => {
        const all: MedEntry[] = [];
        patients.forEach((p) => {
          p.medications.forEach((m) => {
            all.push({ patientId: p.id, patientName: p.fullName, mrn: p.mrn, ...m });
          });
        });
        setMeds(all);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const active = meds.filter((m) => m.status?.includes("active"));
  const inactive = meds.filter((m) => !m.status?.includes("active"));

  const MedCard = ({ m }: { m: MedEntry }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#eff6ff" }}>
        <Pill size={16} style={{ color: "#3b82f6" }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-800 capitalize truncate">{m.name}</div>
            <div className="text-xs text-slate-500 mt-0.5 capitalize">{m.indication}</div>
          </div>
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
            style={m.status?.includes("active") ? { color: "#16a34a", background: "#dcfce7" } : { color: "#64748b", background: "#f1f5f9" }}
          >
            {m.status?.replace(/_/g, " ")}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {m.dose && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg">Dose: {m.dose}</span>}
          {m.route && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg capitalize">{m.route}</span>}
          {m.frequency && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg">{m.frequency}</span>}
        </div>
        <Link href={`/patients/${m.patientId}`} className="flex items-center gap-1 mt-2 text-xs text-blue-500 hover:text-blue-600 w-fit">
          {m.patientName} <ArrowUpRight size={10} />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Prescriptions" subtitle={`${active.length} active · ${inactive.length} inactive`} />
      <main className="flex-1 p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading...</div>
        ) : (
          <>
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Active Medications ({active.length})</h2>
              <div className="grid grid-cols-2 gap-3">
                {active.map((m, i) => <MedCard key={i} m={m} />)}
              </div>
            </div>
            {inactive.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-400 mb-3">Inactive / Completed ({inactive.length})</h2>
                <div className="grid grid-cols-2 gap-3">
                  {inactive.map((m, i) => <MedCard key={i} m={m} />)}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
