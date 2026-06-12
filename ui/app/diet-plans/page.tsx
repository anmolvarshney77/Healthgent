"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import { Salad, Flame, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface DietEntry {
  patientId: string;
  patientName: string;
  mrn: string;
  dailyCalories: number;
  macros: Record<string, string>;
  mealSchedule: { meal: string; timing: string; foods: string[]; calories: number }[];
  restrictions: string[];
  hydration: string;
}

export default function DietPlansPage() {
  const [plans, setPlans] = useState<DietEntry[]>([]);
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
                if (d.structuredData?.dietPlan) {
                  return { patientId: p.id, patientName: p.fullName, mrn: p.mrn, ...d.structuredData.dietPlan } as DietEntry;
                }
                return null;
              })
          )
        ).then((results) => {
          setPlans(results.filter(Boolean) as DietEntry[]);
          setLoading(false);
        });
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Diet Plans" subtitle={`${plans.length} personalized plans generated`} />
      <main className="flex-1 p-6 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading...</div>
        ) : plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Salad size={40} className="text-slate-300" />
            <p className="text-slate-400 text-sm">No diet plans generated yet.</p>
            <p className="text-slate-400 text-xs">Run the HealthGent WellnessServer agent to generate plans.</p>
          </div>
        ) : (
          plans.map((plan) => (
            <div key={plan.patientId} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#f0fdf4" }}>
                    <Salad size={18} style={{ color: "#16a34a" }} />
                  </div>
                  <div>
                    <div className="text-base font-semibold text-slate-800">{plan.patientName}</div>
                    <div className="text-xs text-slate-400">{plan.mrn}</div>
                  </div>
                </div>
                <Link href={`/patients/${plan.patientId}`} className="flex items-center gap-1 text-xs text-blue-500 font-medium hover:text-blue-600">
                  Full Record <ArrowUpRight size={12} />
                </Link>
              </div>

              {/* Calorie / Macros */}
              <div className="grid grid-cols-5 gap-3 mb-5">
                <div className="text-center p-3 rounded-xl" style={{ background: "#eff6ff" }}>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Flame size={14} style={{ color: "#3b82f6" }} />
                  </div>
                  <div className="text-xl font-bold text-blue-600">{plan.dailyCalories}</div>
                  <div className="text-xs text-slate-500">kcal/day</div>
                </div>
                {Object.entries(plan.macros).map(([k, v]) => (
                  <div key={k} className="text-center p-3 rounded-xl bg-slate-50">
                    <div className="text-lg font-bold text-slate-700">{v}</div>
                    <div className="text-xs text-slate-500 capitalize">{k}</div>
                  </div>
                ))}
              </div>

              {/* Meals */}
              <div className="space-y-2">
                {plan.mealSchedule.map((meal, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 rounded-xl border border-slate-100">
                    <div className="w-20 flex-shrink-0 text-center">
                      <div className="text-xs font-semibold text-slate-700 capitalize">{meal.meal}</div>
                      <div className="text-xs text-slate-400">{meal.timing}</div>
                      <div className="text-xs font-medium text-green-600 mt-0.5">{meal.calories} kcal</div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {meal.foods.map((f, fi) => (
                        <span key={fi} className="text-xs px-2 py-0.5 bg-slate-100 rounded-lg text-slate-600">{f}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {plan.restrictions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                  {plan.restrictions.map((r, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-lg font-medium" style={{ background: "#fee2e2", color: "#dc2626" }}>{r}</span>
                  ))}
                  <span className="text-xs text-slate-400 ml-2 flex items-center">💧 {plan.hydration}</span>
                </div>
              )}
            </div>
          ))
        )}
      </main>
    </div>
  );
}
