#!/usr/bin/env python3
"""Render clinical-note JSON files as printable PDFs (core fonts, ASCII-safe text)."""

from __future__ import annotations

import json
import sys
from pathlib import Path

from fpdf import FPDF


def ascii_safe(text: object) -> str:
    if text is None:
        return ""
    s = str(text)
    s = s.replace("\u2014", "-").replace("\u2013", "-").replace("\u00b0", " deg ")
    s = s.replace("\u201c", '"').replace("\u201d", '"').replace("\u2019", "'")
    return s.encode("ascii", "replace").decode("ascii")


class NotePDF(FPDF):
    def __init__(self) -> None:
        super().__init__(format="Letter")
        self.set_auto_page_break(auto=True, margin=18)
        self.set_margins(18, 18, 18)

    def _w(self) -> float:
        return float(self.epw)

    def section_title(self, title: str) -> None:
        self.set_font("Helvetica", "B", 12)
        self.multi_cell(self._w(), 7, ascii_safe(title))
        self.ln(1)

    def body(self, text: str) -> None:
        self.set_font("Helvetica", "", 10)
        self.multi_cell(self._w(), 5, ascii_safe(text))
        self.ln(2)

    def kv_block(self, rows: list[tuple[str, str]]) -> None:
        self.set_font("Helvetica", "", 10)
        w = self._w()
        for k, v in rows:
            line = f"{k}: {v}"
            self.multi_cell(w, 5, ascii_safe(line))
        self.ln(2)


