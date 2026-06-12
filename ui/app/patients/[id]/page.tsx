"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import {
  ChevronLeft,
  User,
  CalendarDays,
  Stethoscope,
  Pill,
  Activity,
  AlertCircle,
  FileText,
  ClipboardList,
  Salad,
  Heart,
  Phone,
} from "lucide-react";

interface ClinicalNote {
  patient: {
    fullName: string;
    dateOfBirth: string;
    ageYears: number;
    sexAtBirth: string;
    mrn: string;
    guardian?: { relationship: string; contactPhone: string };
  };
  encounter: {
    encounterId: string;
    dateTime: string;
    type: string;
    setting: string;
    chiefComplaint: string;
    provider: { name: string; department: string };
    duration: string;
  };
  clinicalNote: {
    subjective: string;
    objective: string;
    assessment: { problem: string; status: string; icd10: string }[];
    plan: string;
    patientInstructions: string;
  };
  structuredData: {
    allergies: { substance: string; reaction: string; severity: string }[];
    medications: { name: string; dose: string; route: string; frequency: string; status: string; indication: string }[];
    vitalSigns?: Record<string, string | number>;
    labResults?: { test: string; value: string; unit: string; flag: string }[];
    dietPlan?: {
      dailyCalories: number;
      macros: { protein: string; carbs: string; fat: string; fiber: string };
      mealSchedule: { meal: string; timing: string; foods: string[]; calories: number }[];
      restrictions: string[];
      hydration: string;
    };
    prescriptionPlan?: {
      medications: { name: string; dose: string; route: string; frequency: string; duration: string; instructions: string }[];
    };
  };
  agentContext?: {
    agentNotes?: string;
    riskFlags?: string[];
    nextSteps?: string[];
  };
}

