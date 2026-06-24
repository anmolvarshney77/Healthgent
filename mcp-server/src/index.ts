//Reactivate the MCP server for healthgent clinical notes
import path from "path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";
import {
  registerListClinicalNotes,
  registerGetClinicalNote,
  registerValidateClinicalNote,
  registerSearchNotes,
  registerExtractSection,
} from "./tools/index.js";

const notesRootRaw = process.env["CLINICAL_NOTES_ROOT"];
if (!notesRootRaw) {
  process.stderr.write(
    "Error: CLINICAL_NOTES_ROOT environment variable is not set.\n",
  );
  process.exit(1);
}

const notesRoot = path.resolve(notesRootRaw);

const server = new McpServer({
  name: "healthgent-clinical-notes",
  version: "1.0.0",
});

registerListClinicalNotes(server, notesRoot);
registerGetClinicalNote(server, notesRoot);
registerValidateClinicalNote(server, notesRoot);
registerSearchNotes(server, notesRoot);
registerExtractSection(server, notesRoot);

const transport = new StdioServerTransport();
server.connect(transport).catch((err: unknown) => {
  process.stderr.write(`Failed to start MCP server: ${String(err)}\n`);
  process.exit(1);
});
