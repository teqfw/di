# Parser → DepId Transformation (Default EDD Profile)

Path: `./ctx/docs/architecture/parser/overview.md`

## 1. Scope

This document specifies the deterministic transformation of an EDD string into a `DepId` value object for the default EDD profile only. It does not define a generic parser framework. Alternative profiles are permitted in the architecture but must be implemented as independent parsers with separate specifications.

## 2. Architectural Role

The parser is an architectural boundary component that converts a surface identifier (EDD) into a structural identity (`DepId`). It defines the only permitted entry point from string form into the deterministic runtime linking model. The parser does not perform module resolution, does not access loaders, and does not verify the existence of modules or exports. It produces a fully constructed `DepId` or fails.

## 3. Parser Contract

The parser is a pure deterministic function:

```txt
parse(edd: string) → DepId
```

For the same input string and the same profile definition, the result must be identical across executions. The parser must not access runtime state or external systems. The default profile is fixed and not configurable; introduction of a new profile requires a distinct parser.

## 4. Determinism and Purity

The transformation is fully deterministic and side-effect free. All validation and interpretation rules are internal to the parser and depend solely on the input string. No fallback or recovery semantics are permitted. The parser follows fail-fast semantics: upon the first detected violation, it throws an error.

## 5. Grammar and Structural Restrictions

The EDD string must be a valid `AsciiEddIdentifier` as defined in `ctx/docs/architecture/edd-model.md`. Unicode characters are not permitted. The underscore `_` is permitted within `moduleName` but is forbidden within `wrapperName` and `exportName`. The dollar sign `$` is forbidden within `exportName`. Wrappers are permitted only when a lifecycle marker (`$` or `$$`) is present. Wrappers are not permitted for whole-module import (`exportName = null`). Empty wrapper segments are forbidden. Export names may be explicitly specified using `__ExportName`, including `__default` without lifecycle.

## 6. Platform Derivation

The parser derives the `platform` field of `DepId` deterministically from the module prefix. Reserved prefixes are `node_` and `npm_`. Absence of a reserved prefix denotes the `src` platform. The explicit prefix `src_` is not permitted. No platform aliases are defined.

## 7. Default Export Semantics

`exportName` may be `null`, which denotes the entire ES module. If lifecycle is present and export is omitted, `exportName = 'default'`. If lifecycle is absent and export is omitted, `exportName = null`. The following semantic equivalences are defined:

```txt
Module$  ≡ Module__default$
Module$$ ≡ Module__default$$
```

No additional export-based equivalence classes are defined.

## 8. Semantic Equivalence Classes

The set of permitted surface-form equivalences is closed and consists exclusively of the default export alias when lifecycle is present. No other semantic equivalence classes are defined. Any future extension introducing new equivalences constitutes a breaking change.

## 9. Closed Interaction Rules

The default profile defines a closed and deterministic interaction of lifecycle, export, wrappers, and composition:

1. Wrappers are allowed only when lifecycle is present.
2. Wrappers are not allowed for whole-module imports (`exportName = null`).
3. Lifecycle implies `composition = 'F'`.
4. Absence of lifecycle implies `composition = 'A'`.
5. If lifecycle is present and export is absent, `exportName = 'default'`.
6. If lifecycle is absent and export is absent, `exportName = null`.
7. `exportName = null` implies `wrappers.length = 0`.
8. Structural invariants are validated after transformation and `DepId` construction.
9. No semantic equivalence classes exist except the explicit default-export lifecycle alias.

These rules are implemented through the transformation mapping in `ctx/docs/architecture/parser/transformation.md` and are validated by profile and invariant checks in `ctx/docs/architecture/parser/validation.md` and `ctx/docs/architecture/depid-model.md`.

## 10. Injectivity Guarantee

For any two EDD strings that are not members of the explicitly defined semantic equivalence class, the parser must produce distinct `DepId` values. Structural identity is determined exclusively by the fields of `DepId`. The original string is preserved in the `origin` field but is not part of identity.

## 11. Error Model

The parser produces one of the following error categories:

- `GrammarViolation` — the string does not satisfy `AsciiEddIdentifier`.
- `ProfileViolation` — the string violates default profile rules.
- `DepIdInvariantViolation` — the constructed `DepId` violates structural invariants.

The parser terminates at the first detected violation. Error codes are not standardized; category-level classification is sufficient.

## 12. Boundary Between Parser and Resolver

The parser is responsible for grammar validation, profile validation, platform derivation, default completion rules, and construction of a valid `DepId`. The resolver operates exclusively on a valid `DepId` and performs module resolution only by loading the ES module namespace. Export selection and export existence verification are performed during instantiation. The resolver must not reinterpret the surface grammar of EDD.

## 13. Architectural Consistency

This specification preserves architectural invariants, deterministic runtime linking, structural identity of `DepId`, fail-fast semantics, and semantic injectivity. It does not introduce a canonical string identity layer and does not expand the extension surface of the default EDD profile.
