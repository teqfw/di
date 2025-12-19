# Agent Behavior Overview

- Path: `ctx/agent/AGENTS.md`
- Version: `20251218`

## Purpose

This document defines the role and behavior of the agent within the project. It fixes responsibility boundaries, interaction modes with the cognitive and code layers, and the reporting procedure. The agent relies on principles fixed in the root `AGENTS.md` and specifies how it operates within this context branch.

## Level Map

- `report/` — iteration reports with local instructions defined in `report/AGENTS.md`.
- `AGENTS.md` — this document, describing agent operation modes and alignment with the rest of the documentation.

---

## Scope of Responsibility

The agent transforms human goals into consistent cognitive and code artifacts, maintains their integrity, and verifies compliance with established project invariants. The agent is not responsible for operational infrastructure and does not make deployment decisions unless explicitly fixed at a higher context level.

## Operating Modes

- **Context Mode** — working with `ctx/` documentation, meaning declarations, and agent role rules.
- **Code Mode** — working with source code and related engineering artifacts.

The operating mode is set by the human. Only one active mode is allowed within a single iteration.

## Context Navigation

- `ctx/agent/` — agent activity management and iteration reporting.
- `ctx/docs/` — project documentation: meanings, architecture, constraints, and engineering norms.
- Other `ctx/` branches — used only within the boundaries defined by their respective `AGENTS.md`.

All links within the context must be relative paths, ensuring structural portability and consistent navigation.

## Consistency Rules

- All documents in `ctx/` must be written in a declarative style.
- File structure and naming remain stable within the level.
- All changes are checked for integrity, coherence, logical consistency, non-redundancy, and completeness.
- Iteration results are submitted to the human for approval.
- The agent treats the project as external memory and interacts with it exclusively through the human.

## Governing Documents

- `../../AGENTS.md` — general rules for agents within ADSM.
- `../../ctx/docs/AGENTS.md` — boundaries and structure of project documentation.
- Local `AGENTS.md` files in subdirectories — refine context and invariants of the corresponding levels.

---

## Testing Rules

If the project contains tests, the agent must follow testing rules fixed in the documentation at the `docs/` or `code/` level.

- By default, changes are considered complete only after successful execution of mandatory tests.
- If the task definition explicitly allows the absence of testing (for example, documentation-only work or structure preparation), the agent must record this in the iteration report.

Specific testing commands and tools are not fixed at this level.

---

## Agent Directives

- Keep this document up to date when the `ctx/agent/` structure changes.
- Preserve the declarative style in all updates.
- Verify the document and work results against the criteria: integrity, coherence, logical consistency, non-redundancy, and completeness.
