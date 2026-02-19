# Parser → DepId Transformation (Default EDD Profile)

Path: `./ctx/docs/architecture/parser/overview.md`

## 1. Scope

This document specifies the deterministic transformation of an EDD string into a `DepId` value object for the default EDD profile only.

It does not define a generic parser framework. Alternative profiles are permitted in the architecture but must be implemented as independent parsers with separate specifications.

## 2. Architectural Role

The parser is an architectural boundary component that converts a surface identifier (EDD) into a structural identity (`DepId`).

It defines the only permitted entry point from string form into the deterministic runtime linking model.

The parser:

- does not perform module resolution,
- does not access loaders,
- does not verify module existence,
- does not verify export existence.

It produces a fully constructed `DepId` or throws an error.

## 3. Parser Contract

The parser is a pure deterministic function:

```
parse(edd: string) → DepId
```

For the same input string and the same profile definition, the result must be identical across executions.

The parser must not access runtime state or external systems.

The default profile is fixed and not configurable. Introduction of a new profile requires a distinct parser.

## 4. Determinism and Purity

The transformation is fully deterministic and side-effect free.

All validation and interpretation rules are internal to the parser and depend solely on the input string.

No fallback or recovery semantics are permitted.

The parser follows fail-fast semantics: upon the first detected violation, it throws a standard `Error`.

## 5. Grammar and Structural Restrictions

The EDD string must be a valid `AsciiEddIdentifier` as defined in `ctx/docs/architecture/edd-model.md`.

Unicode characters are not permitted.

Structural restrictions for the default profile:

- `_` is permitted within `moduleName`.
- `_` is forbidden within `exportName`.
- `_` is forbidden within wrapper identifiers except as the leading wrapper marker.
- `$` is forbidden within `exportName`.
- Empty wrapper segments are forbidden.
- Wrapper identifiers must satisfy the naming rule defined by the default profile.
- No implicit platform aliases are permitted.

The parser does not allow ambiguous grammar constructs.

## 6. Platform Derivation

The parser derives the `platform` field of `DepId` deterministically from the module prefix.

Reserved prefixes:

- `node_` → `platform = 'node'`
- `npm_` → `platform = 'npm'`

Absence of a reserved prefix denotes:

- `platform = 'teq'`

The explicit prefix `teq_` is not permitted.

No platform aliases are defined.

## 7. Lifecycle Mapping

Lifecycle is encoded using dollar markers:

- `$` → `life = 'singleton'`
- `$$` → `life = 'transient'`
- `$$$` → `life = 'direct'`

Absence of a lifecycle marker implies:

- `life = 'direct'`

Lifecycle markers must appear as a terminal segment before wrapper segments.

Lifecycle affects only the `life` field.

## 8. Composition Derivation

`composition` is derived from lifecycle and export presence according to the default profile rules:

1. If `life = 'transient'`, then `composition = 'factory'`.
2. If `composition = 'factory'`, then `exportName != null`.
3. If `exportName = null`, then `composition = 'as-is'`.

The parser rejects invalid combinations.

## 9. Export Semantics

`exportName` may be specified explicitly using:

```
Module__ExportName
```

The literal `__default` denotes the default export explicitly.

If export is omitted:

- and `composition = 'factory'`, then `exportName = 'default'`
- and `composition = 'as-is'`, then `exportName = null`

The parser defines the following equivalence class:

```
Module$   ≡ Module__default$
Module$$  ≡ Module__default$$
```

No additional export-based equivalence classes are defined.

## 10. Wrapper Semantics

Wrappers are expressed as ordered suffix segments following lifecycle markers.

Wrappers are permitted for all lifecycle modes, including `'direct'`.

Wrappers are applied in the order specified in the EDD string.

Wrappers are part of structural identity.

Wrappers do not influence `platform`, `exportName`, `composition`, or `life`.

## 11. Closed Interaction Rules

The default profile defines a closed and deterministic interaction of lifecycle, export, wrappers, and composition:

1. `life = 'transient'` implies `composition = 'factory'`.
2. `composition = 'factory'` implies `exportName != null`.
3. `exportName = null` implies `composition = 'as-is'`.
4. Wrappers are allowed for all valid combinations.
5. Wrapper order is preserved.
6. No implicit normalization beyond explicitly defined equivalences is permitted.

Structural invariants are validated after transformation and `DepId` construction.

## 12. Injectivity Guarantee

For any two EDD strings that are not members of explicitly defined semantic equivalence classes, the parser must produce distinct `DepId` values.

Structural identity is determined exclusively by the fields of `DepId`.

The original string is preserved in the `origin` field but is not part of identity.

## 13. Error Semantics

Upon the first detected violation of grammar rules, profile rules, or structural invariants, the parser throws a standard `Error`.

No specialized error subclasses or error categories are defined.

Error classification does not participate in architectural semantics.

Any parser error is a fatal linking error.

## 14. Boundary Between Parser and Resolver

The parser is responsible for:

- grammar validation,
- profile validation,
- platform derivation,
- lifecycle mapping,
- export derivation,
- wrapper extraction,
- construction of a valid `DepId`.

The resolver operates exclusively on a valid `DepId` and performs module resolution only by loading the ES module namespace.

Export selection and export existence verification are performed during instantiation.

The resolver must not reinterpret the surface grammar of EDD.

## 15. Architectural Consistency

This specification preserves:

- architectural invariants,
- deterministic runtime linking,
- structural identity of `DepId`,
- fail-fast semantics,
- semantic injectivity.

It does not introduce a canonical string identity layer and does not expand the extension surface of the default EDD profile.
