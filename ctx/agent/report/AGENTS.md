# Agent Iteration Recording Protocol

- Path: `ctx/agent/report/AGENTS.md`
- Version: `20251218`

## Directory Purpose

The `ctx/agent/report/` directory is intended for storing reports of the agent’s working iterations. Each report records a completed iteration and confirms that context changes and related artifacts are agreed upon and fixed.

## Level Map

- `YYYY/` — archive of iteration reports organized by years, with nested month and day structures.
- `AGENTS.md` — this document, defining reporting requirements and the structure of the `report/` directory.

## Mandatory Rules

- Each iteration must end with the creation of a separate report at the path  
  `ctx/agent/report/YYYY/MM/DD/HH-MM-{title}.md`.
- The report must contain at least three semantic sections:
  - “Summary of Changes”
  - “Work Details”
  - “Results”
- The report must reflect the relationship between the human’s task definition, context changes, and modifications to product or code artifacts.
- Absence of a report means the iteration is not complete and cannot be considered recorded.

## Report Immutability Policy

- **A report is an immutable document.**
- **Editing a report after its creation is prohibited.**
- **Only deletion** of a report is allowed if it is deemed erroneous or irrelevant.
- Re-recording must be performed exclusively by creating a **new file**, not by modifying an existing one.
- Reports should be marked as `read-only` to prevent accidental edits.
- The `ctx/agent/report/` directory is treated as an archive: the agent does not read, analyze, or modify existing reports without explicit instruction from the human.

## Agent Action Algorithm

1. Upon completion of an iteration, generate the report content.
2. Ensure that the date-based directory hierarchy exists; create it if necessary.
3. Save the report in Markdown format with a unique `{title}` suffix.
4. Commit the report file together with the rest of the iteration changes.
5. Ensure the immutability of the created report.

## Additional Guidelines

- The `{title}` suffix should briefly reflect the essence of the iteration (for example, `structure-update`, `docs-sync`, `bugfix`).
- Repeated or follow-up iterations are recorded as separate reports without overwriting previous ones.
- If the iteration includes context changes, the report must include links to the relevant documents.
- Reports are intended for the human and for historical recording; they are not used by the agent as a working context by default.

## Summary

`ctx/agent/report/AGENTS.md` defines a unified, portable protocol for recording iterations, ensuring a transparent change history and a strict boundary between the agent’s current work and the archive of completed steps.
