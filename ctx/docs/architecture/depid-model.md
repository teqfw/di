# DepId Structural Canonical Representation

Path: `ctx/docs/architecture/depid-model.md`

## Purpose

This document defines the structural canonical representation (`DepId`) used as the sole dependency identity within `@teqfw/di`. `DepId` is the only identity object used by the immutable linking pipeline. No string-level identity participates in linking semantics.

## Architectural Role

`DepId` is the structural boundary between the parser and the immutable core linking pipeline. The parser produces `DepId₀`. All subsequent core stages operate exclusively on the structural fields of `DepId`.

Identity, determinism, and injectivity are defined strictly at the `DepId` level.

`DepId` is a structural DTO. It represents canonicalized dependency identity after parsing and before resolution. It does not perform semantic validation and does not contain behavior.

## Structural Definition

`DepId` is an immutable structural data carrier with the following fields:

- `moduleName: string`
- `platform: 'src' | 'node' | 'npm'`
- `exportName: string | null`
- `composition: 'as-is' | 'factory'`
- `life: 'singleton' | 'instance' | null`
- `wrappers: string[]`
- `origin: string`

All fields are immutable after construction.

The literal sets are closed and canonical:

- `platform ∈ {'src','node','npm'}`
- `composition ∈ {'as-is','factory'}`
- `life ∈ {'singleton','instance',null}`

Architectural semantics are defined exclusively in terms of these values.

## Structural Semantics

`moduleName` is the logical namespace identifier. Resolution to a physical resource is delegated to the resolver.

`platform` defines the execution domain of the module and participates in structural identity.

`exportName` is `null` for whole-module import. A non-null value denotes a named export. The literal `'default'` explicitly represents the default export. `exportName` participates in structural identity.

`composition` defines how the selected export is interpreted:

- `'as-is'` — the resolved export is returned directly.
- `'factory'` — the resolved export is invoked to produce a value.

`life` defines lifecycle policy when applicable:

- `'singleton'` — the produced instance is cached.
- `'instance'` — a new instance is produced per request.
- `null` — lifecycle is not applicable.

`wrappers` is an ordered list of wrapper identifiers applied after composition. Order is significant.

`origin` preserves the original EDD string for traceability and diagnostics. It does not participate in structural identity.

## Identity Semantics

Structural identity is defined exclusively by the following fields:

- `moduleName`
- `platform`
- `exportName`
- `composition`
- `life`
- `wrappers` (element-by-element, preserving order)

The `origin` field is excluded from identity comparison.

Equality and hashing mechanisms are external to `DepId`. Structural identity is a property of the data model, not object reference.

## Injectivity Requirement

For a given parser profile, distinct semantic interpretations of EDD MUST NOT produce identical structural `DepId` values.

Syntactic sugar is permitted only when it maps deterministically to identical structural fields defined by this model.

Injectivity is enforced at the parser boundary.

## Determinism Boundary

Given identical container configuration, identical parser profile, and identical `DepId`, the linking pipeline MUST produce identical resolution results.

`DepId` is therefore the canonical structural identity boundary for deterministic linking.

## Structural Invariants

The following cross-field conditions define the invariant requirements for `DepId` values entering the immutable core:

- If `composition = 'as-is'`, then `life = null`.
- If `life != null`, then `composition = 'factory'`.
- If `exportName = null`, then `wrappers.length = 0`.
- Wrapper order is preserved and significant.
- All fields except `origin` participate in structural identity.

These invariants describe the semantic consistency required for canonical dependency identity within the linking pipeline.

## Invariant Enforcement Boundary

Invariant enforcement is performed by the parser.

The parser MUST construct `DepId` values that satisfy all structural invariants.

The immutable core linking pipeline assumes that every `DepId` it receives satisfies these invariants.

`DepId` itself does not enforce cross-field invariants. Instances created outside the parser (for example in controlled test environments) may temporarily violate these conditions. Such instances are not considered valid inputs to the immutable core linking pipeline.

## Parser Consistency Boundary

Any parser profile that produces `DepId` must map lifecycle, export, composition, and wrappers so that structural invariants hold for successful parsing.

In the default profile, mapping and validation order are specified in:

- `ctx/docs/architecture/parser/transformation.md`
- `ctx/docs/architecture/parser/validation.md`

## Hashing Semantics

If hashing is implemented, it MUST be computed exclusively from the structural identity fields:

- `moduleName`
- `platform`
- `exportName`
- `composition`
- `life`
- `wrappers`

`origin` MUST NOT affect the hash.

Hash stability across runtime instances is required for deterministic behavior.

## Non-Goals

This document does not define:

- resolver algorithms,
- wrapper implementation details,
- parser grammar,
- container lifecycle behavior beyond identity participation.

`DepId` remains a purely structural canonical representation within the deterministic runtime linking architecture.
