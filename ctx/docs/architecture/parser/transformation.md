# Logical Transformation Model (Default EDD Profile)

Path: `./ctx/docs/architecture/parser/transformation.md`

## 1. Scope

This document defines the logical transformation of an EDD string into a `DepId` value object for the default EDD profile. It specifies semantic mapping rules without prescribing a procedural parsing algorithm or implementation technique.

## 2. Input and Output

Input is a single EDD string. Output is either a fully constructed `DepId` or an error. The transformation is pure, deterministic, and side-effect free.

The `origin` field of `DepId` is always equal to the input string without normalization, trimming, or modification.

## 3. Structural Decomposition Model

An EDD string is logically decomposed into the following components:

- `moduleName`
- optional `exportName`
- optional `lifecycle`
- optional ordered `wrappers[]`

Extraction is defined by semantic rules, not by parsing direction.

## 4. Lifecycle and Composition

Lifecycle is defined by a `$` or `$$` marker attached to the base module segment. The lifecycle marker applies to the module core and may be followed by wrapper segments.

Only one lifecycle marker is permitted.

If lifecycle is present:

- `composition = F`
- lifecycle value is recorded in `DepId`

If lifecycle is absent:

- `composition = A`
- lifecycle is `null`

No other markers influence `composition`.

## 5. Export Mapping

Export is defined by a single `__ExportName` segment.

Rules:

- At most one `__` delimiter is permitted.
- `exportName` may not contain `_` or `$`.
- `exportName` may be `default`.
- Empty export segments are invalid.

Semantic mapping:

- If lifecycle is present and export is absent → `exportName = 'default'`.
- If lifecycle is absent and export is absent → `exportName = null`.
- If export is explicitly specified → `exportName = ExportName`.

`__Export` without lifecycle is valid and results in `composition = A`.

## 6. Wrapper Mapping

Wrappers are permitted only when lifecycle is present.

Wrappers are logically defined as ordered segments attached to a lifecycle instance.

If lifecycle is absent, wrappers are invalid.

If `exportName = null` (whole-module import), wrappers are invalid.

Wrappers:

- must not contain `_`
- must not contain `$`
- preserve declaration order
- are not deduplicated
- may be empty only if not present

Example of valid wrapper usage:

```txt
Module$_W1
```

In this case:

- lifecycle is `$`
- wrapper list is [`W1`]

If lifecycle is present and wrapper segment is syntactically empty, this is invalid.

## 7. Module Name

After removing lifecycle, wrappers, and export segments, the remaining string is `moduleName`.

Constraints:

- `moduleName` must be non-empty.
- `moduleName` may contain `_`.
- `moduleName` must not contain `__`.
- `moduleName` must not contain `$`.

## 8. Platform Derivation

Platform is derived deterministically from `moduleName` prefix:

- `node_` → platform = `node`
- `npm_` → platform = `npm`
- otherwise → platform = `src`

If a reserved prefix is present, it is removed from `moduleName` before storing in `DepId`.

The explicit prefix `src_` is not permitted.

## 9. DepId Construction

After applying all logical mappings:

`DepId` fields are assigned as follows:

- `origin` = input string
- `moduleName` = derived module name
- `platform` = derived platform
- `exportName` = resolved export (including default completion)
- `wrappers` = ordered wrapper list
- `life` = lifecycle or `null`
- `composition` = derived from lifecycle

## 10. Invariant Enforcement

After construction, structural invariants of `DepId` defined in `ctx/docs/architecture/depid-model.md` must be validated. If any invariant is violated, transformation fails with `DepIdInvariantViolation`.

## 11. Semantic Closure

The transformation for the default profile is closed over lifecycle, export, wrappers, and composition. It defines exactly one semantic alias class: omission of export when lifecycle is present maps to explicit `default` export. No other alias classes are defined.

## 12. Determinism

The logical transformation defines a single semantic interpretation for each valid EDD string. No backtracking, fallback, or alternative interpretation is permitted. The result must be identical across all compliant implementations of the default profile.
