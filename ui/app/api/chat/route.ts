import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const NOTES_DIR = path.resolve(process.cwd(), "../clinical-notes");
const LYZR_API_KEY = process.env.LYZR_API_KEY!;
const LYZR_AGENT_ID = process.env.LYZR_AGENT_ID!;

function loadPatientContext(patientId: string): string {
  try {
    const file = path.join(NOTES_DIR, `${patientId}_clinical_note.json`);
    const data = JSON.parse(fs.readFileSync(file, "utf-8"));
    const p = data.patient ?? {};
    const enc = data.encounter ?? {};
    const note = data.clinicalNote ?? {};
    const sd = data.structuredData ?? {};
    const meds = (sd.medications ?? []).map((m: { name: string; dose?: string; frequency?: string }) => `${m.name} ${m.dose ?? ""} ${m.frequency ?? ""}`.trim()).join(", ");
    const assessments = (note.assessment ?? []).map((a: { problem: string; icdCode?: string }) => `${a.problem}${a.icdCode ? ` (${a.icdCode})` : ""}`).join("; ");
    const flags = (data.agentContext?.safetyFlags ?? []).join(", ");
    return [
      `PATIENT CONTEXT (use this to answer the question):`,
      `Name: ${p.fullName ?? "Unknown"} | MRN: ${p.mrn ?? "N/A"} | Age: ${p.ageYears ?? "?"} | Sex: ${p.sexAtBirth ?? "?"}`,
      `Encounter: ${enc.dateTime ?? ""} | Type: ${enc.type ?? ""} | Chief complaint: ${enc.chiefComplaint ?? ""}`,
      `Diagnoses: ${assessments}`,
      `Medications: ${meds || "None documented"}`,
      `Safety flags: ${flags || "None"}`,
      `Subjective: ${note.subjective ?? ""}`,
      `Plan: ${note.plan ?? ""}`,
    ].join("\n");
  } catch {
    return "No patient context available.";
  }
}

export async function POST(req: NextRequest) {
  const { patientId, sessionId, message } = await req.json();

  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const context = patientId ? loadPatientContext(patientId) : "";
  const fullMessage = context ? `${context}\n\nQuestion: ${message}` : message;

  const lyzrRes = await fetch("https://agent.api.lyzr.app/v3/inference/chat/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": LYZR_API_KEY,
    },
    body: JSON.stringify({
      agent_id: LYZR_AGENT_ID,
      session_id: sessionId ?? "default",
      message: fullMessage,
    }),
  });

  if (!lyzrRes.ok) {
    const err = await lyzrRes.text();
    return NextResponse.json({ error: `Lyzr API error: ${err}` }, { status: 502 });
  }

  const data = await lyzrRes.json();
  const reply = data?.response ?? data?.message ?? data?.output ?? JSON.stringify(data);
  return NextResponse.json({ reply });
}
