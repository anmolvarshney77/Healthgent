# Grover559 Keeling57 — MRN-HG-GK-003

## Identifiers

| Field | Value |
|-------|--------|
| Full name | Grover559 Keeling57 |
| MRN | MRN-HG-GK-003 |
| Date of birth | 2013-12-10 |
| Sex at birth | male |
| Age (at encounter) | 12 years |

**Identifiers:** `urn:mrn:healthgent` → `MRN-HG-GK-003`

**Guardian:** mother — contact phone `+1-555-0103`

## Care team (this encounter)

Documented **encounter provider** for the visit below — not necessarily the patient’s full longitudinal care team.

| Field | Value |
|-------|--------|
| Name | Dr. Sample Provider |
| Role | MD |
| Department | Pediatrics |

## Visit snapshot

| Field | Value |
|-------|--------|
| Encounter ID | ENC-GK-2026-0510 |
| Date/time | 2026-05-06T10:00:00-07:00 |
| Type | office_visit |
| Setting | pediatric_primary_care |
| Chief complaint | Persistent asthma symptoms with nighttime cough during pollen season |
| Visit type | established_patient |
| Duration | 25 minutes |

## Problems / assessment

| Problem | Status | ICD-10 |
|---------|--------|--------|
| Asthma, persistent moderate | partially_controlled_seasonal_exacerbation | J45.40 |
| Allergic rhinitis, seasonal | active | J30.2 |

## Medications (structured)

| Name | Dose | Route | Frequency | Indication | Status |
|------|------|-------|-----------|------------|--------|
| fluticasone propionate MDI | per weight-based guideline — clinic adjusted upward | inhaled | BID | asthma controller | active_dose_change |
| albuterol MDI | 2 puffs | inhaled | PRN | bronchospasm | active |
| cetirizine | 10 mg | PO | daily PRN | allergic rhinitis | active |

**Plan narrative:** Optimize controller (fluticasone MDI via spacer per plan); reviewed spacer technique. Asthma action plan for school. Continue albuterol PRN; urgent care thresholds documented (SpO2 <94%, peak flow <50% personal best, etc.). Follow-up 6 weeks or sooner if exacerbation. Consider allergy testing referral if recurrent symptoms.

## Allergies

| Substance | Reaction | Severity |
|-----------|----------|----------|
| environmental_pollen | respiratory_exacerbation | moderate |
| NKFA | — | — |

## Conditions (structured)

| Name | ICD-10 | Clinical status |
|------|--------|-----------------|
| Moderate persistent asthma | J45.40 | active |
| Seasonal allergic rhinitis | J30.2 | active |

## Vitals (visit)

| Effective | HR | RR | Temp °C | SpO2 % | Weight kg | Height cm |
|-----------|-----|-----|---------|--------|-----------|-----------|
| 2026-05-06T10:15:00-07:00 | 92 | 22 | 37.0 | 97 | 42.0 | 152 |

## Pulmonary function (clinic)

Peak flow pre-bronchodilator 82% of personal best; post-albuterol 95%; bronchodilator response positive.

## Labs / immunizations / procedures / education

**Labs ordered:** none listed.

**Immunizations:** influenza — due this season (verify administration history at next visit).

**Procedures:** none listed.

**Education provided:** spacer_technique, asthma_action_plan.

## Patient instructions (visit)

Use spacer with every ICS dose; rinse mouth after. Track peak flow mornings for one week and bring log.

## Agent-oriented snapshot

**One-line summary:** 12M asthma moderate persistent with seasonal worsening; ICS intensified, bronchodilator response documented.

**Key facts for tools**

- Peak flow monitoring requested — parse trends for control assessment.
- School action plan present — surface emergency thresholds when relevant.
- Steroid inhaler dose changed — verify pediatric dosing bounds vs weight.

**Safety flags:** `pediatric_respiratory_condition`

---

## Provenance

- **Source file:** `clinical-notes/Grover559_Keeling57_clinical_note.json`
- **Schema:** clinical_note v1.0
