# DepId DTO (Code-Level Specification)

Path: `./ctx/docs/code/depid.md`

## Purpose

This document defines the implementation-level contract of `src2/Dto/DepId.mjs` in the current project state. It fixes the DTO shape, normalization rules, immutability mode, and responsibility boundaries of the `DepId` factory without redefining parser grammar or immutable-core architecture semantics.

## Normative References

The `DepId` DTO contract is implementation-level and must remain aligned with:

- `ctx/docs/architecture/depid-model.md`
- `ctx/docs/architecture/overview.md`
- `ctx/docs/code/parser.md`
- `src2/Dto/DepId.mjs`
- `src2/Enum/Platform.mjs`
- `src2/Enum/Composition.mjs`
- `src2/Enum/Life.mjs`

## Architectural Boundary

Architectural documents define semantic meanings of dependency identity (`as-is`/`factory`, `direct`/`singleton`/`transient`) and parser invariants. The code-level DTO stores compact canonical literals used by the current implementation and does not perform semantic interpretation. Semantic mapping and invariant enforcement belong to the parser boundary.

## DTO Shape

`DepId` DTO contains exactly seven public fields:

- `moduleName: string`
- `platform: 'teq' | 'node' | 'npm'`
- `exportName: string | null`
- `composition: 'A' | 'F'`
- `life: 'S' | 'I' | null`
- `wrappers: string[]`
- `origin: string`

`origin` is mandatory in the DTO shape, but does not participate in structural identity comparison.

## Enum Literals in Current Implementation

Factory admissibility checks are based on current enum modules:

- `Platform`: `teq | node | npm`
- `Composition`: `A | F` (`AS_IS | FACTORY`)
- `Life`: `S | I` (`SINGLETON | INSTANCE`)

Code-level `life = null` is allowed and represents the non-lifecycle case in the current parser contract.

## Factory Interface

`src2/Dto/DepId.mjs` exports class `Factory` with method `create(input, options)`.

Factory contract:

- accepts any JavaScript value as `input`;
- accepts any JavaScript value as `options`;
- never throws;
- always returns a `DTO` instance;
- supports optional immutable mode through `options.immutable === true`.

## Normalization Rules

Factory normalization in current implementation is deterministic and field-local:

- `moduleName`: non-string -> `''`;
- `platform`: non-admissible literal -> `'teq'`;
- `exportName`: value other than `string | null` -> `null`;
- `composition`: non-admissible literal -> `'A'`;
- `life`: non-admissible literal -> `null`;
- `wrappers`: non-array -> `[]`, array -> keep only string items in original order;
- `origin`: non-string -> `''`.

The factory does not derive any field from other fields and does not mutate input objects.

## Immutability Mode

When `options.immutable === true`, the factory:

1. freezes `dto.wrappers`;
2. freezes `dto` itself.

The wrappers array is created by `Array.prototype.filter`, so the DTO never keeps an external array reference from input.

When immutable mode is not enabled, returned DTO and wrappers remain mutable.

## Responsibility Boundary

The DTO factory is responsible only for structural normalization and admissibility of single fields. The factory is not responsible for parser-level or architecture-level cross-field invariants, including lifecycle/composition/export consistency. Such invariants are enforced before immutable-core linking and are outside the DTO contract.

## Identity Boundary

For identity semantics at architecture level, `origin` is excluded and all remaining fields are identity-relevant. The DTO itself does not implement equality, hashing, or semantic validation.

## Prohibited Expansions of DTO Responsibility

The current code-level contract prohibits adding parser or linking behavior into `DepId` factory, including:

- CDC parsing;
- cross-field invariant validation;
- resolver-specific logic;
- lifecycle cache semantics;
- wrapper execution.

## Summary

In the current project state, `DepId` is a structural DTO with compact enum literals (`A/F`, `S/I/null`) and a non-throwing normalization factory. Architectural semantics and invariant enforcement remain outside this factory and are handled at parser and immutable-core boundaries.
