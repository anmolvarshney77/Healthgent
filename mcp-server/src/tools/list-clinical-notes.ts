import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { listNoteFiles } from "../notes-loader.js";
import { jsonResponse, textResponse } from "../utils.js";

export function registerListClinicalNotes(server: McpServer, root: string) {
  server.registerTool(
    "list_clinical_notes",
    {
      description:
        "List all available clinical note JSON files in the clinical-notes directory. Returns filenames and count.",
      inputSchema: {},
    },
    async () => {
      try {
        const files = listNoteFiles(root);
        return jsonResponse({ count: files.length, files });
      } catch (err) {
        return textResponse(`Failed to list notes: ${String(err)}`, true);
      }
    },
  );
}
