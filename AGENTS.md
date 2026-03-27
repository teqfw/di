# Root Level

- Path: `AGENTS.md`
- Template Version: `20260327`

## Purpose

This root file defines the invariant rules of ADSM (Agent-Driven Software Management), establishes the roles of the Human and the Agent, specifies the structure of the cognitive context, and determines operational constraints; it is read by the agent before any project-level instructions.

## Level Map

- `ctx/` — cognitive context containing documentation, rules, and specifications; entry point: `ctx/AGENTS.md`
- `AGENTS.md` — root-level invariant rules for agents
- `README.md` — project description

The exact structure of the project root and its directories is defined within the cognitive context.

## Level Boundary

This level defines:

- ADSM invariants and principles
- interaction model between Human and Agent
- roles and responsibilities
- global execution constraints
- structure and semantics of the cognitive context
- rules of consistency between context and product
- repository separation rules
- AGENTS.md hierarchy and resolution model

This level does NOT define:

- project-specific logic
- domain-specific documentation
- implementation details of the product
- directory structure beyond its minimal invariants
- local rules inside `ctx/`
- task-specific instructions (they come from external prompts)

## ADSM Principles

### Project Spaces

A project consists of two interconnected spaces: the **Cognitive Context** (`./ctx/`) and the **Software Product** (all files outside `ctx/`); the context governs modifications of the product, and the product reflects application of the context.

### Interaction Model

The Human defines goals, maintains the context, and approves changes; the Agent interprets the context and modifies the product strictly within its boundaries; each iteration terminates with a report, whose structure and format are defined within the cognitive context.

## Roles

**Human:** defines goals, maintains context, approves modifications, evolves structure.  
**Agent:** executes tasks within context boundaries, modifies the product, maintains internal consistency, produces reports.

## Context Resolution

Agent behavior is determined exclusively by documents located in `./ctx/`.

The entry point of the cognitive context is:

```text
ctx/AGENTS.md
```

The external prompt defines the task but MUST be interpreted strictly within the cognitive context.

If a contradiction occurs between the prompt and the cognitive context, the cognitive context takes precedence.

The agent MUST interpret the prompt through the context before performing any action.

If the cognitive context (`./ctx/`) is missing, empty, or inaccessible, the agent MUST NOT perform any actions and MUST terminate with an execution error. The agent MAY report this error using any format permitted by the current interaction channel.

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

If additional `AGENTS.md` files exist in subdirectories, they are treated as part of the cognitive context within the boundaries of their directory level.

### ADSM Rule

When executing a task in directory `X`, the working context of the agent is the aggregate of all `AGENTS.md` files located along the path from the project root to directory `X`; deeper levels override higher levels within scope; all files form a coherent rule system; root invariants are mandatory and cannot be overridden.

## Requirements for Local AGENTS.md (Level Maps)

Each `AGENTS.md` inside `ctx/` MUST contain a **Level Map**.

### Invariants

- directories first, then files
- alphabetical order within each group
- each element has a declarative purpose
- `AGENTS.md` MUST be included
- structure MUST match filesystem

The Level Map defines context boundaries and navigation.

## Compatibility

The root `AGENTS.md` defines methodological invariants and is reused across projects; project-specific rules are defined only within `./ctx/`.
