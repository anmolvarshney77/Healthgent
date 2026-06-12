import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const NOTES_DIR = path.resolve(process.cwd(), "../clinical-notes");

export async function GET() {
  try {
    const files = fs.readdirSync(NOTES_DIR).filter((f) => f.endsWith(".json"));
    const patients = files.map((file) => {
      const raw = fs.readFileSync(path.join(NOTES_DIR, file), "utf-8");
      const data = JSON.parse(raw);
      return {
        id: file.replace("_clinical_note.json", ""),
        fullName: data.patient?.fullName ?? "Unknown",
        dateOfBirth: data.patient?.dateOfBirth ?? "",
        ageYears: data.patient?.ageYears ?? 0,
        sexAtBirth: data.patient?.sexAtBirth ?? "",
        mrn: data.patient?.mrn ?? "",
        encounterDate: data.encounter?.dateTime ?? "",
        encounterType: data.encounter?.type ?? "",
        chiefComplaint: data.encounter?.chiefComplaint ?? "",
        provider: data.encounter?.provider?.name ?? "",
        department: data.encounter?.provider?.department ?? "",
        assessments: data.clinicalNote?.assessment ?? [],
        medications: data.structuredData?.medications ?? [],
        status: data.encounter?.setting ?? "",
      };
    });
    return NextResponse.json(patients);
  } catch {
    return NextResponse.json({ error: "Failed to load patients" }, { status: 500 });
  }
}
