# Architecture Documentation (`./ctx/docs/architecture/`)

Path: `./ctx/docs/architecture/AGENTS.md`

## Purpose

The `ctx/docs/architecture/` directory defines the structural form of the system as a deterministic runtime linking architecture, including its immutable core semantics, extension boundaries, and structural canonical dependency identity model (`DepId`).

## Level Boundaries

This level describes architectural invariants and structural relations between dependency declaration, parser configuration, structural canonical identity (`DepId`), and linking pipeline stages. It does not define product meaning, organizational procedures, or implementation-level coding conventions.

## Consistency Rule

Documents of this level must remain semantically aligned in the definitions of `EDD`, `DepId`, immutable core boundary, resolver semantics, lifecycle enforcement, freeze, fail-fast behavior, and acyclicity. Architectural terms may be refined across documents but must not introduce conflicting stage order, conflicting determinism scope, or conflicting extension permissions.

## Level Map

- `AGENTS.md` — this document, defining purpose, boundaries, and consistency rules of the architecture level.
- `depid-model.md` — declarative model of structural canonical dependency identity (`DepId`) and its immutable invariants.
- `edd-model.md` — declarative model of External Dependency Declaration, parser role, and boundary to structural canonical identity (`DepId`).
- `invariants.md` — immutable architectural invariants that constrain all parser profiles and configurations.
- `linking-model.md` — immutable core linking pipeline, stage semantics, determinism scope, and failure semantics.
- `overview.md` — compact architectural overview of runtime linking form, extension surface, and prohibited actions.

## Summary

`ctx/docs/architecture/AGENTS.md` defines the governed scope of the architecture level and provides a navigational map of its documents while preserving internal semantic consistency requirements.
