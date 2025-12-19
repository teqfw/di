# Cognitive Layer of the Project

- Path: `./ctx/AGENTS.md`
- Version: `20251218`

## Purpose

The `ctx/` directory serves as the declarative core of the project’s cognitive layer. It synchronizes the agent’s organizational instructions with the project documentation, fixes shared invariants of the agent’s role, and defines two coordinated context branches: `agent/`, responsible for agent behavior and reporting, and `docs/`, which accumulates architecture, constraints, engineering rules, and product meaning. Both branches inherit the context of this level, operate under the same ADSM quality criteria, and do not overlap.

## Level Map

- `agent/` — operational level: local agent instructions, reporting, and interaction modes defined in `ctx/agent/AGENTS.md`.
- `docs/` — project documentation branch: the core of architecture, code, composition, environment constraints, and product descriptions defined in `ctx/docs/AGENTS.md`.
- `AGENTS.md` — this document, declaring the structure of `ctx/` and providing the entry point into the context.

## Structure and Relationships

Within `ctx/`, two context spaces coexist: organizational (how the agent operates) and declarative (how the project is described). The `agent/` branch fixes and controls interaction with the human, validates changes against invariants, and maintains reporting within `ctx/agent/AGENTS.md`. The `docs/` branch is responsible for describing meanings, architecture, and engineering norms in a way that can be reproduced in the code layer without conflicts.

A transparent boundary applies between the branches:  
`agent/` does not contain product or architectural descriptions;  
`docs/` does not duplicate organizational modes or reports.

Both branches complement the shared inheritance with guarantees fixed at the `ctx/` level.

## Context Hierarchy Principle

The base context for work at the `ctx/` level is determined by the documents on the path from the root `AGENTS.md` to the current space. When entering `ctx/docs/`, the agent first considers the declarations of this file, then `ctx/docs/AGENTS.md`, and only after that any local instructions. Subdirectories may reference higher levels and each other, but must not exceed the boundaries defined by the current `AGENTS.md`.

## ADSM Documentation Quality Criteria

Documents at the `ctx/` level are created in accordance with the eight ADSM quality criteria.

### 1. Declarativity

The document fixes properties, boundaries, and invariants of the level. It describes **what is true in the model**, not procedures, instructions, or action sequences.

### 2. Completeness

Purpose, boundaries, relationships, and mandatory invariants are reflected. No semantic gaps requiring inference remain.

### 3. Consistency

Statements are coherent within the level and with higher-level declarations. Conflicting definitions and overlaps are excluded.

### 4. Coherence

Document elements form a unified structure. Definitions, boundaries, and conclusions build a single context.

### 5. Density

Each fragment contributes independent knowledge. Duplication and vague formulations are excluded.

### 6. Compactness

Essence is conveyed with minimal means without loss of precision. The document is not overloaded with secondary details.

### 7. Non-redundancy

The document does not repeat statements fixed at other levels. Each layer carries only what belongs to its boundaries.

### 8. Absence of the Obvious

Properties that follow automatically from standard technology behavior are not fixed unless they are level invariants. Only what requires explicit declaration is закреплено.

## Requirements

Each document in the `ctx/` directory must specify its path immediately after the title:

```md
Path: `./ctx/.../doc-name.md`
```

Updates in the `docs/` branch must preserve the declarative style, comply with ADSM quality criteria, and respect the boundary between the `agent/` and `docs/` branches.

## Summary

`ctx/AGENTS.md` defines the structure of the project’s cognitive space and coordinates the `agent/` and `docs/` branches, ensuring a consistent and non-overlapping description of organizational and product knowledge.
