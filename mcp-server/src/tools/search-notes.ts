import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { z } from "zod";
import { loadAllNotes } from "../notes-loader";
import { ClinicalNote } from "../types";
import { jsonResponse, textResponse } from "../utils";

function matchesFilters(
  note: ClinicalNote,
  filters: {
    problem?: string;
    icd10?: string;
    encounterType?: string;
    chiefComplaint?: string;
    dateFrom?: string;
    dateTo?: string;
  },
): string[] {
  const matched: string[] = [];
  const { problem, icd10, encounterType, chiefComplaint, dateFrom, dateTo } =
    filters;

  if (problem) {
    const lower = problem.toLowerCase();
    const inAssessment = note.clinicalNote?.assessment?.some((a) =>
      a.problem.toLowerCase().includes(lower),
    );
    const inConditions = note.structuredData?.conditions?.some((c) =>
      c.name.toLowerCase().includes(lower),
    );
    if (inAssessment || inConditions) matched.push("problem");
  }

  if (icd10) {
    const upper = icd10.toUpperCase();
    const found =
      note.clinicalNote?.assessment?.some((a) =>
        a.icd10.toUpperCase().startsWith(upper),
      ) ||
      note.structuredData?.conditions?.some((c) =>
        c.icd10.toUpperCase().startsWith(upper),
      );
    if (found) matched.push("icd10");
  }

  if (encounterType) {
    if (
      note.encounter?.type
        ?.toLowerCase()
        .includes(encounterType.toLowerCase())
    ) {
      matched.push("encounterType");
    }
  }

  if (chiefComplaint) {
    if (
      note.encounter?.chiefComplaint
        ?.toLowerCase()
        .includes(chiefComplaint.toLowerCase())
    ) {
      matched.push("chiefComplaint");
    }
  }

  if (dateFrom || dateTo) {
    const encounterDate = new Date(note.encounter?.dateTime);
    let inRange = true;
    if (dateFrom && encounterDate < new Date(dateFrom)) inRange = false;
    if (dateTo && encounterDate > new Date(dateTo)) inRange = false;
    if (inRange) matched.push("dateRange");
  }

  return matched;
}

export function registerSearchNotes(server: McpServer, root: string) {
  server.registerTool(
    "search_notes",
    {
      description:
        "Search across all clinical notes by problem name, ICD-10 code, encounter type, chief complaint, or date range. Returns lightweight matches (not full notes).",
      inputSchema: {
        problem: z
          .string()
          .describe("Substring match against problem/condition names")
          .optional(),
        icd10: z
          .string()
          .describe("Prefix match against ICD-10 codes (e.g. E11, F41.1)")
          .optional(),
        encounterType: z
          .string()
          .describe("Substring match against encounter type")
          .optional(),
        chiefComplaint: z
          .string()
          .describe("Substring match against chief complaint")
          .optional(),
        dateFrom: z
          .string()
          .describe("ISO date lower bound for encounter date (e.g. 2026-01-01)")
          .optional(),
        dateTo: z
          .string()
          .describe("ISO date upper bound for encounter date (e.g. 2026-12-31)")
          .optional(),
      },
    },
    async (filters) => {
      const hasFilter = Object.values(filters).some((v) => v !== undefined);
      if (!hasFilter) {
        return textResponse(
          "Provide at least one filter: problem, icd10, encounterType, chiefComplaint, dateFrom, or dateTo.",
          true,
        );
      }

      try {
        const all = loadAllNotes(root);
        const results = all
          .map(({ filename, note }) => {
            const matchedFields = matchesFilters(note, filters);
            return matchedFields.length > 0
              ? {
                  filename,
                  mrn: note.patient?.mrn,
                  patientName: note.patient?.fullName,
                  encounterDate: note.encounter?.dateTime,
                  chiefComplaint: note.encounter?.chiefComplaint,
                  matchedFields,
                }
              : null;
          })
          .filter(Boolean);

        return jsonResponse({ count: results.length, results });
      } catch (err) {
        return textResponse(`Search failed: ${String(err)}`, true);
      }
    },
  );
}