def build_pdf(data: dict) -> NotePDF:
    pdf = NotePDF()
    pdf.add_page()

    pdf.set_font("Helvetica", "B", 16)
    pdf.multi_cell(pdf._w(), 8, "Clinical Note")
    pdf.ln(2)

    p = data.get("patient") or {}
    pdf.section_title("Patient")
    g = p.get("guardian") or {}
    pdf.kv_block(
        [
            ("Name", p.get("fullName", "")),
            ("DOB", p.get("dateOfBirth", "")),
            ("Sex", p.get("sexAtBirth", "")),
            ("Age (years)", str(p.get("ageYears", ""))),
            ("MRN", p.get("mrn", "")),
        ]
        + (
            [("Guardian", f"{g.get('relationship', '')} ({g.get('contactPhone', '')})")]
            if g
            else []
        )
    )

    e = data.get("encounter") or {}
    prov = e.get("provider") or {}
    pdf.section_title("Encounter")
    pdf.kv_block(
        [
            ("Encounter ID", e.get("encounterId", "")),
            ("Date/Time", e.get("dateTime", "")),
            ("Type", e.get("type", "")),
            ("Setting", e.get("setting", "")),
            ("Chief complaint", e.get("chiefComplaint", "")),
            ("Provider", prov.get("name", "")),
            ("Department", prov.get("department", "")),
        ]
    )

    cn = data.get("clinicalNote") or {}
    w = pdf._w()
    pdf.section_title("Clinical note (SOAP)")
    pdf.set_font("Helvetica", "B", 10)
    pdf.multi_cell(w, 5, "Subjective")
    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(w, 5, ascii_safe(cn.get("subjective", "")))
    pdf.ln(1)
    pdf.set_font("Helvetica", "B", 10)
    pdf.multi_cell(w, 5, "Objective")
    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(w, 5, ascii_safe(cn.get("objective", "")))
    pdf.ln(1)

    pdf.set_font("Helvetica", "B", 10)
    pdf.multi_cell(w, 5, "Assessment")
    pdf.set_font("Helvetica", "", 10)
    for item in cn.get("assessment") or []:
        if not isinstance(item, dict):
            continue
        icd = item.get("icd10") or []
        icd_s = ", ".join(icd) if isinstance(icd, list) else str(icd)
        line = f"- {item.get('problem', '')} (status: {item.get('status', '')}; ICD-10: {icd_s})"
        pdf.multi_cell(w, 5, ascii_safe(line))
    pdf.ln(1)

    pdf.set_font("Helvetica", "B", 10)
    pdf.multi_cell(w, 5, "Plan")
    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(w, 5, ascii_safe(cn.get("plan", "")))
    pdf.ln(1)
    pdf.set_font("Helvetica", "B", 10)
    pdf.multi_cell(w, 5, "Patient instructions")
    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(w, 5, ascii_safe(cn.get("patientInstructions", "")))
    pdf.ln(2)

    sd = data.get("structuredData") or {}
    pdf.section_title("Structured data")

    pdf.set_font("Helvetica", "B", 10)
    pdf.multi_cell(w, 5, "Allergies")
    pdf.set_font("Helvetica", "", 10)
    for a in sd.get("allergies") or []:
        if isinstance(a, dict):
            pdf.multi_cell(
                w,
                5,
                ascii_safe(
                    f"- {a.get('substance', '')} "
                    f"(reaction: {a.get('reaction', '')}; severity: {a.get('severity', '')})"
                ),
            )
    pdf.ln(1)

    pdf.set_font("Helvetica", "B", 10)
    pdf.multi_cell(w, 5, "Medications")
    pdf.set_font("Helvetica", "", 10)
    for m in sd.get("medications") or []:
        if isinstance(m, dict):
            pdf.multi_cell(
                w,
                5,
                ascii_safe(
                    f"- {m.get('name', '')} {m.get('dose', '')} {m.get('route', '')} "
                    f"{m.get('frequency', '')} [{m.get('status', '')}] - {m.get('indication', '')}"
                ),
            )
    pdf.ln(1)

    pdf.set_font("Helvetica", "B", 10)
    pdf.multi_cell(w, 5, "Conditions")
    pdf.set_font("Helvetica", "", 10)
    for c in sd.get("conditions") or []:
        if isinstance(c, dict):
            pdf.multi_cell(
                w,
                5,
                ascii_safe(
                    f"- {c.get('name', '')} ({c.get('icd10', '')}) - {c.get('clinicalStatus', '')}"
                ),
            )
    pdf.ln(1)

    pdf.set_font("Helvetica", "B", 10)
    pdf.multi_cell(w, 5, "Vitals (most recent)")
    pdf.set_font("Helvetica", "", 10)
    vitals = sd.get("vitals") or []
    if vitals and isinstance(vitals[0], dict):
        v = vitals[0]
        parts = []
        if "bloodPressureSystolic" in v:
            parts.append(f"BP {v.get('bloodPressureSystolic')}/{v.get('bloodPressureDiastolic')}")
        if "heartRate" in v:
            parts.append(f"HR {v.get('heartRate')}")
        if "respiratoryRate" in v:
            parts.append(f"RR {v.get('respiratoryRate')}")
        if "temperatureC" in v:
            parts.append(f"Temp {v.get('temperatureC')} C")
        if "oxygenSaturationPercent" in v:
            parts.append(f"SpO2 {v.get('oxygenSaturationPercent')}%")
        pdf.multi_cell(w, 5, ascii_safe("; ".join(parts)))
    pdf.ln(1)

    extras = []
    for key in ("labs", "labsOrdered", "imaging", "referrals", "screeningScores"):
        if sd.get(key):
            extras.append(f"{key}: {json.dumps(sd.get(key), ensure_ascii=True)}")
    if extras:
        pdf.set_font("Helvetica", "B", 10)
        pdf.multi_cell(w, 5, "Other structured items")
        pdf.set_font("Courier", "", 8)
        for block in extras:
            pdf.multi_cell(w, 4, ascii_safe(block))
        pdf.ln(1)

    ac = data.get("agentContext") or {}
    pdf.section_title("Agent context")
    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(w, 5, ascii_safe(ac.get("oneLineSummary", "")))
    pdf.ln(1)
    pdf.set_font("Helvetica", "B", 10)
    pdf.multi_cell(w, 5, "Key facts for tools")
    pdf.set_font("Helvetica", "", 10)
    for fact in ac.get("keyFactsForTools") or []:
        pdf.multi_cell(w, 5, ascii_safe(f"- {fact}"))
    pdf.ln(1)
    flags = ac.get("safetyFlags") or []
    if flags:
        pdf.set_font("Helvetica", "B", 10)
        pdf.multi_cell(w, 5, "Safety flags")
        pdf.set_font("Helvetica", "", 10)
        pdf.multi_cell(w, 5, ascii_safe(", ".join(str(x) for x in flags)))
        pdf.ln(1)

    return pdf


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    notes_dir = root / "clinical-notes"
    if not notes_dir.is_dir():
        print(f"Missing directory: {notes_dir}", file=sys.stderr)
        return 1

    json_files = sorted(notes_dir.glob("*_clinical_note.json"))
    if not json_files:
        print(f"No JSON clinical notes in {notes_dir}", file=sys.stderr)
        return 1

    for path in json_files:
        data = json.loads(path.read_text(encoding="utf-8"))
        pdf = build_pdf(data)
        out = path.with_suffix(".pdf")
        pdf.output(str(out))
        print(f"Wrote {out.name}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
