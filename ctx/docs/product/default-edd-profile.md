# Default EDD Profile

Path: `./ctx/docs/product/default-edd-profile.md`

## Purpose

This document defines product-level positioning of the default EDD profile in `@teqfw/di`: what profile is provided, what stability guarantees are expected, and where normative parser semantics are defined.

## Product Position

`@teqfw/di` ships with a fixed default EDD profile that encodes dependency declarations as `AsciiEddIdentifier` strings and maps them deterministically to structural canonical identity (`DepId`). The default profile is part of the product contract and is the baseline compatibility target for consumers.

The default profile defines the standard dependency encoding scheme of the product and is expected to be used by the majority of applications.

Use of the default parser is not mandatory. Applications may replace it with a different parser profile while preserving the same immutable core linking architecture. Compatibility between applications with respect to dependency declarations is guaranteed only when they share the same parser profile.

## Normative Sources

Normative parser semantics of the default profile are defined at the architecture level and are not duplicated here:

- `ctx/docs/architecture/parser/overview.md`
- `ctx/docs/architecture/parser/validation.md`
- `ctx/docs/architecture/parser/transformation.md`
- `ctx/docs/architecture/parser/error-model.md`
- `ctx/docs/architecture/depid-model.md`

These documents define grammar constraints, validation rules, lifecycle/export/wrapper interaction, deterministic transformation, error classification, semantic injectivity boundaries, structural invariants, and permitted equivalence classes.

## Compatibility and Stability

The default EDD profile is immutable within a library version. Any change that alters semantic interpretation of a previously valid EDD such that the resulting structural `DepId` changes is a breaking change. Additions that do not alter structural outputs for previously valid inputs are non-breaking only if they preserve injectivity and do not introduce new equivalence classes beyond the architecture-defined set.

## Product Boundary

This document does not define parser algorithms, resolver behavior, wrapper implementation, or immutable linking-pipeline stages. These concerns are defined at architecture and code levels within their respective boundaries.
