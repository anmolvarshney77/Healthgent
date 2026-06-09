import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { z } from "zod";
import { resolveNote, getPath } from "../notes-loader";
import { jsonResponse, textResponse } from "../utils";

export function registerExtractSection(server: McpServer, root: string) {
  server.registerTool(
    "extract_section",
    {
      description:
        "Extract specific sections from a clinical note to reduce token usage. Provide dot-path keys such as [\"clinicalNote.subjective\", \"structuredData.medications\", \"structuredData.vitals\", \"agentContext\"].",
      inputSchema: {
        filename: z.string().optional(),
        mrn: z.string().optional(),
        sections: z
          .array(z.string())
          .describe(
            "Dot-path keys to extract from the note (e.g. clinicalNote.assessment, structuredData.medications)",
          ),
      },
    },
    async ({ filename, mrn, sections }) => {
      if (!filename && !mrn) {
        return textResponse("Provide either filename or mrn.", true);
      }
      if (!sections || sections.length === 0) {
        return textResponse("Provide at least one section path.", true);
      }

      const result = resolveNote(root, filename, mrn);
      if (!result) {
        return textResponse(
          `No clinical note found for ${filename ?? mrn}.`,
          true,
        );
      }

      const extracted: Record<string, unknown> = {};
      for (const section of sections) {
        extracted[section] = getPath(result.note, section);
      }

      return jsonResponse({
        filename: result.filename,
        mrn: result.note.patient?.mrn,
        extracted,
      });
    },
  );
}
