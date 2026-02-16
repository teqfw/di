# DepId Structural Canonical Representation

Path: ctx/docs/architecture/depid-model.md

## Purpose

This document defines the structural canonical representation (`DepId`) used as the sole dependency identity within `@teqfw/di`. `DepId` is the only identity object used by the linking pipeline. No string-level identity participates in linking semantics.

## Architectural Role

`DepId` is the structural boundary between the parser and the immutable linking pipeline. The parser produces `DepId₀`. All subsequent stages operate exclusively on the structural fields of `DepId`. Identity, determinism, and injectivity are defined strictly at the `DepId` level.

## Structural Definition

`DepId` is an immutable value object with the following fields: `moduleName: string`, `platform: 'src' | 'node' | 'npm'`, `exportName: string | null`, `composition: 'A' | 'F'`, `life: 'S' | 'I' | null`, `wrappers: string[]`, `origin: string`. All fields are immutable after construction.

## Field Semantics

`moduleName` is the logical module identifier in namespace form. Resolution to a physical resource is delegated to the resolver. `moduleName` does not encode export, lifecycle, or wrapper information.

`platform` defines the execution domain of the module. The default profile derives it from `moduleName`, but `DepId` stores it explicitly. `platform` participates in structural identity.

`exportName` is `null` for whole-module import. A non-null value denotes a named export. The literal `'default'` represents the default export explicitly. `exportName` participates in structural identity.

`composition` is `'A'` for as-is resolution, meaning the resolved export is returned directly. `composition` is `'F'` for factory resolution, meaning the resolved export is invoked to produce a value. `composition` participates in structural identity.

`life` is `'S'` for singleton lifecycle, `'I'` for instance lifecycle, and `null` when not applicable. `life` participates in structural identity when non-null.

`wrappers` is an ordered list of wrapper identifiers applied after composition. Wrapper order is significant and participates in structural identity.

`origin` stores the original EDD string as provided to the container. `origin` does not participate in structural identity comparison.

## Identity Semantics

Two `DepId` instances are equal if and only if the following fields are strictly equal: `moduleName`, `platform`, `exportName`, `composition`, `life`, and `wrappers` (element-by-element, preserving order). The `origin` field is excluded from identity comparison. Equality MUST be structural, not referential.

## Injectivity Requirement

For a given parser profile, distinct semantic interpretations of EDD MUST NOT produce identical structural `DepId` values. Syntactic sugar is permitted only when it maps deterministically to identical structural fields defined by this model.

## Determinism Boundary

Given identical container configuration, identical parser profile, and identical `DepId`, the linking pipeline MUST produce identical resolution results. `DepId` is therefore the canonical structural identity boundary for deterministic linking.

## Structural Invariants

If `composition = 'A'`, then `life = null`. If `life != null`, then `composition = 'F'`. If `exportName = null`, then `wrappers.length = 0`. Wrapper order is preserved and significant. All fields except `origin` participate in structural identity.

## Parser Consistency Boundary

Any parser profile that produces `DepId` must map lifecycle, export, composition, and wrappers so that these structural invariants always hold for successful parsing. In the default profile, this mapping and its validation order are specified in `ctx/docs/architecture/parser/transformation.md` and `ctx/docs/architecture/parser/validation.md`, and invariant validation is performed after `DepId` construction.

## Hashing Semantics

If hashing is implemented, the hash MUST be computed exclusively from the structural identity fields: `moduleName`, `platform`, `exportName`, `composition`, `life`, and `wrappers`. The `origin` field MUST NOT affect the hash. Hash stability across runtime instances is required for deterministic behavior.

## Non-Goals

This document does not define resolver algorithms, wrapper implementation details, parser grammar, or container lifecycle behavior beyond identity participation.
