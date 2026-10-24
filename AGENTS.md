# Root Level

- Path: `AGENTS.md`
- Template Version: `20261024`
- Changed: `20261024`

## Boundary

This file controls repository work. `ctx/` owns project meaning and is authoritative for product and implementation decisions; consult `ctx/AGENTS.md` and task-relevant context for design or code changes. If implementation conflicts with accepted context, follow the context and report any proposed change to accepted meaning for human approval rather than silently rewriting it. Read navigation documents only when needed and avoid rereading unchanged instructions within a session. Use the `adsm-ctx` skill when available for context lifecycle work.

`ctx/` may be part of this repository or a separately mounted repository. Detect its Git boundary before editing, preserve separate histories, and never remove, replace, relocate, or unmount it. If absent, create `ctx/` only when bootstrap is within the assigned scope. Deeper `AGENTS.md` files refine local rules without overriding root invariants.

A task may cover multiple repositories. Coordinate affected contracts and consumers, verify their integration, and keep each Git history separate. Do not expand into unrelated repositories. The human defines scope and approves changes to accepted meaning.

## Efficient Execution

Classify the task before reading context or running checks. Git-only work needs Git-state checks, not product-context scans or tests. For code or context changes, inspect only relevant owners; run deterministic checks chosen by changed responsibility and risk. Capture verbose output outside the model context and inspect logs on failure or when evidence is needed. Report results, omitted coverage, and material risks concisely.

Do not modify, replace, delete, or relocate this file without explicit human instruction. Do not read, search, or expose secret-bearing files or credentials; non-secret examples may describe configuration shape. If a secret is accidentally exposed, do not repeat it; notify the human that it should be rotated or revoked.
