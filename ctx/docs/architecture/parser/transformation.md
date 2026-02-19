# Logical Transformation Model (Default EDD Profile)

Path: `./ctx/docs/architecture/parser/transformation.md`

## 1. Scope

This document defines the logical transformation of an EDD string into a `DepId` value object for the default EDD profile.

It specifies semantic mapping rules without prescribing a procedural parsing algorithm or implementation technique.

## 2. Input and Output

Input is a single EDD string.

Output is either:

- a fully constructed `DepId`, or
- a standard `Error`.

The transformation is pure, deterministic, and side-effect free.

The `origin` field of `DepId` is always equal to the input string without normalization, trimming, or modification.

## 3. Structural Decomposition Model

An EDD string is logically decomposed into the following components:

- `moduleName`
- optional `exportName`
- optional `lifecycle`
- optional ordered `wrappers[]`

Extraction is defined by semantic rules, not by parsing direction.

## 4. Lifecycle Mapping

Lifecycle is defined by a terminal dollar marker attached to the module core:

- `$` → `life = 'singleton'`
- `$$` → `life = 'transient'`
- `$$$` → `life = 'direct'`

Absence of a lifecycle marker implies:

- `life = 'direct'`

Only one lifecycle marker is permitted.

Lifecycle marker must appear after export (if present) and before wrapper segments.

## 5. Export Mapping

Export is defined by a single `__ExportName` segment.

Rules:

- At most one `__` delimiter is permitted.
- `exportName` must not contain `_`.
- `exportName` must not contain `$`.
- `exportName` may be `default`.
- Empty export segments are invalid.

Semantic mapping:

- If export is explicitly specified → `exportName = ExportName`.
- If export is omitted and `composition = 'factory'` → `exportName = 'default'`.
- If export is omitted and `composition = 'as-is'` → `exportName = null`.

Export without lifecycle is valid.

## 6. Composition Derivation

`composition` is derived from lifecycle and export presence.

Rules:

1. If `life = 'transient'`, then:
   - `composition = 'factory'`.

2. If `composition = 'factory'`, then:
   - `exportName != null`.

3. If `exportName = null`, then:
   - `composition = 'as-is'`.

If any rule is violated, transformation fails with a standard `Error`.

No other markers influence `composition`.

## 7. Wrapper Mapping

Wrappers are logically defined as ordered suffix segments following lifecycle markers.

Wrappers are permitted for all lifecycle modes, including `'direct'`.

Wrappers:

- are ordered and preserve declaration order;
- are not deduplicated;
- must not contain `_` beyond the leading wrapper marker;
- must not contain `$`;
- must not be empty.

Wrappers do not influence `platform`, `exportName`, `composition`, or `life`.

If wrapper segment is syntactically empty, transformation fails.

## 8. Module Name Extraction

After removing export, lifecycle, and wrapper segments, the remaining string is `moduleName`.

Constraints:

- `moduleName` must be non-empty.
- `moduleName` may contain `_`.
- `moduleName` must not contain `__`.
- `moduleName` must not contain `$`.

## 9. Platform Derivation

Platform is derived deterministically from `moduleName` prefix:

- `node_` → `platform = 'node'`
- `npm_` → `platform = 'npm'`
- otherwise → `platform = 'teq'`

If a reserved prefix is present, it is removed from `moduleName` before storing in `DepId`.

The explicit prefix `teq_` is not permitted.

No platform aliases are defined.

## 10. DepId Construction

After applying all logical mappings:

`DepId` fields are assigned as follows:

- `origin` = input string
- `moduleName` = derived module name
- `platform` = derived platform
- `exportName` = resolved export
- `wrappers` = ordered wrapper list
- `life` = derived lifecycle
- `composition` = derived composition

## 11. Invariant Validation

After construction, structural invariants defined in `ctx/docs/architecture/depid-model.md` must hold.

If invariants are violated, transformation fails with a standard `Error`.

No specialized error subclasses are defined.

## 12. Semantic Closure

The transformation for the default profile is closed over lifecycle, export, wrappers, and composition.

It defines exactly one semantic equivalence class:

Omission of export when `composition = 'factory'` maps to explicit `default` export.

No other alias classes are defined.

## 13. Determinism

The logical transformation defines a single semantic interpretation for each valid EDD string.

No backtracking, fallback, or alternative interpretation is permitted.

The result must be identical across all compliant implementations of the default profile.
