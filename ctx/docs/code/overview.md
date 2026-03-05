# Code Level Overview

Path: `./ctx/docs/code/overview.md`

## Purpose

The `code` level defines implementation-level invariants of `@teqfw/di`. It specifies how product meaning and architectural invariants are realized through component contracts, engineering conventions, and implementation layout rules.

This level does not redefine system meaning, architectural form, execution dynamics, or environmental constraints. It formalizes implementation obligations and boundaries.

## Scope

The `code` level governs:

- public and internal contracts of implementation components,
- normative engineering conventions for module and typing form,
- source and test layout invariants,
- implementation determinism and fail-fast obligations.

It does not define:

- domain semantics,
- architectural invariants,
- runtime deployment environment,
- organizational procedures.

## Internal Structure

The `code` level is organized into three subdomains:

- `components/` — component implementation contracts (`Container`, `Parser`, `Resolver`, `DepId`) that define interfaces, responsibilities, and behavioral boundaries.
- `conventions/` — cross-project and framework-specific engineering conventions, including ES module form, JSDoc structural typing rules, and TeqFW-specific DTO/Enum patterns.
- `layout/` — implementation structure and test-layout invariants (`src/` organization, dependency direction, and testing contract boundaries).

Each subdomain defines a distinct implementation boundary and must not duplicate statements from other ADSM levels.

## Invariant

All implementation artifacts MUST conform simultaneously to:

- architectural linking invariants,
- architectural execution model,
- product and architectural constraints,
- component contracts in `components/`,
- conventions in `conventions/`,
- structural and testing layout rules in `layout/`.

Violation of any invariant at this level constitutes a non-compliant implementation.
