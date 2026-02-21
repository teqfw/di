# Logical Transformation Model (Default CDC Profile)

Path: `./ctx/docs/architecture/cdc-profile/default/transformation.md`

## 1. Scope

This document defines the normative semantic transformation from a default-profile CDC string to a structural canonical identity (`DepId`).

It defines mapping rules as a closed declarative model without prescribing a procedural parsing algorithm.

## 2. Input and Output

Input is a single CDC string.

Output is either:

- a fully constructed `DepId`, or
- a standard `Error`.

The transformation is pure, deterministic, and side-effect free.

`DepId.origin` MUST equal the input CDC string exactly, without normalization, trimming, or modification.

## 3. Decomposition

A CDC string is decomposed into:

- `platform`
- `moduleName`
- optional `exportName`
- `composition`
- `life`
- ordered `wrappers[]`

Segmentation and identifier constraints are defined in `ctx/docs/architecture/cdc-profile/default/grammar.md`.

## 4. Platform Mapping

Platform is derived from a reserved prefix of the CDC string:

- `node_` → `platform = 'node'` and the prefix is removed
- `npm_` → `platform = 'npm'` and the prefix is removed
- otherwise → `platform = 'teq'`

The explicit prefix `teq_` is forbidden and causes transformation failure.

## 5. Lifecycle and Wrapper Mapping

If a lifecycle marker is present as defined by the grammar, it maps to `DepId.life`:

- `$` → `life = 'singleton'`
- `$$` → `life = 'transient'`
- `$$$` → `life = 'direct'`

If lifecycle marker is absent, `life = 'direct'`.

Wrappers are an ordered suffix list defined only when a lifecycle marker is present. Wrapper identifiers are validated per grammar and are preserved exactly as declared. No normalization, deduplication, or reordering is performed.

If a wrapper-without-lifecycle form is present as defined by the grammar, transformation fails.

## 6. Export Mapping

Export is an optional `__ExportName` segment as defined by the grammar.

If an explicit export segment is present:

- `exportName = ExportName`

If export segment is absent:

- `exportName` is derived by composition rules.

## 7. Composition Derivation

Composition is derived deterministically as follows:

1. If a lifecycle marker is present, then `composition = 'factory'`.
2. Else if an explicit export segment is present, then `composition = 'factory'`.
3. Else `composition = 'as-is'`.

If `composition = 'as-is'`, then `exportName = null`.

If `composition = 'factory'` and export segment is absent, then `exportName = 'default'`.

## 8. Module Name Extraction

After removing platform prefix and extracting export, lifecycle, and wrapper segments, the remaining string is `moduleName`.

Constraints:

- `moduleName` must be non-empty.
- `moduleName` must not start with `_` or `$`.
- `moduleName` must not contain `$`.
- `moduleName` must not contain `__`.

If any constraint is violated, transformation fails.

## 9. DepId Construction

After all fields are derived, `DepId` is constructed with:

- `origin` = input string
- `platform` = derived platform
- `moduleName` = derived module name
- `exportName` = derived export name or `null`
- `composition` = derived composition
- `life` = derived lifecycle
- `wrappers` = derived wrapper list

## 10. Invariant Validation

After construction, structural invariants defined in `ctx/docs/architecture/depid-model.md` MUST hold. If invariants are violated, transformation fails with a standard `Error`.

## 11. Equivalence Classes

The default profile defines exactly one equivalence family:

Omission of the export segment in a dependency whose derived `composition = 'factory'` is semantically equivalent to explicit `__default` export.

No other equivalence classes are defined.

## 12. Injectivity and Determinism

For the default profile, two distinct CDC strings that are not members of the explicitly defined equivalence family MUST produce distinct `DepId` values.

The transformation defines a single semantic interpretation for each valid CDC string. No backtracking, fallback, or alternative interpretation is permitted. The result MUST be identical across all compliant implementations of the default profile.
