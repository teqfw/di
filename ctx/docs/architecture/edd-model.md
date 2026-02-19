# External Dependency Declaration (EDD)

Path: `./ctx/docs/architecture/edd-model.md`

## Purpose

This document defines the architectural model of the External Dependency Declaration (EDD), its semantic role, and its boundary with the structural canonical identity (`DepId`).

It defines the parser as a configuration-level boundary component and clarifies compatibility rules across different EDD encoding schemes (parser profiles).

## Definition

An External Dependency Declaration (EDD) is the only permitted form of dependency description at the application level.

EDD is:

- a string,
- case-sensitive,
- semantically encoded by the configured parser profile,
- part of the public architectural contract of an application.

The architecture does not impose a concrete surface grammar for EDD. Admissibility and interpretation rules are defined by the configured parser profile.

## Architectural Role

EDD is the public architectural name of a dependency within a given application.

Changing semantic interpretation of EDD in a way that alters the resulting structural canonical `DepId` constitutes a breaking architectural change.

EDD is not a structural model. It is a semantically encoded identifier interpreted by a parser defined in container configuration.

EDD may encode:

- dependency identity,
- export-related information,
- composition semantics,
- lifecycle policy,
- wrapper semantics,
- or other semantics defined by the selected parser profile.

The architecture does not regulate internal segmentation or naming conventions within EDD. Structural conventions are outside the scope of the EDD model.

## Parser

A parser is a configuration-defined component responsible for transforming EDD into an initial structural canonical representation (`DepId₀`).

Each runtime instance uses exactly one parser selected during container configuration.

The parser:

- deterministically transforms EDD into `DepId₀`,
- may add default fields not explicitly encoded in EDD,
- defines the encoding system applicable to the supported subset of EDD,
- must preserve semantic injectivity: distinct semantic interpretations of EDD within the parser profile must not produce identical `DepId₀` values.

Deterministic syntactic sugar defined by the parser profile is permitted.

Injectivity applies strictly to the parser stage.

Canonicalization is not part of the immutable core linking pipeline. It is performed by the configured parser before core linking begins.

If an EDD string is rejected by the configured parser profile, the parser throws a standard `Error`.

For an EDD string accepted by the configured parser profile, construction of `DepId₀` must succeed.

## Structural Canonical Representation (DepId)

`DepId` is a structural DTO used exclusively inside the linking model and is the only structural canonical identity representation.

`DepId`:

- is produced initially by the parser,
- may be transformed by the preprocess stage defined in the linking model,
- cannot be created directly by application code,
- is not part of the public architectural contract,
- has a fixed structural definition,
- is not extended dynamically,
- is not persisted as an architectural entity outside linking.

The parser may normalize EDD internally as part of deterministic parsing. No intermediate canonical string representation is introduced as an architectural entity.

Each parser-supported semantic interpretation of EDD corresponds to exactly one initial structural canonical representation (`DepId₀`).

Final dependency identity used by the immutable core is defined after the preprocess stage in the linking model.

## Parser Variability and Compatibility

The architecture permits different EDD encoding schemes implemented through different parsers.

Different teams may define distinct EDD formats and corresponding parsers while using the same dependency container implementation.

Applications using different parsers are not required to be compatible with each other at the level of EDD.

Compatibility between applications with respect to dependency declarations is defined solely by shared parser profile.

Parser variability does not modify:

- the core linking pipeline,
- resolver semantics,
- lifecycle enforcement,
- freeze semantics,
- or core determinism guarantees.

The linking architecture remains invariant across parser variants.

## Default Parser Profile

The product distribution provides a canonical default parser profile and a corresponding default EDD encoding scheme.

Use of the default profile is not architecturally mandatory.

Replacing the parser is a configuration-level decision that defines a different EDD profile while preserving the same immutable core linking architecture.

The canonical default profile is defined in product documentation and is explicitly replaceable via custom parser configuration.

Normative default-profile grammar, transformation rules, and validation rules are defined in:

- `ctx/docs/product/parser/default-profile/grammar.md`
- `ctx/docs/product/parser/default-profile/transformation.md`
- `ctx/docs/product/parser/default-profile/validation.md`

Normative product positioning, stability guarantees, compatibility guarantees, and breaking-change policy for the default profile are defined in `ctx/docs/product/default-edd-profile.md`.

## Boundary Between EDD and Core Linking

The architectural boundary is defined as follows:

- EDD belongs to the public application layer.
- The parser belongs to the configuration layer.
- `DepId` belongs to the internal linking layer.
- Immutable core linking semantics operates exclusively on the structural canonical representation (`DepId`) after the preprocess stage.

Determinism of structural canonicalization into `DepId` is defined by identical container configuration, identical parser, and identical EDD.

Determinism of the full linking process is defined in `architecture/linking-model.md` and additionally depends on identical dependency stack conditions.

The immutable linking pipeline begins only after the parser has produced the structural canonical representation (`DepId`).
