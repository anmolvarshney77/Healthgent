#!/usr/bin/env python3
"""Build one PDF summarizing medications and diet-related counseling for every clinical-note PDF.

Reads ``clinical-notes/*_clinical_note.pdf`` (text extracted via pypdf). Source JSON fixtures
are preferred when present; this script supports repos that only retain exported PDFs.

Demo / educational output only — not clinical advice.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

from pypdf import PdfReader

from json_clinical_note_to_pdf import NotePDF, ascii_safe

DIET_KEYWORDS = re.compile(
    r"\b(diet|dietary|nutrition|mnt|meal|meals|sodium|salt|calorie|"
    r"carb|carbohydrate|sugar|fiber|fat|protein|fasting|food|foods|"
    r"eat|eating|hydration|water|alcohol|caffeine|weight|bmi|obes|"
    r"overweight|lifestyle|activity|exercise|walk|walking)\b",
    re.IGNORECASE,
)


def extract_text_from_pdf(path: Path) -> str:
    reader = PdfReader(str(path))
    parts: list[str] = []
    for page in reader.pages:
        parts.append(page.extract_text() or "")
    return "\n".join(parts)


def extract_block(text: str, start: str, end: str) -> str:
    i = text.find(start)
    if i < 0:
        return ""
    i += len(start)
    j = text.find(end, i)
    if j < 0:
        return text[i:].strip()
    return text[i:j].strip()


def extract_subjective(text: str) -> str:
    return extract_block(text, "Subjective\n", "Objective\n")


def extract_plan(text: str) -> str:
    return extract_block(text, "Plan\n", "Patient instructions\n")


def extract_patient_instructions(text: str) -> str:
    return extract_block(text, "Patient instructions\n", "Structured data\n")


def extract_medication_lines(text: str) -> str:
    idx = text.find("Medications\n")
    if idx < 0:
        return ""
    idx += len("Medications\n")
    lines_out: list[str] = []
    icd_line = re.compile(r"^-\s+.+\s\([A-Z][0-9][A-Z0-9.]*\)\s+-\s+")
    section_stop = re.compile(
        r"^(Vitals|Agent context|Other structured items|Structured data)\b"
    )
    for raw in text[idx:].splitlines():
        line = raw.strip()
        if not line:
            continue
        if line.startswith("Conditions") and not line.startswith("- "):
            break
        if line.startswith("- ") and icd_line.match(line):
            break
        if line.startswith("- "):
            line = re.sub(r"Conditions\s*$", "", line).rstrip()
            if line.endswith("-"):
                line = line[:-1].rstrip()
            lines_out.append(line)
        elif lines_out and not section_stop.match(line):
            # PDF text extraction often wraps "[status] - indication" onto the next line.
            lines_out[-1] = f"{lines_out[-1]} {line}".strip()
        elif section_stop.match(line):
            break
    return "\n".join(lines_out)


def diet_snippets_from_text(label: str, body: str) -> list[tuple[str, str]]:
    if not body:
        return []
    out: list[tuple[str, str]] = []
    for para in re.split(r"\n\s*\n", body):
        para = " ".join(para.split())
        if not para:
            continue
        if DIET_KEYWORDS.search(para):
            out.append((label, para))
    return out


def patient_banner(text: str) -> str:
    name = ""
    mrn = ""
    enc_date = ""
    for line in text.splitlines():
        if line.startswith("Name:"):
            name = line.split(":", 1)[1].strip()
        elif line.startswith("MRN:"):
            mrn = line.split(":", 1)[1].strip()
        elif line.startswith("Date/Time:"):
            enc_date = line.split(":", 1)[1].strip()
    parts = [p for p in (name, mrn, enc_date) if p]
    return " | ".join(parts) if parts else "(patient header not found)"


def build_combined_pdf(pdf_paths: list[Path], out_path: Path) -> None:
    doc = NotePDF()
    doc.add_page()
    doc.set_font("Helvetica", "B", 16)
    doc.multi_cell(doc.epw, 8, ascii_safe("Prescription and diet-related counseling summary"))
    doc.ln(2)
    doc.set_font("Helvetica", "", 9)
    doc.multi_cell(
        doc.epw,
        4,
        ascii_safe(
            "Synthetic demo data only. This PDF is not medical advice, not a legal prescription, "
            "and not a substitute for a licensed clinician. Content is recapitulated from "
            "clinical-notes PDF exports for the listed encounter only."
        ),
    )
    doc.ln(3)

    for path in pdf_paths:
        raw = extract_text_from_pdf(path)
        banner = patient_banner(raw)
        meds = extract_medication_lines(raw)
        plan = extract_plan(raw)
        subjective = extract_subjective(raw)
        instructions = extract_patient_instructions(raw)

        diet_rows: list[tuple[str, str]] = []
        diet_rows.extend(diet_snippets_from_text("Subjective", subjective))
        diet_rows.extend(diet_snippets_from_text("Plan", plan))
        diet_rows.extend(diet_snippets_from_text("Patient instructions", instructions))

        doc.set_font("Helvetica", "B", 12)
        doc.multi_cell(doc.epw, 7, ascii_safe(f"Patient: {banner}"))
        doc.set_font("Helvetica", "", 8)
        doc.multi_cell(doc.epw, 4, ascii_safe(f"Source PDF: {path.name}"))
        doc.ln(1)

        doc.set_font("Helvetica", "B", 10)
        doc.multi_cell(doc.epw, 5, ascii_safe("Medications (as documented in structured data)"))
        doc.set_font("Helvetica", "", 10)
        doc.multi_cell(doc.epw, 5, ascii_safe(meds if meds else "Not listed in extracted text."))
        doc.ln(1)

        doc.set_font("Helvetica", "B", 10)
        doc.multi_cell(doc.epw, 5, ascii_safe("Visit plan (medications, orders, follow-up)"))
        doc.set_font("Helvetica", "", 10)
        doc.multi_cell(doc.epw, 5, ascii_safe(plan if plan else "Not found in extracted text."))
        doc.ln(1)

        doc.set_font("Helvetica", "B", 10)
        doc.multi_cell(
            doc.epw,
            5,
            ascii_safe("Diet, nutrition, and related lifestyle (fixture text only)"),
        )
        doc.set_font("Helvetica", "", 10)
        if diet_rows:
            for section, sentence in diet_rows:
                doc.multi_cell(doc.epw, 5, ascii_safe(f"[{section}] {sentence}"))
        else:
            doc.multi_cell(
                doc.epw,
                5,
                ascii_safe(
                    "No diet or nutrition-related wording matched the note excerpt (or section missing)."
                ),
            )
        doc.ln(4)

    doc.output(str(out_path))


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    notes_dir = root / "clinical-notes"
    if not notes_dir.is_dir():
        print(f"Missing directory: {notes_dir}", file=sys.stderr)
        return 1

    pdf_files = sorted(notes_dir.glob("*_clinical_note.pdf"))
    if not pdf_files:
        print(f"No *_clinical_note.pdf files in {notes_dir}", file=sys.stderr)
        return 1

    out = notes_dir / "all_patients_prescription_and_diet_plan.pdf"
    build_combined_pdf(pdf_files, out)
    print(f"Wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
