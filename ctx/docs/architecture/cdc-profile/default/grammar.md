# Default CDC Profile Grammar

Path: `./ctx/docs/architecture/cdc-profile/default/grammar.md`

## 1. Scope

This document defines the normative surface grammar and deterministic segmentation rules of the canonical default CDC profile.

It defines lexical admissibility, structural shape, delimiter meaning, and segmentation order for interpreting a surface CDC string as a `DepId` input.

Semantic mapping to `DepId` fields and post-parse invariant validation are defined in:

- `ctx/docs/architecture/cdc-profile/default/transformation.md`
- `ctx/docs/architecture/cdc-profile/default/validation.md`

## 2. Parser Contract

The profile defines a pure deterministic mapping:

```
parse(cdc: string) → DepId
```

The parser is deterministic, side-effect free, and fail-fast. It does not perform module resolution and does not verify module or export existence.

## 3. Lexical Admissibility

A CDC string MUST satisfy the base lexical class:

```
AsciiCdcIdentifier := [$A-Za-z_][$0-9A-Za-z_]*
```

ASCII only. Unicode is forbidden. Lexical admissibility does not imply profile validity.

## 4. Surface Shape

The surface shape is:

```
CDC :=
  [PlatformPrefix]
  ModuleName
  [ExportSegment]
  [LifecycleAndWrappers]
```

Where:

```
PlatformPrefix ::= "node_" | "npm_"

ExportSegment ::= "__" ExportName

LifecycleAndWrappers ::= LifecycleMarker WrapperTail

LifecycleMarker ::= "$" | "$$" | "$$$"

WrapperTail ::= ("_" WrapperId)*
```

The explicit platform prefix `teq_` is forbidden.

## 5. Identifier Classes (Profile)

This profile constrains identifiers as follows:

- `ModuleName` is an `AsciiCdcIdentifier` segment after platform-prefix removal and before export/lifecycle/wrapper extraction.
- `ExportName` MUST be non-empty and MUST NOT contain `_` or `$`.
- `WrapperId` MUST be non-empty, MUST NOT contain `_` or `$`, and MUST NOT be equal to `default`.

The profile defines `WrapperId` lexical admissibility as:

```
WrapperId := [a-z][0-9A-Za-z]*
```

## 6. Deterministic Segmentation Order

Segmentation MUST follow this order and MUST yield a single unambiguous decomposition.

### Step 1 — Platform prefix

If the string begins with:

- `node_` → platform is `node` and the prefix is removed
- `npm_` → platform is `npm` and the prefix is removed
- otherwise → platform is `teq` and no prefix is removed

If the string begins with `teq_`, parsing fails.

### Step 2 — Lifecycle marker and wrapper tail

If the remaining string contains a lifecycle marker, it MUST appear as a terminal segment in the form:

```
LifecycleMarker ( "_" WrapperId )*
```

If such segment is present, it is removed from the tail and recorded as:

- a lifecycle marker (`$`, `$$`, or `$$$`)
- an ordered wrapper list (possibly empty)

If no lifecycle marker is present:

- wrappers are forbidden by this profile
- a terminal suffix matching `"_" WrapperId` is treated as an invalid wrapper-without-lifecycle form and causes parsing failure

### Step 3 — Export segment

If the remaining string contains `"__"`:

- split at the last `"__"`
- the right side is `ExportName`
- the left side is `ModuleName`

If no `"__"` is present:

- `exportName` is omitted
- the entire remaining string is `ModuleName`

### Step 4 — Module name constraints

`ModuleName` MUST be non-empty and MUST NOT start with `$` or `_`.

## 7. Lifecycle Mapping

Lifecycle markers map to `DepId.life` as:

- `$` → `singleton`
- `$$` → `transient`
- `$$$` → `direct`

If lifecycle marker is absent, `life = 'direct'`.

## 8. Export and Default Export Notes

The literal export name `default` denotes the default export.

The default profile defines a single equivalence family for default export omission in factory composition:

```
Module$     ≡ Module__default$
Module$$    ≡ Module__default$$
Module$$$   ≡ Module__default$$$
Module__X$  ≢ Module__default$       (unless X is literally "default")
```

No other equivalence classes are defined by the profile.

## 9. Wrapper Notes

Wrappers are ordered, participate in structural identity, and preserve declaration order. No normalization, deduplication, or reordering is performed.

Wrappers are syntactically admissible only when a lifecycle marker is present.

## 10. Error Semantics

On the first violation of lexical admissibility, segmentation rules, or profile constraints, parsing fails by throwing a standard `Error`. No recovery, fallback, or alternative interpretation is permitted.
