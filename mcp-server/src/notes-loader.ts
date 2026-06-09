import fs from "fs";
import path from "path";
import { ClinicalNote } from "./types";

export function listNoteFiles(root: string): string[] {
  return fs
    .readdirSync(root)
    .filter((f) => f.endsWith(".json"))
    .sort();
}

export function loadNoteFile(root: string, filename: string): ClinicalNote {
  const resolved = path.resolve(root, filename);
  if (!resolved.startsWith(path.resolve(root))) {
    throw new Error("Path traversal attempt blocked");
  }
  const raw = fs.readFileSync(resolved, "utf-8");
  return JSON.parse(raw) as ClinicalNote;
}

export function loadAllNotes(
  root: string,
): Array<{ filename: string; note: ClinicalNote }> {
  return listNoteFiles(root).map((filename) => ({
    filename,
    note: loadNoteFile(root, filename),
  }));
}

export function findByMrn(
  root: string,
  mrn: string,
): { filename: string; note: ClinicalNote } | null {
  const files = listNoteFiles(root);
  for (const filename of files) {
    const note = loadNoteFile(root, filename);
    if (note.patient?.mrn === mrn) {
      return { filename, note };
    }
  }
  return null;
}

export function resolveNote(
  root: string,
  filename?: string,
  mrn?: string,
): { filename: string; note: ClinicalNote } | null {
  if (filename) {
    try {
      return { filename, note: loadNoteFile(root, filename) };
    } catch {
      return null;
    }
  }
  if (mrn) {
    return findByMrn(root, mrn);
  }
  return null;
}

export function getPath(obj: unknown, dotPath: string): unknown {
  return dotPath.split(".").reduce<unknown>((cur, key) => {
    if (cur && typeof cur === "object" && key in (cur as Record<string, unknown>)) {
      return (cur as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}
