# AGENTS.md — Entry Instruction for LLM Agents

- Path: `AGENTS.md`
- Version: `20251218`

## Purpose

Root file for projects using ADSM (Agent-Driven Software Management).
Defines the roles of the Human and the Agent, the context structure, and operational invariants.
This file is read by the agent first, before loading any local instructions.

---

## ADSM Principles

### Project Spaces

A project consists of two interconnected spaces:

- **Cognitive Context** (`./ctx/`) — documentation, rules, specifications.
- **Software Product** (everything outside `ctx/`) — source code and executable artifacts.

The context defines the rules for modifying the product;  
the product reflects the application of the context.

### Interaction Model

- The Human formulates goals, manages the context, and approves changes.
- The Agent interprets the context and modifies the product within its boundaries.
- Each iteration ends with a report.

---

## Roles

**Human:** goals, context, approval of changes, evolution of structure.  
**Agent:** task execution within the context, product modification, consistency maintenance, reporting.

---

## Minimal Project Structure

```text
/
├─ ctx/         ← cognitive context
├─ AGENTS.md    ← agent instruction
└─ README.md    ← project description
```

---

## Context Dependencies

Agent behavior is determined by documents located in:

```text
./ctx/
```

Recommended documents:

- `ctx/AGENTS.md` — structure of the project cognitive context;
- `ctx/agent/AGENTS.md` — local agent rules;
- `ctx/docs/product/AGENTS.md` — base product description;

---

## AGENTS.md Hierarchy in the Project

If additional `AGENTS.md` files are present in the project
(for example, `ctx/docs/architecture/AGENTS.md`, `src/module/AGENTS.md`),
they are considered part of the cognitive context **within their level boundaries**.

### ADSM Rule

When executing a task in directory `X`, the agent’s working context is the combination of all `AGENTS.md` files located on the path from the project root to directory `X`.

Priority rule:
rules defined in deeper directories override rules from higher levels **within their scope**.

The agent must:

- treat all discovered `AGENTS.md` files as a single coherent rule system;
- resolve overlaps according to directory hierarchy;
- comply with invariants defined in the root `AGENTS.md`.

---

## Requirements for Local AGENTS.md (Level Maps)

Each `AGENTS.md` located inside subdirectories of `ctx/` must contain a **Level Map** —
a formalized description of the documentation structure of that directory.

### “Level Map” Invariant

#### Mandatory Section

```md
## Level Map

- `<directory>/` — description of the directory’s purpose.
- …
- `<file>.md` — description of the file’s purpose.
- …
```

#### Formatting Rules

- The list starts with **directories**, followed by **files**.
- Directories are sorted **alphabetically**.
- Files are sorted **alphabetically**.
- Each element description must declaratively state its purpose.
- The `AGENTS.md` file of the level itself must be included as an element of the map.
- The level map must match the actual directory structure and serve as a navigational anchor for the agent.

### Purpose of the Level Map

- defines the boundaries of the space governed by the level rules;
- provides documentation navigation without filesystem analysis;
- ensures uniform context structure across all levels in accordance with the root document.

---

## `@LLM-DOC` Comments

`@LLM-DOC` is a built-in protected context inside source code.

Rules:

1. Used only in source files.
2. Must be written in English.
3. The agent must recognize the marker and must not modify or remove it.
4. Violation results in an `execution error`.

---

## Reporting

Each iteration must end with a report:

```text
./ctx/agent/report/YYYY/MM/DD/HH-MM-{title}.md
```

The report contains the goal, performed actions, and produced artifacts.

Absence of a report is an `execution error`.

If `ctx/agent/report-template.md` exists, the agent must use it.

Each iteration is considered incomplete until the report is created.

---

## Compatibility

The root `AGENTS.md` defines methodology invariants and is used **unchanged** across all projects.
Project-specific rules are placed in `./ctx/` and in `@LLM-DOC`.

---

## `output.md` Files

Files named `output.md` are not part of the context and must be ignored by the agent.

---
