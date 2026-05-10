# Agent validation instructions — guardrails

Use this as the **mandatory pre-reply validation** whenever the agent touches Healthgent **clinical fixtures**, the **patient knowledge base**, or answers questions framed as patient care, prescriptions, diagnoses, or visit facts.

Detailed workflows remain in [`kb-primary-agent.md`](kb-primary-agent.md), [`kb-agent-patient-registry.md`](kb-agent-patient-registry.md), and [`agent-configuration.md`](agent-configuration.md).

---

## A. Scope trigger

Run **§ B–F** before sending an answer if **any** of the following apply:

- The user names an **MRN**, **`clinical-notes/`** file, **`kb/patients/`** artifact, or **patient** in this repo’s demo sense.
- The question asks what **was diagnosed, prescribed, ordered, recorded in vitals/labs/imaging**, or **who saw** the patient.
- You relied on Markdown KB text, pasted JSON, chat memory from earlier turns, or tools touching fixtures.

If none apply (pure tooling/repo scaffolding unrelated to noted patients), **§ B–F** do not apply.

---

## B. Grounding validation

1. **Identify sources.** Every clinical assertion must map to **at least one** of:
   - a referenced **`clinical-notes/*.json`** field (`patient`, `encounter`, `clinicalNote`, `structuredData`, `agentContext`), or  
   - **`kb/patients/by-mrn/<MRN>.md`** / **KB README** content **explicitly loaded or cited this session**.
2. **No orphans.** If you cannot tie a claim to (1), **omit it** or say **not documented in fixtures**.
3. **Mirror hierarchy.** If **Markdown KB** and **JSON** disagree, **discard KB** and use JSON after reloading (`read_file` on the JSON path or MCP **`get_clinical_note`** when available).
4. **Temporal honesty.** Describe findings relative to **documented encounter date(s)** only; do not infer longitudinal continuity beyond what appears (current corpus is mainly **one encounter per patient**).

---

## C. Clinical-framing validation

Before responding:

1. **Label demo scope.** State plainly when presenting summaries that data are **synthetic / demo** and output is **not clinical advice**, **not billing/legal/medical fact**, and **not a substitute for professionals**.
2. **Red-flag wording.** Do not instruct real-world diagnosis/treatment (“you should…”), dosing changes, or emergency overrides unless repeating **verbatim documented patient instructions** from fixtures—and pair those quotes with the synthetic caveat above.
3. **Separate inference.** Clearly distinguish **quoted/recapitulated chart content** from **general clinical reasoning**. Prefer wording such as “In this fixture’s note…” versus textbook explanations unless the user asked only for educational principles unrelated to a patient identity.

---

## D. Safety-flag validation

When `agentContext.safetyFlags` or analogous cues appear for the matched encounter:

1. **Surface flags**, then summarize **only fixture-grounded** follow-ups already documented (e.g. return precautions), **without embellishment**.
2. **Do not** invent escalation thresholds absent from the note/KB.

---

## E. Tooling validation (when MCP is configured)

If MCP clinical-note tools are available:

1. Before conclusions drive downstream artifacts or HTTP payloads to **`external-agent`**, run **`validate_clinical_note`** (per routing policy in [`agent-configuration.md`](agent-configuration.md)).
2. Prefer **`extract_section`** for narrow pulls rather than pasting entire charts unnecessarily into insecure contexts.

If MCP is **not** configured:

1. Prefer **opening or quoting specific paths** under **`clinical-notes/`** rather than relying solely on KB fragments stored only in chat history.

---

## F. Stop conditions — defer instead of guessing

**Stop** and request clarification or reload canonical JSON **instead of** continuing when:

- **Patient identity Ambiguity**, MRNs collide across chats, or the registry README lacks an entry.
- **Stale KB suspicion**, Markdown mentions encounters/files absent from **clinical-notes/** listing or mismatched filenames at footer provenance.
- **Beyond-scope**, answer requires facts absent from fixtures (family PH unknown outside note, prior undocumented meds).

Respond briefly identifying **what failed validation**, cite intended paths/tools (KB README / JSON filename / MCP tool names), and what input resolves it.

---

## Quick PASS checklist (copy-prompt discipline)

Before “send”: grounded ✔︎ demo labeled ✔︎ KB-vs-JSON honored ✔︎ safety flags not embellished ✔︎ no fabricated continuity ✔︎ MCP order respects routing ✔︎ stop-condition guard ✔︎.
