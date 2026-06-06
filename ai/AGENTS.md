# AGENTS.md

Version: 20260606

## Purpose

This file defines the `ai/` level for agent-facing package documentation included in the distributable package.

The `ai/` directory provides a compact machine-oriented interface for agents that need to understand and use the package correctly.

## Level Boundary

This level defines:

- what documents exist in `ai/`;
- what each document is for;
- how an agent should navigate this directory;
- which documents describe supported usage.

This level does not define:

- repository organization;
- development workflow;
- testing strategy;
- internal implementation details that are not part of the supported surface;
- behavior not described by the documents in `ai/`.

## Level Map

- `AGENTS.md` — entry point for this level; defines scope, navigation, and authority.
- `concepts.md` — core concepts behind runtime linking and dependency contracts.
- `container.md` — container lifecycle, state model, and resolution pipeline.
- `dependency-id.md` — normative CDC grammar and interpretation rules.
- `extensions.md` — preprocess hooks, postprocess hooks, and wrapper exports.
- `package-api.ts` — machine-readable contract of the supported programmatic surface.
- `usage.md` — canonical usage patterns and short integration recipes.

## Reading Guide

Read documents by task:

- for supported imports and public surface, start with `package-api.ts`;
- for CDC syntax and meaning, read `dependency-id.md`;
- for runtime behavior of the container, read `container.md`;
- for extension behavior, read `extensions.md`;
- for practical integration examples, read `usage.md`;
- for conceptual orientation, read `concepts.md`.

If the task is broad or unclear, read in this order:

1. `AGENTS.md`
2. `package-api.ts`
3. `usage.md`
4. `dependency-id.md`
5. `container.md`
6. remaining documents as needed

## Authority

The documents in `ai/` define the supported agent-facing usage semantics of the package.

Agents should rely on these documents for package use and should treat behavior not described here as undefined.
