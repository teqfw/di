# Default EDD Profile Grammar

Path: `./ctx/docs/product/parser/default-profile/grammar.md`

## 1. Scope

This document defines the formal surface grammar of the default EDD profile and its deterministic transformation into a `DepId`.

It defines:

- lexical admissibility,
- structural grammar,
- parsing order,
- segmentation rules.

Semantic derivation and invariant validation are defined in dedicated documents.

## 2. Architectural Role

The parser converts a surface EDD string into a structural `DepId`.

The parser:

- does not perform module resolution,
- does not access runtime state,
- does not verify module or export existence.

It returns a fully constructed `DepId` or throws `Error`.

## 3. Parser Contract

```
parse(edd: string) → DepId
```

The transformation is:

- deterministic,
- pure,
- side-effect free,
- fail-fast.

## 4. Lexical Layer

EDD must match:

```
AsciiEddIdentifier := [$A-Za-z_][$0-9A-Za-z_]*
```

Constraints:

- ASCII only
- no leading digit
- no `. ( ) :`
- Unicode forbidden

Important:

Although lexical class allows leading `$` and `_`, semantic rules of this profile forbid leading `$` or `_` in `moduleName`.

Lexical admissibility does not imply structural validity.

## 5. Structural Grammar (Formal)

The default EDD profile follows this structure:

```
EDD :=
  [PlatformPrefix]
  ModuleName
  [ExportSegment]
  [LifecycleSegment]
  [WrapperSegment*]
```

Where:

```
PlatformPrefix  ::= "node_" | "npm_"

ExportSegment   ::= "__" ExportName

LifecycleSegment ::= "$" | "$$" | "$$$"

WrapperSegment  ::= "_" WrapperId
```

Additional structural constraints:

1. `moduleName` must not start with `$` or `_`.
2. `_` is permitted inside `moduleName`.
3. `_` is forbidden inside `ExportName`.
4. `$` is forbidden inside `ExportName`.
5. Wrapper identifiers must not contain `_`.
6. Empty wrapper segments are forbidden.

## 6. Parsing Order (Deterministic Segmentation Model)

Parsing MUST follow this exact order:

### Step 1 — Detect platform prefix

If string starts with:

- `node_` → platform = `node`
- `npm_` → platform = `npm`
- otherwise → platform = `teq`

Explicit `teq_` is forbidden.

### Step 2 — Detect lifecycle

Lifecycle is the maximal trailing sequence of `$` characters of length 1–3.

If present:

- it defines `life`
- it is removed from the tail
- wrapper parsing becomes permitted

If absent:

- `life = 'direct'`
- wrapper parsing is forbidden

### Step 3 — Parse wrappers

Wrappers are parsed only if lifecycle was detected.

Wrappers are parsed as ordered suffix segments:

```
"_" WrapperId
```

Parsing continues until no more wrapper segments remain.

If lifecycle was absent and a wrapper-like suffix exists, parsing fails.

### Step 4 — Parse export

If remaining string contains `"__"`:

- split at the last `"__"`
- right side is `ExportName`
- left side is `ModuleName`

If no `"__"`:

- `exportName = null`
- entire remaining string is `ModuleName`

### Step 5 — Validate moduleName

`ModuleName`:

- must be non-empty
- must not start with `$`
- must not start with `_`

## 7. Wrapper Rule (Strict Form)

Wrapper segments are syntactically valid only if a lifecycle marker is present.

EDD strings without lifecycle marker MUST NOT contain wrapper segments.

An underscore occurring before lifecycle detection is part of `moduleName` and MUST NOT be interpreted as a wrapper.

## 8. Lifecycle Mapping

Lifecycle markers map as:

- `$` → `singleton`
- `$$` → `transient`
- `$$$` → `direct`

Absence of marker → `direct`

Lifecycle affects only the `life` field.

## 9. Export Semantics

Explicit export:

```
Module__ExportName
```

Literal `__default` explicitly denotes default export.

If export omitted:

- and `life = 'transient'` → `exportName = 'default'`
- and otherwise → `exportName = null`

Equivalence class:

```
Module$   ≡ Module__default$
Module$$  ≡ Module__default$$
```

No other equivalences exist.

## 10. Wrapper Semantics

Wrappers:

- are ordered,
- are part of structural identity,
- do not affect platform, exportName, life, or composition.

Wrapper order is preserved exactly as written.

No deduplication or normalization is performed.

## 11. Closed Interaction Rules

The default profile enforces:

1. `life = 'transient'` → `composition = 'factory'`
2. `composition = 'factory'` → `exportName != null`
3. `exportName = null` → `composition = 'as-is'`
4. Wrappers allowed only when lifecycle present
5. No implicit normalization beyond explicitly defined equivalences

## 12. Invalid Examples

The following are invalid:

```
Project_Package_Module_log
Project_Package_Module__namedExport_log
_log_Project_Module$
Project_Package_Module__named_Export$
Project_Package_Module____$
```

Reasons:

- wrapper without lifecycle
- invalid exportName
- invalid moduleName
- malformed export segment

## 13. Injectivity

Two distinct EDD strings that are not part of an explicitly defined equivalence class MUST produce distinct `DepId`.

Structural identity is defined exclusively by `DepId` fields.

## 14. Error Semantics

Upon first violation of lexical, structural, or profile rules, parser throws standard `Error`.

No recovery or fallback allowed.
