# Parser → DepId Transformation (Default EDD Profile)

Path: `./ctx/docs/architecture/parser/overview.md`

## 1. Scope

This document specifies the deterministic transformation of an EDD string into a `DepId` value object for the default EDD profile only. It does not define a generic parser framework. Alternative profiles are permitted in the architecture but must be implemented as independent parsers with separate specifications.

## 2. Architectural Role

The parser is an architectural boundary component that converts a surface identifier (EDD) into a structural identity (`DepId`). It defines the only permitted entry point from string form into the deterministic runtime linking model. The parser does not perform module resolution, does not access loaders, and does not verify the existence of modules or exports. It produces a fully constructed `DepId` or fails.

## 3. Parser Contract

The parser is a pure deterministic function:

```txt
parse(edd: string) → DepId | Error
```

For the same input string and the same profile definition, the result must be identical across executions. The parser must not access runtime state or external systems. The default profile is fixed and not configurable; introduction of a new profile requires a distinct parser.

## 4. Determinism and Purity

The transformation is fully deterministic and side-effect free. All validation and interpretation rules are internal to the parser and depend solely on the input string. No fallback or recovery semantics are permitted. The parser follows fail-fast semantics: upon the first detected violation, it terminates with an error.

## 5. Grammar and Structural Restrictions

The EDD string must be a valid ASCII ECMAScript `IdentifierName`. Unicode characters are not permitted. The underscore `_` is permitted within `moduleName` but is forbidden within `wrapperName` and `exportName`. The dollar sign `$` is forbidden within `exportName`. Wrappers are permitted only when a lifecycle marker (`$` or `$$`) is present. Empty wrapper segments are forbidden. Export names may be explicitly specified using `__ExportName`, including `__default` without lifecycle.

## 6. Platform Derivation

The parser derives the `platform` field of `DepId` deterministically from the module prefix. Reserved prefixes are `node_` and `npm_`. Absence of a reserved prefix denotes the `src` platform. The explicit prefix `src_` is not permitted. No platform aliases are defined.

## 7. Default Export Semantics

`exportName` may be `null`, which denotes the entire ES module. When lifecycle is present and export is omitted, the default export is implied. The following semantic equivalences are defined:

```txt
Module$  ≡ Module__default$
Module$$ ≡ Module__default$$
```

No additional export-based equivalence classes are defined.

## 8. Semantic Equivalence Classes

The set of permitted surface-form equivalences is closed and consists exclusively of the default export alias when lifecycle is present. No other semantic equivalence classes are defined. Any future extension introducing new equivalences constitutes a breaking change.

## 9. Injectivity Guarantee

For any two EDD strings that are not members of the explicitly defined semantic equivalence class, the parser must produce distinct `DepId` values. Structural identity is determined exclusively by the fields of `DepId`. The original string is preserved in the `origin` field but is not part of identity.

## 10. Error Model

The parser produces one of the following error categories:

- `GrammarViolation` — the string does not satisfy ASCII `IdentifierName`.
- `ProfileViolation` — the string violates default profile rules.
- `DepIdInvariantViolation` — the constructed `DepId` violates structural invariants.

The parser terminates at the first detected violation. Error codes are not standardized; category-level classification is sufficient.

## 11. Boundary Between Parser and Resolver

The parser is responsible for grammar validation, profile validation, platform derivation, default completion rules, and construction of a valid `DepId`. The resolver operates exclusively on a valid `DepId` and performs module resolution and export verification. The resolver must not reinterpret the surface grammar of EDD.

## 12. Architectural Consistency

This specification preserves architectural invariants, deterministic runtime linking, structural identity of `DepId`, fail-fast semantics, and semantic injectivity. It does not introduce a canonical string identity layer and does not expand the extension surface of the default EDD profile.
