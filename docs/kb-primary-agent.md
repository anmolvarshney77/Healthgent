# Healthgent primary agent — operational handbook

Single operational guide for running, troubleshooting, and operating the Healthgent **primary orchestrator agent** in Cursor. Cursor-specific wiring (MCP JSON, env tables, routing policies) lives in [`agent-configuration.md`](agent-configuration.md).

---

## 1. Purpose and scope

- **Primary agent:** The main orchestrator you drive from Cursor chat and rules. It plans multi-step work, calls **MCP tools** for deterministic local access to JSON clinical notes, and may delegate to the **external HTTP agent** for isolation, heavier reasoning, or a clear integration boundary for demos.
- **Data:** Only **synthetic** fixtures under `clinical-notes/*.json`. Treat outputs as **demo / educational** — not clinical advice, not authoritative coding or diagnosis.
- **Guardrails:** Follow **[`agent-validation-guardrails.md`](agent-validation-guardrails.md)** (Cursor rule `healthgent-validation.mdc`) before fixture-grounded replies.

---

## 2. Prerequisites

| Item | Notes |
|------|--------|
| OS | macOS, Linux, or Windows with a POSIX-friendly shell for curl examples. |
| Runtime | Match whatever `mcp-server/` and `external-agent/` use once scaffolded (e.g. **Node.js 20+** or **Python 3.11+**). See each package’s `package.json` / `pyproject.toml` / README. |
| Cursor Desktop | MCP enabled (`Settings` → features depending on your Cursor version; see [`agent-configuration.md`](agent-configuration.md) for registration). |
| Optional API keys | Only if the external agent calls a cloud LLM or third-party API — configure via `.env` (never commit secrets). |

---

## 3. Repository layout map

| Path | Role |
|------|------|
| `clinical-notes/` | **System of record:** versioned synthetic clinical note JSON files (e.g. `*_clinical_note.json`). |
| `kb/patients/` | **Derived patient KB:** Markdown registry and per-MRN summaries for agent Q&A — mirror of note content; see [`kb-agent-patient-registry.md`](kb-agent-patient-registry.md). |
| `mcp-server/` | MCP server process: lists, loads, validates, searches, and extracts slices from notes under `clinical-notes/`. |
| `external-agent/` | Small HTTP (or CLI) service: structured analysis/report given note payload in the request body — **no direct filesystem access**; MCP remains the gatekeeper for local files. |
| `docs/` | This handbook plus [`agent-configuration.md`](agent-configuration.md). |
| `.cursor/rules/` | Cursor rules describing tool discipline and MCP vs external-agent routing (see configuration doc). |

---

## 4. One-time setup

1. **Clone** this repo and open the workspace root (`Healthgent`) in Cursor.
2. **Install dependencies** (exact commands depend on scaffold — typical pattern):
   - `mcp-server/`: `npm install` (or `pnpm install`).
   - `external-agent/`: `npm install` or `pip install -e .` / `uv sync` as documented there.
