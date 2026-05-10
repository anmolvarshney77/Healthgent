# Agent handbook — patient registry knowledge base

Operational instructions for agents answering **patient-centric questions** using the Markdown corpus under [`kb/patients/`](../kb/patients/).

Orchestration, MCP tools, and Cursor wiring remain in [`kb-primary-agent.md`](kb-primary-agent.md) and [`agent-configuration.md`](agent-configuration.md).

---

## 1. Purpose

Use **`kb/patients/`** when the user asks about:

- A specific patient’s health summary, problems, or instructions
- **Medications / prescriptions** (structured list plus narrative plan context)
- **Who is seeing the patient** (see §4 — usually the documented encounter provider)
- Allergies, conditions, vitals, labs, referrals, imaging, or other structured fields mirrored from notes

Prefer **`kb/patients/README.md`** for discovery (MRN ↔ name ↔ detail file) and **`kb/patients/by-mrn/<MRN>.md`** for full detail on one patient.

---

## 2. Relationship to canonical data

- **Authoritative source:** JSON files under **`clinical-notes/*.json`** (system of record described in [`kb-primary-agent.md`](kb-primary-agent.md)).
- **Patient KB:** Curated **Markdown mirror** for readability and `@`-reference in Cursor. If Markdown and JSON disagree, **trust the JSON**.
- **Verification:** When accuracy matters or the user asks for raw structure, use MCP tools **`get_clinical_note`** and **`validate_clinical_note`** once `mcp-server/` is available — see the primary handbook tool catalog.

---

## 3. Question routing (where to look)

| User intent | Primary location | Notes |
|-------------|------------------|--------|
| Meds / orders / “what was prescribed” | `structuredData.medications` in KB tables + **Plan narrative** bullets | New vs active vs short-course appears in structured `status` when present |
| Diagnoses / problems | Assessment table + conditions table | ICD-10 columns when listed |
| Who is the doctor / “seeing” the patient | **Care team (this encounter)** | Single visit in current fixtures; see §4 |
| Safety / red flags | Agent-oriented snapshot → **Safety flags** | Also use patient instructions for urgent guidance |
| Timeline / “last visit” | Visit snapshot (date, encounter ID) | Multiple future encounters → expect multiple `### Encounter …` sections in the same MRN file |
| Labs / imaging | Dedicated sections in per-MRN docs | Reflects `structuredData` where populated |

---

## 4. Care team wording

Current fixtures contain **one encounter per patient**. The KB lists the provider under **`encounter.provider`** for **that visit only**.

When answering “who is seeing him/her”:

- State the **documented encounter provider** (name, role, department) and the **visit date**.
- Do **not** imply a complete longitudinal care team unless multiple encounters or explicit roster data exist in source JSON.

---

## 5. Guardrails

- Apply **[`agent-validation-guardrails.md`](agent-validation-guardrails.md)** before sending fixture-grounded answers (mirrored in `.cursor/rules/healthgent-validation.mdc`).
- Data are **synthetic / demo** — not real patients; outputs are **not clinical advice** and not authoritative for coding or diagnosis.
- **Do not invent** visits, medications, providers, or results absent from `clinical-notes/` or the derived KB.
- **Do not** tell the user what they personally should do medically; summarize **what the fixture documents** and cite **MRN** and **source filename** when helpful.
- Respect privacy framing even for synthetic data (avoid unnecessary duplication of guardian phone numbers outside targeted questions).

---

## 6. Keeping the KB in sync

When a new `*_clinical_note.json` is added or an existing one changes:

1. Update or create **`kb/patients/by-mrn/<MRN>.md`** using the same section template as sibling files.
2. Update **`kb/patients/README.md`** index tables if the registry changed.

Until an automated sync script exists, treat this as a **manual publishing** step after JSON edits.

---

## 7. Quick references

| Resource | Path |
|----------|------|
| Registry index | [`kb/patients/README.md`](../kb/patients/README.md) |
| Per-patient files | [`kb/patients/by-mrn/`](../kb/patients/by-mrn/) |
| Primary orchestrator handbook | [`kb-primary-agent.md`](kb-primary-agent.md) |
