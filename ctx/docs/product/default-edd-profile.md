# Default EDD Profile

Path: ctx/docs/product/default-edd-profile.md

## Purpose

This document specifies the default EDD surface syntax and its deterministic interpretation into the structural canonical representation (`DepId`) for `@teqfw/di`. The profile defines a compact ASCII `IdentifierName`-only encoding for module selection, optional export selection, optional lifecycle selection, and optional wrapper composition, and establishes the semantic and validation rules required for deterministic linking.

## Scope

The profile defines the surface grammar of EDD strings, the lexical and structural validation constraints required for unambiguous parsing, the deterministic interpretation rules mapping a valid EDD into a structural `DepId`, the semantic injectivity requirement, and the stability and compatibility guarantees of the profile within a library version.

## Profile Stability

The default EDD profile is immutable within a library version. Any change that alters the semantic interpretation of any valid EDD such that the resulting structural `DepId` differs constitutes a breaking change of the library. Additions that only extend accepted surface forms without changing the resulting structural `DepId` for previously valid EDD values are non-breaking only if they do not introduce semantic aliasing or violate injectivity.

## Architectural Boundary

EDD is an external dependency declaration token interpreted by the configured parser. Identity is defined exclusively by the structural canonical representation (`DepId`). No canonical string representation of EDD is introduced as an architectural entity, and any normalization performed by the parser is an internal deterministic step whose only result is the structural `DepId`.

## Structural Data Model

The interpretation result is a structural `DepId` with the following fields: `moduleName: string`, `platform: 'src' | 'node' | 'npm'`, `exportName: string | null`, `composition: 'A' | 'F'`, `life: 'S' | 'I' | null`, `wrappers: string[]`, and `origin: string`. `exportName = null` denotes whole-module import. `composition = 'A'` denotes returning the resolved export as-is. `composition = 'F'` denotes treating the resolved export as a factory function. `life` is meaningful only when `composition = 'F'`. `wrappers` is an ordered list and contributes to structural identity. `origin` stores the original EDD string without modification.

## Surface Syntax

An EDD value MUST be a valid ASCII ECMAScript `IdentifierName`. The characters `.`, `(`, `)`, `:`, whitespace, and any non-ASCII characters are forbidden. The substring `__` is reserved for export selection and MUST NOT appear inside a module name. The lifecycle markers `$` and `$$` are reserved suffixes and MUST NOT appear as part of a module name suffix. Wrapper names are underscore-delimited and therefore MUST NOT contain underscores.

### EBNF Grammar

```
EDD            = ModuleRef , [ ExportRef ] , [ Life ] , [ Wrappers ] ;
ModuleRef      = ModuleName ;
ExportRef      = "__" , ExportName ;
Life           = "$$" | "$" ;
Wrappers       = "_" , WrapperName , { "_" , WrapperName } ;
ModuleName     = IdentifierName ;
ExportName     = IdentifierName ;
WrapperName    = IdentifierName ;
```

## Lexical and Structural Validation Rules

V1. The entire EDD MUST be a valid ASCII `IdentifierName`.
V2. `ModuleName` MUST NOT contain the substring `__`.
V3. If a lifecycle suffix exists, it MUST be exactly one of `$` or `$$`, and no other trailing dollar sequence is permitted.
V4. `ModuleName` MUST NOT end with `$`.
V5. `WrapperName` MUST NOT contain `_`.
V6. If `Wrappers` are present, `Life` MUST be present.
V7. If `Wrappers` are present, `exportName` MUST NOT be `null`. Wrappers are not supported for whole-module imports.
V8. `platform` is derived from the `moduleName` prefix: `node_` implies `platform='node'`, `npm_` implies `platform='npm'`, otherwise `platform='src'`.
V9. For `platform='src'`, `moduleName` MUST NOT start with the reserved prefixes `node_` or `npm_`.
V10. The delimiter `__` MUST appear at most once in an EDD value.

## Deterministic Interpretation Rules

I1. `origin` is set to the original EDD string as provided to the container.
I2. The parser extracts `Life` from the end of the EDD string. If the string ends with `$$`, then `life='I'` and `composition='F'`. If it ends with `$`, then `life='S'` and `composition='F'`. Otherwise, `life=null` and `composition='A'`.
I3. If `composition='F'`, the parser checks for a wrapper segment immediately preceding the lifecycle suffix. A wrapper segment MUST begin with `_` and consists of one or more wrapper names separated by `_`. The resulting `wrappers` list preserves declaration order. If no wrapper segment is present, `wrappers=[]`.
I4. After removing `Life` and `Wrappers`, the remaining prefix is examined for export selection. If the prefix contains `__`, the substring after the last `__` is `exportName` and the substring before it is `moduleName`. If `__` is absent, interpretation proceeds according to I5.
I5. If `__` is absent and `composition='F'`, then `exportName='default'`. If `__` is absent and `composition='A'`, then `exportName=null`.
I6. `platform` is derived from `moduleName` according to rules V8–V9.
I7. The resulting fields form the structural canonical representation (`DepId`), which is the only identity used for linking.

## Semantic Injectivity

The parser MUST preserve semantic injectivity within this profile. Distinct semantic interpretations of EDD under these rules MUST NOT produce identical structural `DepId` values. Deterministic syntactic sugar is permitted only when it maps to a single semantic interpretation defined by this profile. For example, `Module$` and `Module__default$` are permitted to produce the same structural `DepId` because omission of the export segment in the presence of lifecycle deterministically implies `exportName='default'`.

## Platform Semantics

For `platform='src'`, `moduleName` is resolved according to namespace-to-path mapping rules of the project. For `platform='node'` and `platform='npm'`, `moduleName` encodes the platform-specific specifier in IdentifierName form and is interpreted by the resolver accordingly. The surface syntax remains IdentifierName-only regardless of platform.

## Wrappers Semantics

Wrappers decorate the resolved dependency value after composition is applied. Wrapper order is significant and contributes to structural identity. The default profile defines only their encoding and ordering; wrapper resolution and behavior are defined by the container runtime.

## Non-Goals

This profile does not define resolver implementation details beyond platform derivation, does not define wrapper implementations, does not introduce alternative surface syntaxes, and does not extend the container extension surface beyond the existing parser and wrapper mechanisms.
