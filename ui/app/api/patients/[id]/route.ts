import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const NOTES_DIR = path.resolve(process.cwd(), "../clinical-notes");

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const file = path.join(NOTES_DIR, `${id}_clinical_note.json`);
    const raw = fs.readFileSync(file, "utf-8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }
}
