# AGENTS.md — Entry Instruction for AI Agents

Path: `AGENTS.md`
Template Version: `20260325`

## Purpose

This root file defines the invariant rules of ADSM (Agent-Driven Software Management), establishes the roles of the Human and the Agent, specifies the structure of the cognitive context, and determines operational constraints; it is read by the agent before any project-level instructions.

## ADSM Principles

### Project Spaces

A project consists of two interconnected spaces: the **Cognitive Context** (`./ctx/`), which contains documentation, rules, and specifications, and the **Software Product** (all files outside `ctx/`), which contains source code and executable artifacts; the context governs modifications of the product, and the product reflects application of the context.

### Interaction Model

The Human defines goals, maintains the context, and approves changes; the Agent interprets the context and modifies the product strictly within its boundaries; each iteration terminates with a report.

## Roles

**Human:** defines goals, maintains context, approves modifications, evolves structure.  
**Agent:** executes tasks within context boundaries, modifies the product, maintains internal consistency, produces reports.

## Minimal Project Structure

```text
/
├─ ctx/         ← cognitive context
├─ AGENTS.md    ← agent instruction
└─ README.md    ← project description
```

## Context Dependencies

Agent behavior is determined exclusively by documents located in `./ctx/`.

Recommended documents include: `ctx/AGENTS.md` (structure of the project cognitive context), `ctx/agent/AGENTS.md` (local agent rules), and `ctx/docs/product/AGENTS.md` (base product description).

## Execution Bootstrap

The agent is initialized with an external prompt.

The prompt defines the task, but all actions MUST be constrained by the cognitive context (`./ctx/`).

If the prompt contradicts the context, the context takes precedence.

The agent MUST interpret the prompt through the context before performing any action.

If the cognitive context (`./ctx/`) is missing, empty, or inaccessible, the agent MUST NOT perform any actions and MUST terminate with an execution error.

## Context vs Code Consistency

If a mismatch between the cognitive context (`./ctx/`) and the software product is detected, the context MUST be treated as the source of truth.

The agent MUST modify the product to match the context.

Modification of the context is allowed only if explicitly required by the task defined in the prompt.

## Repository Boundaries

The cognitive context (`./ctx/`) MAY be mounted from a separate repository.

In such cases, the context and the product MUST be treated as independent version-controlled spaces.

### Rules

- Changes in `./ctx/` MUST be committed and pushed to the context repository.
- Changes outside `./ctx/` MUST be committed and pushed to the product repository.
- The agent MUST NOT mix changes between these repositories.
- The agent MUST NOT remove, replace, or unmount the `./ctx/` directory.

Violation of these rules constitutes an execution error.

## AGENTS.md Hierarchy

If additional `AGENTS.md` files exist in subdirectories (for example, `ctx/docs/architecture/AGENTS.md` or `src/module/AGENTS.md`), they are treated as part of the cognitive context within the boundaries of their directory level.

### ADSM Rule

When executing a task in directory `X`, the working context of the agent is the aggregate of all `AGENTS.md` files located along the path from the project root to directory `X`; rules defined in deeper directories override rules from higher levels within their scope; all discovered `AGENTS.md` files must be interpreted as a single coherent rule system; overlaps are resolved according to directory hierarchy; invariants defined in the root `AGENTS.md` are mandatory and cannot be overridden.

## Requirements for Local AGENTS.md (Level Maps)

Each `AGENTS.md` inside `ctx/` MUST contain a **Level Map** — a declarative description of the directory structure.

### Level Map

Mandatory section:

```md
## Level Map

- `<directory>/` — purpose
- …
- `<file>.md` — purpose
- …
```

### Invariants

- directories first, then files
- alphabetical order within each group
- each element has a declarative purpose
- `AGENTS.md` of the level MUST be included
- structure MUST match the actual filesystem

### Level Map Purpose

The Level Map defines the boundaries of the context and provides navigation for the agent.

## `@LLM-DOC` Comments

`@LLM-DOC` defines a protected context embedded in source code; it is permitted only in source files; it must be written in English; the agent must recognize the marker and must not modify or remove it; violation constitutes an `execution error`.

## Reporting

Each iteration MUST produce a report located at `./ctx/agent/report/YYYY/MM/DD/HH-MM-{title}.md`.

The report MUST contain:

- goal
- performed actions
- produced artifacts

Absence of a report constitutes an `execution error`.

If `ctx/agent/report-template.md` exists, it MUST be used.

An iteration is incomplete until the report is created.

## Compatibility

The root `AGENTS.md` defines methodological invariants and is reused without modification across projects; project-specific rules are defined only within `./ctx/` and in `@LLM-DOC`.

## `output.md` Files

Files named `output.md` are not part of the cognitive context and MUST be ignored by the agent.