3. **Environment:** Copy each package’s `.env.example` to `.env` and fill values (external LLM URL/key only if used).
4. **Verify fixtures:** Confirm `clinical-notes/*.json` parse as JSON and contain keys such as `documentType`, `schemaVersion`, `patient`, `encounter`, `clinicalNote`, and typically `structuredData` (see [`validate_clinical_note`](#8-tool-catalog-human-readable)).

---

## 5. Starting dependent processes

### MCP server

- Usually started **by Cursor** via stdio when the MCP entry is configured (no manual terminal needed for daily use).
- For **local debugging**, run the dev command from `mcp-server/` README (e.g. `npm run dev` or `npx tsx src/index.ts`). Expect logs indicating the server is listening on stdio for MCP messages — **not** necessarily an HTTP port.

### External agent

- Start from `external-agent/` per its README (e.g. `npm run dev` or `uvicorn main:app --reload`).
- Default base URL for development is often something like `http://127.0.0.1:8788` — **use the port documented in that package** and align `EXTERNAL_AGENT_URL` in [`agent-configuration.md`](agent-configuration.md).

### Health checks

```bash
# External agent (adjust host/port to match your scaffold)
curl -sS -o /dev/null -w "%{http_code}" http://127.0.0.1:8788/health
```

If no `/health` route exists yet, use the analyze endpoint with a minimal stub body only after reading the external agent’s OpenAPI/README — avoid guessing paths.

---

## 6. Cursor wiring checklist

Detailed MCP JSON and env vars: **[`agent-configuration.md`](agent-configuration.md)**.

Checklist:

- [ ] MCP server entry added (command, `args`, `cwd`, `env` such as `CLINICAL_NOTES_ROOT`).
- [ ] Cursor shows MCP tools: `list_clinical_notes`, `get_clinical_note`, `validate_clinical_note`, `search_notes`, `extract_section`.
- [ ] External agent running and `EXTERNAL_AGENT_URL` reachable from your machine.
- [ ] `.cursor/rules/` loaded for routing (MCP first for file access; external agent for bounded HTTP analysis).

---

## 7. Canonical workflows (step-by-step)

Use these as example prompts in Cursor chat (adapt IDs/filenames to your fixtures).

### A. Load one note and summarize

1. Ask the agent to call **`list_clinical_notes`** (or use a known filename).
2. **`get_clinical_note`** for `Grover559_Keeling57_clinical_note.json` (or another file).
3. Produce a short **non-diagnostic** visit summary for stakeholders.

### B. Validate and cross-check `structuredData`

1. **`get_clinical_note`** then **`validate_clinical_note`** on the same payload or id.
2. **`extract_section`** for `clinicalNote` and `structuredData` separately if token limits matter.
3. Ask for an inconsistency check: subjective/objective/plan vs meds, allergies, problems — flagged as **demo review**, not medical fact.

### C. Multi-note search

1. **`search_notes`** with filters (problem text, ICD-10, encounter type, date range) as implemented by the MCP server.
2. Summarize patterns across hits (counts, common themes) without inventing patient identities beyond file content.

### D. External agent structured report

1. Use MCP to **`get_clinical_note`** (and optionally **`extract_section`**).
2. POST the allowed subset of JSON to the external agent **`/analyze`** (or documented path) — see [§9](#9-external-agent-contract).
3. Integrate **`findings`**, **`gaps`**, **`suggested_followups`** into a short markdown or JSON artifact for the demo.

---

## 8. Tool catalog (human-readable)

| Tool | When to use | Inputs (conceptual) | Failure modes |
|------|-------------|---------------------|----------------|
| `list_clinical_notes` | Discover ids/paths under `clinical-notes/`. | Optional glob/filter if implemented. | Wrong `CLINICAL_NOTES_ROOT`; empty directory. |
| `get_clinical_note` | Load full parsed JSON for one note. | Filename or logical id. | Missing file; invalid JSON; path escape attempts — server should reject unsafe paths. |
| `validate_clinical_note` | Before trusting downstream synthesis or external POST body. | Parsed note or id to load internally. | Missing keys (`documentType`, `schemaVersion`, `patient`, `encounter`, `clinicalNote`); type mismatches. |
| `search_notes` | Filter across files (problem, ICD-10, encounter type, dates). | Query object per MCP schema. | No matches; slow folder if many files — acceptable for hackathon scale. |
| `extract_section` | Reduce tokens — SOAP sections only or `structuredData` slice. | Section key(s), optional note id. | Unknown section name; note not found. |

---

## 9. External agent contract

Authoritative URL paths and JSON shapes should match `external-agent/` source; below is the **intended** hackathon contract from the product plan.

| Aspect | Detail |
|--------|--------|
| Base URL | Dev default often `http://127.0.0.1:8788` — confirm in external-agent README and env. |
| Endpoint | **POST** `/analyze` (or `/report` if that’s what ships — one primary analysis route). |
| Request body (example) | `{ "clinicalNote": { ...full or partial note... }, "task": "structured_report" }` |
| Response (example) | `{ "findings": [...], "gaps": [...], "suggested_followups": [...], "meta": { "model": "...", "version": "..." } }` |
| Timeouts | Client-side: suggest 30–120s for LLM-backed runs; shorter for stubs. |
| Errors | `4xx` for validation; `5xx` for upstream/model failures — body should include a short `error` string where possible. |

---

## 10. Data and safety

- **Synthetic PHI only:** Fixtures are fictional; still avoid exporting them to prod telemetry without review.
- **No production EHR:** No write-back, auth, or persistence beyond local JSON files for this hackathon scope.
- **Adding a new fixture:** Drop `clinical-notes/<Id>_clinical_note.json`, keep schema aligned with siblings (`documentType`, `patient`, `encounter`, `clinicalNote`, `structuredData`), run **`validate_clinical_note`** before demo.

---

## 11. Troubleshooting

| Symptom | What to check |
|---------|----------------|
| MCP tools not listed | MCP config command/`cwd`; Node/Python on PATH; restart Cursor; see [`agent-configuration.md`](agent-configuration.md). |
| “File not found” from tools | `CLINICAL_NOTES_ROOT` points to `clinical-notes/` directory; filenames match exactly (case-sensitive on Linux/macOS). |
| External agent connection refused | Process running; port matches `EXTERNAL_AGENT_URL`; firewall. |
| CORS errors | Usually N/A for server-to-server curl; browser demos need CORS headers on external agent if applicable. |
| Model refusal / empty analysis | Prompt framing (non-diagnostic demo); API key; timeout; reduce payload size via **`extract_section`**. |

---

## Related

- **[`agent-configuration.md`](agent-configuration.md)** — MCP registration, env table, routing policy, rules mapping, secrets.
