# Architecture Documentation (`./ctx/docs/architecture/`)

Path: `./ctx/docs/architecture/AGENTS.md`

## Purpose

The `ctx/docs/architecture/` directory defines the structural form of the system as a deterministic runtime linking architecture, including its immutable core semantics, extension boundaries, the CDC-to-`DepId` parser boundary, and the structural canonical dependency identity model (`DepId`).

## Level Boundaries

This level describes architectural invariants and structural relations between CDC declaration, parser boundary, structural canonical identity (`DepId`), and linking pipeline stages. It does not define product meaning, organizational procedures, or implementation-level coding conventions.

## Consistency Rule

Documents of this level must remain semantically aligned in the definitions of CDC, `DepId`, immutable core boundary, resolver semantics, lifecycle enforcement, freeze, fail-fast behavior, and acyclicity. Architectural terms may be refined across documents but must not introduce conflicting stage order, conflicting determinism scope, or conflicting extension permissions.

## Level Map

- `cdc-profile/` — normative CDC profile specifications, including the Default CDC Profile.
- `AGENTS.md` — this document, defining purpose, boundaries, and consistency rules of the architecture level.
- `cdc-model.md` — declarative model of Canonical Dependency Contract (CDC), parser role, and boundary to structural canonical identity (`DepId`).
- `depid-model.md` — declarative model of structural canonical dependency identity (`DepId`) and its immutable invariants.
- `invariants.md` — immutable architectural invariants that constrain all parser profiles and configurations.
- `linking-model.md` — immutable core linking pipeline, stage semantics, determinism scope, and failure semantics.
- `overview.md` — compact architectural overview of runtime linking form, extension surface, and prohibited actions.

## Summary

`ctx/docs/architecture/AGENTS.md` defines the governed scope of the architecture level and provides a navigational map of its documents while preserving internal semantic consistency requirements.
