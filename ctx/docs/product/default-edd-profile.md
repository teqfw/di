# Default EDD Profile

Path: `./ctx/docs/product/default-edd-profile.md`

## Purpose

This document defines product-level positioning of the canonical default EDD profile shipped with `@teqfw/di`: what profile is provided, what stability guarantees are expected, and how compatibility is defined.

## Product Position

`@teqfw/di` ships with a canonical default EDD profile and a corresponding parser that maps EDD strings deterministically to structural canonical identity (`DepId`).

The default profile defines the standard dependency encoding scheme of the product and is the baseline compatibility target for consumers.

Use of the default profile is not mandatory. Applications may replace the parser with a different profile while preserving the same immutable core linking architecture.

Replacing the parser defines a different EDD profile and therefore a different compatibility space for dependency declarations. Compatibility between applications with respect to dependency declarations is guaranteed only when they share the same parser profile.

## Normative Sources

Normative grammar, transformation rules, and validation rules of the default profile are defined in:

- `ctx/docs/product/parser/default-profile/grammar.md`
- `ctx/docs/product/parser/default-profile/transformation.md`
- `ctx/docs/product/parser/default-profile/validation.md`

The immutable architectural boundary of the profile is defined by the following architecture documents:

- `ctx/docs/architecture/depid-model.md`
- `ctx/docs/architecture/invariants.md`
- `ctx/docs/architecture/linking-model.md`

These documents define the `DepId` structure, immutable linking semantics, determinism scope, injectivity requirements at the parser boundary, and structural invariants that must hold for any parser profile, including the default one.

## Compatibility and Stability

The default EDD profile is immutable within a library version.

Any change that alters semantic interpretation of a previously valid EDD such that the resulting structural `DepId` changes is a breaking change.

Additions that accept new EDD forms are non-breaking only when they do not change the resulting `DepId` for previously valid EDD inputs, preserve injectivity within the profile, and do not introduce new semantic equivalence classes beyond those explicitly defined in the default profile specification.

## Product Boundary

This document does not define parser algorithms, resolver behavior, wrapper implementation, or immutable linking-pipeline stages. These concerns are defined at architecture and code levels within their respective boundaries.
