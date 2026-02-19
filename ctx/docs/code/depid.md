# DepId DTO (Code-Level Specification)

Path: `./ctx/docs/code/depid.md`

## Purpose

This document defines the engineering contract of the `DepId` DTO within the code layer of `@teqfw/di` (v2, `src2/`). It specifies its structural form, construction rules, immutability strategy, and boundaries of responsibility relative to the parser and the immutable linking core.

This document does not redefine architectural semantics of `DepId`. Architectural identity, invariants, and determinism guarantees are defined at the architecture level. This document defines only code-level structural guarantees.

## Architectural Position

`DepId` is the structural canonical dependency identity produced by the configured parser and consumed by the immutable core linking pipeline.

At the code level:

- `DepId` is implemented as a DTO.
- It is a pure structural data carrier.
- It contains no behavior.
- It contains no methods.
- It performs no semantic interpretation.
- It performs no derived-field computation.

All semantic interpretation of EDD — including lifecycle derivation, export normalization, platform derivation, and invariant validation — is performed by the parser before DTO construction.

## Structural Shape

`DepId` has the following fixed structural fields:

- `moduleName: string`
- `platform: 'src' | 'node' | 'npm'`
- `exportName: string | null`
- `composition: 'A' | 'F'`
- `life: 'S' | 'I' | null`
- `wrappers: string[]`
- `origin: string`

All fields are required. `origin` must always be present and must not be `null` or `undefined`.

`origin` does not participate in structural identity comparison but is mandatory for traceability and diagnostic consistency.

## Enum Model

Enumerated fields (`platform`, `composition`, `life`) are represented using TeqFW Enum objects as flat literal maps of primitive constants.

Enums in TeqFW:

- are flat literal objects,
- contain only primitive constant values,
- contain no logic,
- serve as structural constant sets.

The canonical enum modules and literal sets for `DepId` are:

- `src2/Enum/Platform.mjs` → `{ SRC: 'src', NODE: 'node', NPM: 'npm' }`
- `src2/Enum/Composition.mjs` → `{ A: 'A', F: 'F' }`
- `src2/Enum/Life.mjs` → `{ S: 'S', I: 'I' }`

The DTO stores canonical string literals as defined by the architecture. Symbol-based enums are prohibited because they break JSON compatibility and hashing determinism.

## Factory Responsibility

`DepId` instances are created exclusively through a factory.

The factory:

- accepts `undefined` or any arbitrary JavaScript value as input,
- never throws,
- always returns a structurally admissible DTO,
- does not compute derived fields,
- does not enforce semantic profile rules.

The factory performs structural normalization:

- missing or invalid primitive fields are replaced with structural defaults,
- invalid enum literals are replaced with canonical defaults,
- `exportName` is normalized to `string | null`,
- `life` is normalized to `'S' | 'I' | null`,
- `wrappers` is normalized to a cloned `string[]`,
- `origin` is always present as a string,
- no DTO field remains `undefined`.

The factory performs structural admissibility checks only:

- primitive type checks,
- enum literal admissibility checks,
- `wrappers` element type checks.

The factory does not:

- derive any field from another field,
- derive `composition` from `life`,
- enforce lifecycle–composition relations,
- validate architectural cross-field invariants,
- reorder or deduplicate `wrappers`.

## Invariant Non-Enforcement Principle

The `DepId` factory intentionally does not enforce architectural cross-field invariants.

`DepId` at the code level is a structural DTO and not a semantic validator.

Architectural invariants — including lifecycle–composition consistency and wrapper applicability rules — are guaranteed exclusively by the parser before `DepId` enters the immutable core linking pipeline.

The DTO layer must not duplicate, partially enforce, or reinterpret parser logic.

Synthetic `DepId` instances created in controlled test environments may temporarily violate architectural invariants. Such instances are not considered valid inputs to the immutable core linking pipeline.

Invariant enforcement is therefore outside the responsibility of the DTO factory.

## Immutability Strategy

`DepId` supports mutable and immutable creation modes.

Immutable mode (`create(input, { immutable: true })`) is enforced as follows:

1. The `wrappers` array is cloned to detach it from external references.
2. The cloned array is frozen.
3. The DTO object itself is shallow-frozen.

Mutable mode does not freeze the DTO or `wrappers`.

Deep freeze is not required because all fields are primitives or frozen arrays of primitives.

The factory must not expose external mutable references through DTO fields.

## Structural Identity

Structural identity is defined exclusively by:

- `moduleName`
- `platform`
- `exportName`
- `composition`
- `life`
- `wrappers` (element-by-element, order preserved)

`origin` does not participate in structural identity.

The DTO does not implement equality or hashing. Any hashing or structural comparison mechanism is external and must operate exclusively on structural identity fields.

The DTO does not store a precomputed identity key.

## Creation Boundary

Architecturally, `DepId` is produced by the parser.

Application code must not construct `DepId` directly.

In test environments, synthetic construction is permitted only through the factory.

`DepId` must never exist without `origin`.

## Error Model at Code Level

The factory does not throw and does not signal failure. Structural invalidity is handled only by normalization to admissible structural values.

Semantic profile errors remain the parser responsibility and are outside DTO construction.

## Summary

At the code level, `DepId` is a strictly structural DTO that:

- represents canonical dependency identity,
- contains no behavior,
- performs no semantic logic,
- enforces structural admissibility only,
- intentionally does not enforce architectural invariants,
- supports optional immutability mode,
- preserves strict separation between parser semantics and structural representation.

This preserves deterministic linking semantics while maintaining a clear boundary between semantic interpretation and structural identity.
