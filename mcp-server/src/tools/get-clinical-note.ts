import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { z } from "zod";
import { resolveNote } from "../notes-loader.js";
import { jsonResponse, textResponse } from "../utils.js";

export function registerGetClinicalNote(server: McpServer, root: string) {
  server.registerTool(
    "get_clinical_note",
    {
      description:
        "Load and return the full parsed JSON for one clinical note. Provide either a filename (e.g. Lincoln623_Bednar518_clinical_note.json) or an MRN (e.g. MRN-HG-LB-001).",
      inputSchema: {
        filename: z
          .string()
          .describe("The JSON filename in clinical-notes/")
          .optional(),
        mrn: z
          .string()
          .describe("Patient MRN (e.g. MRN-HG-LB-001)")
          .optional(),
      },
    },
    async ({ filename, mrn }) => {
      if (!filename && !mrn) {
        return textResponse("Provide either filename or mrn.", true);
      }
      const result = resolveNote(root, filename, mrn);
      if (!result) {
        return textResponse(
          `No clinical note found for ${filename ?? mrn}.`,
          true,
        );
      }
      return jsonResponse(result.note);
    },
  );
}
