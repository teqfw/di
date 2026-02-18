# Code Level Overview

Path: `./ctx/docs/code/overview.md`

## Purpose

The `code` level defines implementation-level invariants of `@teqfw/di`. It specifies how architectural and compositional constraints are realized in source structure, component contracts, dependency direction, and public surface.

This level does not redefine system meaning, architectural form, execution dynamics, or environmental constraints. It formalizes implementation obligations and boundaries.

## Scope

The `code` level governs:

- public API contracts of implementation components,
- internal component interaction contracts,
- source directory structure,
- static dependency direction,
- implementation determinism and fail-fast obligations,
- test structure requirements.

It does not define:

- domain semantics,
- architectural invariants,
- runtime deployment environment,
- organizational procedures.

## Level Structure

The `code` level consists of:

- `structure.md` — physical layout and static dependency rules of `src2/`,
- `parser.md` — parser implementation contract,
- `container.md` — container implementation contract.

Each document defines a distinct implementation boundary and must not duplicate statements from other ADSM levels.

## Invariant

All implementation artifacts in `src2/` MUST conform simultaneously to:

- architectural linking invariants,
- composition-level execution model,
- constraints-level prohibitions,
- structural rules defined in `structure.md`,
- component contracts defined at this level.

Violation of any invariant at this level constitutes a non-compliant implementation.