function Section({ title, icon: Icon, color = "#3b82f6", children }: { title: string; icon: React.ElementType; color?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100" style={{ background: `${color}08` }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={15} style={{ color }} />
        </div>
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ClinicalNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "medications" | "diet" | "labs">("overview");

  useEffect(() => {
    fetch(`/api/patients/${id}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <TopBar title="Patient Record" />
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Loading...</div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="flex-1 flex flex-col">
        <TopBar title="Patient Record" />
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Patient not found.</div>
      </div>
    );
  }

  const { patient, encounter, clinicalNote, structuredData, agentContext } = data;
  const initials = patient.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const tabs = [
    { key: "overview", label: "Clinical Note", icon: FileText },
    { key: "medications", label: "Medications", icon: Pill },
    { key: "diet", label: "Diet Plan", icon: Salad },
    { key: "labs", label: "Lab Results", icon: Activity },
  ] as const;

  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Patient Record" subtitle={patient.fullName} />
      <main className="flex-1 p-6 space-y-5">
        {/* Back + Header */}
        <div>
          <Link href="/patients" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-500 transition-colors mb-4 w-fit">
            <ChevronLeft size={14} /> Back to Patients
          </Link>

          {/* Patient Hero Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-5">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}
                >
                  {initials}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{patient.fullName}</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{patient.mrn}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <User size={12} /> {patient.ageYears}y — {patient.sexAtBirth}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <CalendarDays size={12} /> DOB: {patient.dateOfBirth}
                    </span>
                    {patient.guardian && (
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Phone size={12} /> {patient.guardian.contactPhone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400">Encounter</div>
                <div className="text-sm font-medium text-slate-700 mt-0.5">{encounter.encounterId}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {new Date(encounter.dateTime).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{encounter.provider.name} · {encounter.provider.department}</div>
              </div>
            </div>

            {/* Quick stats row */}
            <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-slate-400">Chief Complaint</div>
                <div className="text-xs font-medium text-slate-700 mt-0.5 leading-relaxed">{encounter.chiefComplaint}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Encounter Type</div>
                <div className="text-xs font-medium text-slate-700 mt-0.5 capitalize">{encounter.type.replace(/_/g, " ")}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Duration</div>
                <div className="text-xs font-medium text-slate-700 mt-0.5">{encounter.duration}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Allergies</div>
                <div className="text-xs font-medium text-slate-700 mt-0.5">
                  {structuredData.allergies.filter((a) => a.substance !== "NKFA").length || "None known"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Risk Flags */}
        {agentContext?.riskFlags && agentContext.riskFlags.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
            <AlertCircle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs font-semibold text-amber-700 mb-1">Agent Risk Flags</div>
              <ul className="space-y-0.5">
                {agentContext.riskFlags.map((f, i) => (
                  <li key={i} className="text-xs text-amber-700">· {f}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-100 shadow-sm p-1 w-fit">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={tab === key ? { background: "#3b82f6", color: "white" } : { color: "#64748b" }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === "overview" && (
          <div className="grid grid-cols-2 gap-5">
            <Section title="Subjective" icon={ClipboardList} color="#3b82f6">
              <p className="text-sm text-slate-600 leading-relaxed">{clinicalNote.subjective}</p>
            </Section>
            <Section title="Objective" icon={Stethoscope} color="#0891b2">
              <p className="text-sm text-slate-600 leading-relaxed">{clinicalNote.objective}</p>
            </Section>
            <Section title="Assessment" icon={Heart} color="#dc2626">
              <ul className="space-y-2">
                {clinicalNote.assessment.map((a) => (
                  <li key={a.icd10} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                    <span className="px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-red-100 text-red-600">{a.icd10}</span>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-slate-700">{a.problem}</div>
                      <div className="text-xs text-slate-400 mt-0.5 capitalize">{a.status.replace(/_/g, " ")}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </Section>
            <div className="space-y-5">
              <Section title="Plan" icon={FileText} color="#7c3aed">
                <p className="text-sm text-slate-600 leading-relaxed">{clinicalNote.plan}</p>
              </Section>
              <Section title="Patient Instructions" icon={ClipboardList} color="#16a34a">
                <p className="text-sm text-slate-600 leading-relaxed">{clinicalNote.patientInstructions}</p>
              </Section>
            </div>
          </div>
        )}

        {tab === "medications" && (
          <div className="space-y-3">
            {structuredData.medications.length === 0 ? (
              <div className="text-center text-slate-400 py-12 text-sm">No medications on record.</div>
            ) : (
              structuredData.medications.map((med, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#eff6ff" }}>
                    <Pill size={18} style={{ color: "#3b82f6" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-semibold text-slate-800 capitalize">{med.name}</h4>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={med.status?.includes("active") ? { color: "#16a34a", background: "#dcfce7" } : { color: "#64748b", background: "#f1f5f9" }}
                      >
                        {med.status?.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 capitalize">{med.indication}</p>
                    <div className="mt-2 flex flex-wrap gap-3">
                      {med.dose && <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">Dose: {med.dose}</span>}
                      {med.route && <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg capitalize">Route: {med.route}</span>}
                      {med.frequency && <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">Freq: {med.frequency}</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "diet" && (
          <div>
            {!structuredData.dietPlan ? (
              <div className="text-center text-slate-400 py-12 text-sm">No diet plan available for this patient.</div>
            ) : (
              <div className="space-y-5">
                {/* Macros */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">Daily Nutrition Targets</h3>
                  <div className="grid grid-cols-5 gap-4">
                    <div className="text-center p-3 rounded-xl" style={{ background: "#eff6ff" }}>
                      <div className="text-xl font-bold text-blue-600">{structuredData.dietPlan.dailyCalories}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Calories</div>
                    </div>
                    {Object.entries(structuredData.dietPlan.macros).map(([k, v]) => (
                      <div key={k} className="text-center p-3 rounded-xl bg-slate-50">
                        <div className="text-lg font-bold text-slate-700">{v}</div>
                        <div className="text-xs text-slate-500 mt-0.5 capitalize">{k}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Meal Schedule */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">Meal Schedule</h3>
                  <div className="space-y-3">
                    {structuredData.dietPlan.mealSchedule.map((meal, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100">
                        <div className="text-center w-20 flex-shrink-0">
                          <div className="text-sm font-semibold text-slate-700 capitalize">{meal.meal}</div>
                          <div className="text-xs text-slate-400">{meal.timing}</div>
                          <div className="text-xs font-medium text-blue-600 mt-1">{meal.calories} kcal</div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {meal.foods.map((f, fi) => (
                            <span key={fi} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-xs">{f}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Restrictions */}
                {structuredData.dietPlan.restrictions.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Dietary Restrictions</h3>
                    <div className="flex flex-wrap gap-2">
                      {structuredData.dietPlan.restrictions.map((r, i) => (
                        <span key={i} className="px-3 py-1 rounded-xl text-xs font-medium" style={{ background: "#fee2e2", color: "#dc2626" }}>{r}</span>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                      <Activity size={13} />
                      Hydration: {structuredData.dietPlan.hydration}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "labs" && (
          <div>
            {!structuredData.labResults || structuredData.labResults.length === 0 ? (
              <div className="text-center text-slate-400 py-12 text-sm">No lab results on record.</div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Test</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Value</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {structuredData.labResults.map((lab, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 text-slate-700 font-medium">{lab.test}</td>
                        <td className="px-5 py-3 text-slate-600">{lab.value}</td>
                        <td className="px-5 py-3 text-slate-400">{lab.unit}</td>
                        <td className="px-5 py-3">
                          {lab.flag ? (
                            <span
                              className="px-2 py-0.5 rounded-full text-xs font-medium"
                              style={lab.flag === "normal" ? { color: "#16a34a", background: "#dcfce7" } : { color: "#dc2626", background: "#fee2e2" }}
                            >
                              {lab.flag}
                            </span>
                          ) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
