# Default CDC Profile

Path: `./ctx/docs/product/default-cdc-profile.md`

## Purpose

This document defines product-level positioning of the canonical default CDC profile shipped with `@teqfw/di`: what profile is provided, what stability guarantees are expected, and how compatibility is defined.

## Product Position

The library `@teqfw/di` is the reference implementation of the method and provides the Default CDC Profile. Under this profile, CDC strings deterministically map to structural canonical identity (`DepId`).

CDC is a string-level canonical linking contract. `DepId` is the structural canonical identity object produced by CDC interpretation.

The default profile defines the standard dependency encoding scheme used in module-level dependency descriptors and is the compatibility target for consumers. The profile is designed to be mechanically reconstructible and stable under automated refactoring.

The product defines exactly one CDC interpretation: the Default CDC Profile.

## Normative Sources

Normative grammar, transformation rules, and validation rules of the default profile are defined in:

- `ctx/docs/architecture/cdc-profile/default/grammar.md`
- `ctx/docs/architecture/cdc-profile/default/transformation.md`
- `ctx/docs/architecture/cdc-profile/default/validation.md`

The immutable architectural boundary of the profile is defined by the following architecture documents:

- `ctx/docs/architecture/depid-model.md`
- `ctx/docs/architecture/invariants.md`
- `ctx/docs/architecture/linking-model.md`

These documents define the `DepId` structure, immutable linking semantics, determinism scope, injectivity requirements at the CDC-to-`DepId` boundary, and structural invariants that must hold for the reference implementation of the Default CDC Profile.

## Compatibility and Stability

The default CDC profile is immutable within a library version.

Any change that alters semantic interpretation of a previously valid CDC such that the resulting structural `DepId` changes is a breaking change.

Grammar evolution and syntactic expansions are permitted only when they do not change the resulting `DepId` for previously valid CDC inputs and do not alter the equivalence classes defined by the Default CDC Profile specification.

## Product Boundary

This document does not define CDC interpretation algorithms, resolver behavior, wrapper runtime implementation, or internal execution details. These concerns are defined at architecture and code levels within their respective boundaries.
