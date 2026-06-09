export const REQUIRED_KEYS = [
  "documentType",
  "schemaVersion",
  "patient",
  "encounter",
  "clinicalNote",
  "structuredData",
  "agentContext",
] as const;

export interface Guardian {
  relationship: string;
  contactPhone: string;
}

export interface Patient {
  fullName: string;
  dateOfBirth: string;
  sexAtBirth: string;
  ageYears: number;
  mrn: string;
  guardian: Guardian | null;
}

export interface Provider {
  name: string;
  department: string;
}

export interface Encounter {
  encounterId: string;
  dateTime: string;
  type: string;
  setting: string;
  chiefComplaint: string;
  provider: Provider;
  duration: string;
}

export interface AssessmentItem {
  problem: string;
  status: string;
  icd10: string;
}

export interface ClinicalNoteSection {
  subjective: string;
  objective: string;
  assessment: AssessmentItem[];
  plan: string;
  patientInstructions: string;
}

export interface Allergy {
  substance: string;
  reaction: string;
  severity: string;
}

export interface Medication {
  name: string;
  dose: string;
  route: string;
  frequency: string;
  status: string;
  indication: string;
}

export interface Condition {
  name: string;
  icd10: string;
  clinicalStatus: string;
}

export interface Vitals {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperatureC?: number;
  oxygenSaturationPercent?: number;
}

export interface LabResult {
  test: string;
  value: number;
  unit: string;
  date: string;
}

export interface LabOrdered {
  test: string;
  priority: string;
  notes: string;
}

export interface ImagingResult {
  study: string;
  resultSummary: string;
  dateTime: string;
}

export interface Referral {
  type: string;
  reason: string;
  urgency: string;
}

export interface ScreeningScore {
  instrument: string;
  score: number;
  date: string;
}

export interface StructuredData {
  allergies: Allergy[];
  medications: Medication[];
  conditions: Condition[];
  vitals: Vitals;
  labs: LabResult[];
  labsOrdered: LabOrdered[];
  imaging: ImagingResult[];
  referrals: Referral[];
  screeningScores: ScreeningScore[];
}

export interface AgentContext {
  oneLineSummary: string;
  keyFactsForTools: string[];
  safetyFlags: string[];
}

export interface ClinicalNote {
  documentType: string;
  schemaVersion: string;
  patient: Patient;
  encounter: Encounter;
  clinicalNote: ClinicalNoteSection;
  structuredData: StructuredData;
  agentContext: AgentContext;
}
