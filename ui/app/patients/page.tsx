"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import {
  Search,
  Filter,
  ArrowUpRight,
  User,
  CalendarDays,
  Stethoscope,
  Pill,
} from "lucide-react";

interface Patient {
  id: string;
  fullName: string;
  dateOfBirth: string;
  ageYears: number;
  sexAtBirth: string;
  mrn: string;
  encounterDate: string;
  encounterType: string;
  chiefComplaint: string;
  provider: string;
  department: string;
  assessments: { problem: string; status: string; icd10: string }[];
  medications: { name: string; status: string }[];
  status: string;
}

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  pediatric_primary_care: { label: "Pediatrics", color: "#d97706", bg: "#fef3c7" },
  outpatient_clinic: { label: "Outpatient", color: "#16a34a", bg: "#dcfce7" },
  inpatient_hospital: { label: "Inpatient", color: "#dc2626", bg: "#fee2e2" },
  outpatient_orthopedic_clinic: { label: "Orthopedics", color: "#0891b2", bg: "#cffafe" },
  outpatient_psychiatry_clinic: { label: "Psychiatry", color: "#7c3aed", bg: "#ede9fe" },
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/patients")
      .then((r) => r.json())
      .then((data) => { setPatients(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = patients.filter(
    (p) =>
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.mrn.toLowerCase().includes(search.toLowerCase()) ||
      p.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Patients" subtitle={`${patients.length} patients on record`} />
      <main className="flex-1 p-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-5">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, MRN, department..."
              className="pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-80 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <Filter size={14} />
            Filter
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading patients...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((p) => {
              const statusInfo = statusMap[p.status] ?? { label: p.status, color: "#64748b", bg: "#f1f5f9" };
              const initials = p.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
              return (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-5 hover:shadow-md transition-shadow group">
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}
                  >
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-base font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {p.fullName}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ color: statusInfo.color, background: statusInfo.bg }}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{p.mrn}</p>
                      </div>
                      <Link
                        href={`/patients/${p.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 border border-blue-100 hover:bg-blue-50 transition-colors flex-shrink-0"
                      >
                        View Record <ArrowUpRight size={12} />
                      </Link>
                    </div>

                    <div className="mt-3 grid grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <User size={13} className="text-slate-400 flex-shrink-0" />
                        <div>
                          <div className="text-xs text-slate-400">Age / Sex</div>
                          <div className="text-xs font-medium text-slate-700">{p.ageYears}y — {p.sexAtBirth}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays size={13} className="text-slate-400 flex-shrink-0" />
                        <div>
                          <div className="text-xs text-slate-400">Last Encounter</div>
                          <div className="text-xs font-medium text-slate-700">
                            {new Date(p.encounterDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 col-span-1">
                        <Stethoscope size={13} className="text-slate-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs text-slate-400">Chief Complaint</div>
                          <div className="text-xs font-medium text-slate-700 truncate">{p.chiefComplaint}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Pill size={13} className="text-slate-400 flex-shrink-0" />
                        <div>
                          <div className="text-xs text-slate-400">Medications</div>
                          <div className="text-xs font-medium text-slate-700">{p.medications.length} active</div>
                        </div>
                      </div>
                    </div>

                    {/* Assessments */}
                    {p.assessments.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {p.assessments.slice(0, 3).map((a) => (
                          <span key={a.icd10} className="px-2 py-0.5 rounded-lg text-xs bg-slate-100 text-slate-600 border border-slate-200">
                            {a.icd10} — {a.problem}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
