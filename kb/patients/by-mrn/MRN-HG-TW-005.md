# Tamera164 Wisozk929 — MRN-HG-TW-005

## Identifiers

| Field | Value |
|-------|--------|
| Full name | Tamera164 Wisozk929 |
| MRN | MRN-HG-TW-005 |
| Date of birth | 1980-02-03 |
| Sex at birth | female |
| Age (at encounter) | 46 years |

**Identifiers:** `urn:mrn:healthgent` → `MRN-HG-TW-005`

## Care team (this encounter)

Documented **encounter provider** for the visit below — not necessarily the patient’s full longitudinal care team.

| Field | Value |
|-------|--------|
| Name | Dr. Sample Provider |
| Role | MD |
| Department | Family Medicine |

## Visit snapshot

| Field | Value |
|-------|--------|
| Encounter ID | ENC-TW-2026-0510 |
| Date/time | 2026-05-05T11:20:00-07:00 |
| Type | office_visit |
| Setting | primary_care_womens_health |
| Chief complaint | Type 2 diabetes follow-up; intermittent numbness in feet |
| Visit type | established_chronic_disease_management |
| Duration | 35 minutes |

## Problems / assessment

| Problem | Status | ICD-10 |
|---------|--------|--------|
| Type 2 diabetes mellitus | suboptimally_controlled_improving | E11.9 |
| Diabetic peripheral neuropathy, suspected early | active | E11.42 |
| Obesity | active | E66.9 |

## Medications (structured)

| Name | Dose | Route | Frequency | Indication | Status |
|------|------|-------|-----------|------------|--------|
| metformin | 1000 mg | PO | BID | type 2 diabetes | active |
| empagliflozin | 10 mg | PO | daily | type 2 diabetes / cardiorenal risk reduction | new |
| atorvastatin | 40 mg | PO | daily | dyslipidemia | active |

**Plan narrative:** Continue metformin; add empagliflozin with counseling (hydration, genital yeast infection warning signs). Reinforce MNT and activity. Repeat HbA1c in 3 months; annual labs scheduled. Podiatry if foot lesion; ophthalmology referral provided (screening overdue).

## Allergies

| Substance | Reaction | Severity |
|-----------|----------|----------|
| NKDA | — | — |

## Conditions (structured)

| Name | ICD-10 | Clinical status |
|------|--------|-----------------|
| Type 2 diabetes mellitus without complications | E11.9 | active |
| Type 2 diabetes with diabetic polyneuropathy | E11.42 | active |
| Obesity | E66.9 | active |

## Vitals (visit)

| Effective | BP | HR | RR | Temp °C | SpO2 % | Weight kg | Height cm |
|-----------|-----|-----|-----|---------|--------|-----------|-----------|
| 2026-05-05T11:25:00-07:00 | 126/78 | 74 | 14 | 36.6 | 98 | 86.0 | 166 |

## Labs (reviewed / on file)

| Test | Value | Unit | Date |
|------|-------|------|------|
| HbA1c | 7.8 | % | 2026-05-01 |
| eGFR | 82 | mL/min/1.73m2 | 2026-05-01 |
| LDL-C | 96 | mg/dL | 2026-05-01 |

## Labs ordered

| Test | Priority | Due |
|------|----------|-----|
| hba1c | routine | due in 3 months |
| cmp | routine | due in 3 months |
| lipid_panel | routine | due in 6 months |

## Referrals

| Type | Reason | Urgency |
|------|--------|---------|
| ophthalmology | diabetic_retinopathy_screening_overdue | routine |

## Foot exam

Monofilament: reduced bilateral distal. Pulses: DP palpable bilateral. Skin: intact.

## Immunizations / procedures

**Immunizations:** none listed.

**Procedures:** none listed.

## Patient instructions (visit)

Daily foot checks; seek care for redness, drainage, or open sore. Monitor for dehydration/UTI symptoms on SGLT2 inhibitor.

## Agent-oriented snapshot

**One-line summary:** 46F T2DM with rising neuropathy findings; intensified therapy with SGLT2i; labs and eye care coordination needed.

**Key facts for tools**

- eGFR checked — SGLT2 contraindications must be monitored ongoing.
- Neuropathy screening abnormal — ulcer prevention counseling documented.
- Polypharmacy: statin + metformin + SGLT2 — renal/hepatic monitoring alignment.

**Safety flags:** `diabetes_foot_risk`, `new_high_risk_medication_class`

---

## Provenance

- **Source file:** `clinical-notes/Tamera164_Wisozk929_clinical_note.json`
- **Schema:** clinical_note v1.0
