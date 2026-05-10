# Patient registry (derived knowledge base)

This folder holds **Markdown summaries derived from** synthetic fixtures under [`clinical-notes/`](../../clinical-notes/). Content is for **demo / educational use only** — not real patient data and not clinical advice.

Canonical source for each row is the linked JSON file; if anything disagrees, trust the JSON.

| MRN | Full name | DOB | Sex at birth | Detail |
|-----|-----------|-----|--------------|--------|
| MRN-HG-LB-001 | Lincoln623 Bednar518 | 1993-11-08 | male | [MRN-HG-LB-001.md](by-mrn/MRN-HG-LB-001.md) |
| MRN-HG-LC-002 | Lane844 Carroll471 | 2007-07-19 | male | [MRN-HG-LC-002.md](by-mrn/MRN-HG-LC-002.md) |
| MRN-HG-GK-003 | Grover559 Keeling57 | 2013-12-10 | male | [MRN-HG-GK-003.md](by-mrn/MRN-HG-GK-003.md) |
| MRN-HG-JW-004 | Jimmie93 Waelchi213 | 2014-10-23 | male | [MRN-HG-JW-004.md](by-mrn/MRN-HG-JW-004.md) |
| MRN-HG-TW-005 | Tamera164 Wisozk929 | 1980-02-03 | female | [MRN-HG-TW-005.md](by-mrn/MRN-HG-TW-005.md) |

**Source filenames**

| MRN | Clinical note JSON |
|-----|-------------------|
| MRN-HG-LB-001 | `Lincoln623_Bednar518_clinical_note.json` |
| MRN-HG-LC-002 | `Lane844_Carroll471_clinical_note.json` |
| MRN-HG-GK-003 | `Grover559_Keeling57_clinical_note.json` |
| MRN-HG-JW-004 | `Jimmie93_Waelchi213_clinical_note.json` |
| MRN-HG-TW-005 | `Tamera164_Wisozk929_clinical_note.json` |

Agent usage: see [`docs/kb-agent-patient-registry.md`](../../docs/kb-agent-patient-registry.md).

**PDF exports:** Letter-sized PDFs of this KB (plus the patient-registry agent handbook) live under [`kb/pdf/`](../pdf/) after you run `npm run kb-pdf` from the repo root (`KB_PDF_CONCURRENCY=3` is the default in the script).
