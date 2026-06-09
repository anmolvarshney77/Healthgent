import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { z } from "zod";
import { REQUIRED_KEYS } from "../types";
import { resolveNote } from "../notes-loader";
import { jsonResponse, textResponse } from "../utils";

export function registerValidateClinicalNote(server: McpServer, root: string) {
  server.registerTool(
    "validate_clinical_note",
    {
      description:
        "Validate that a clinical note has all required schema keys. Returns { valid, missing, typeErrors }.",
      inputSchema: {
        filename: z.string().optional(),
        mrn: z.string().optional(),
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

      const note = result.note as unknown as Record<string, unknown>;
      const missing = REQUIRED_KEYS.filter((k) => !(k in note));
      const typeErrors: string[] = [];

      for (const k of REQUIRED_KEYS) {
        if (k in note && (note[k] === null || typeof note[k] !== "object")) {
          if (k !== "patient" || note[k] !== null) {
            typeErrors.push(`${k} should be an object, got ${typeof note[k]}`);
          }
        }
      }

      return jsonResponse({
        filename: result.filename,
        valid: missing.length === 0 && typeErrors.length === 0,
        missing,
        typeErrors,
      });
    },
  );
}
