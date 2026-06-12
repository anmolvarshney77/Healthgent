"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { FileText, ArrowUpRight, CalendarDays, Stethoscope, User } from "lucide-react";

interface PatientSummary {
  id: string;
  fullName: string;
  mrn: string;
  ageYears: number;
  sexAtBirth: string;
  encounterDate: string;
  chiefComplaint: string;
  provider: string;
  department: string;
  assessments: { problem: string; icd10: string }[];
}

export default function ClinicalNotesPage() {
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/patients")
      .then((r) => r.json())
      .then((d) => { setPatients(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Clinical Notes" subtitle={`${patients.length} notes on record`} />
      <main className="flex-1 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {patients.map((p) => {
              const initials = p.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
              return (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}
                      >
                        {initials}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{p.fullName}</div>
                        <div className="text-xs text-slate-400">{p.mrn}</div>
                      </div>
                    </div>
                    <Link
                      href={`/patients/${p.id}`}
                      className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium"
                    >
                      Open <ArrowUpRight size={12} />
                    </Link>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <FileText size={12} className="text-blue-400" />
                      <span className="font-medium text-slate-600 truncate">{p.chiefComplaint}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <CalendarDays size={12} className="text-slate-400" />
                      {new Date(p.encounterDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Stethoscope size={12} className="text-slate-400" />
                      {p.provider} · {p.department}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <User size={12} className="text-slate-400" />
                      {p.ageYears}y — {p.sexAtBirth}
                    </div>
                  </div>

                  {p.assessments.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {p.assessments.map((a) => (
                        <span key={a.icd10} className="px-2 py-0.5 text-xs rounded-lg bg-slate-100 text-slate-600">
                          {a.icd10} · {a.problem}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
