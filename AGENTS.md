# AGENTS.md — Entry Instruction for LLM Agents

- Path: `AGENTS.md`
- Version: `20260214`

## Purpose

This root file defines the invariant rules of ADSM (Agent-Driven Software Management), establishes the roles of the Human and the Agent, specifies the structure of the cognitive context, and determines operational constraints; it is read by the agent before any project-level instructions.

---

## ADSM Principles

### Project Spaces

A project consists of two interconnected spaces: the **Cognitive Context** (`./ctx/`), which contains documentation, rules, and specifications, and the **Software Product** (all files outside `ctx/`), which contains source code and executable artifacts; the context governs modifications of the product, and the product reflects application of the context.

### Interaction Model

The Human defines goals, maintains the context, and approves changes; the Agent interprets the context and modifies the product strictly within its boundaries; each iteration terminates with a report.

---

## Roles

**Human:** defines goals, maintains context, approves modifications, evolves structure.
**Agent:** executes tasks within context boundaries, modifies the product, maintains internal consistency, produces reports.

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

Agent behavior is determined exclusively by documents located in `./ctx/`.

Recommended documents include: `ctx/AGENTS.md` (structure of the project cognitive context), `ctx/agent/AGENTS.md` (local agent rules), and `ctx/docs/product/AGENTS.md` (base product description).

---

## AGENTS.md Hierarchy

If additional `AGENTS.md` files exist in subdirectories (for example, `ctx/docs/architecture/AGENTS.md` or `src/module/AGENTS.md`), they are treated as part of the cognitive context within the boundaries of their directory level.

### ADSM Rule

When executing a task in directory `X`, the working context of the agent is the aggregate of all `AGENTS.md` files located along the path from the project root to directory `X`; rules defined in deeper directories override rules from higher levels within their scope; all discovered `AGENTS.md` files must be interpreted as a single coherent rule system; overlaps are resolved according to directory hierarchy; invariants defined in the root `AGENTS.md` are mandatory and cannot be overridden.

---

## Requirements for Local AGENTS.md (Level Maps)

Each `AGENTS.md` located inside subdirectories of `ctx/` must contain a **Level Map**, which is a formal declarative description of the documentation structure of that directory.

### Level Map Invariant

The file must contain a mandatory section:

```md
## Level Map

- `<directory>/` — declarative description of directory purpose.
- …
- `<file>.md` — declarative description of file purpose.
- …
```

Formatting requirements: the list begins with directories followed by files; directories are sorted alphabetically; files are sorted alphabetically; each element description must declaratively state its purpose; the `AGENTS.md` file of the level itself must be included in the list; the level map must correspond to the actual directory structure and serve as a navigational anchor for the agent.

### Purpose of the Level Map

The level map defines the boundaries of the governed space, provides documentation navigation without filesystem analysis, and ensures structural uniformity of context levels in accordance with this root document.

---

## `@LLM-DOC` Comments

`@LLM-DOC` defines a protected context embedded in source code; it is permitted only in source files; it must be written in English; the agent must recognize the marker and must not modify or remove it; violation constitutes an `execution error`.

---

## Reporting

Each iteration must produce a report located at `./ctx/agent/report/YYYY/MM/DD/HH-MM-{title}.md`; the report must contain the goal, performed actions, and produced artifacts; absence of a report constitutes an `execution error`; if `ctx/agent/report-template.md` exists, it must be used; an iteration is incomplete until the report is created.

---

## Compatibility

The root `AGENTS.md` defines methodological invariants and is reused without modification across projects; project-specific rules are defined only within `./ctx/` and in `@LLM-DOC`.

---

## `output.md` Files

Files named `output.md` are not part of the cognitive context and must be ignored by the agent.
