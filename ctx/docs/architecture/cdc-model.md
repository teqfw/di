# Canonical Dependency Contract (CDC)

Path: `./ctx/docs/architecture/cdc-model.md`

## Purpose

This document defines the architectural model of the Canonical Dependency Contract (CDC), its semantic role, and its boundary with the structural canonical identity (`DepId`).

It defines the parser as a configuration-level boundary component and clarifies compatibility rules across different CDC surface encodings (CDC profiles).

## Definition

A Canonical Dependency Contract (CDC) is the only permitted form of dependency declaration at the application level.

CDC is:

- a string,
- case-sensitive,
- semantically encoded by the configured CDC profile,
- part of the public architectural contract of an application.

At architecture level, admissibility and interpretation rules are defined by the selected CDC profile at the parser boundary. At product level, the supported CDC interpretation is fixed as the Default CDC Profile.

## Architectural Role

CDC is the public architectural name of a dependency within a given application.

Changing semantic interpretation of CDC in a way that alters the resulting structural canonical `DepId` constitutes a breaking architectural change.

CDC is not a structural model. It is a semantically encoded identifier interpreted by a parser defined in container configuration.

CDC may encode:

- dependency identity,
- export-related information,
- composition semantics,
- lifecycle policy,
- wrapper semantics,
- or other semantics defined by the selected parser profile.

The architecture does not regulate internal segmentation or naming conventions within CDC beyond the selected CDC profile. Structural conventions are outside the scope of the CDC model.

## Parser

A parser is a configuration-defined component responsible for transforming CDC into an initial structural canonical representation (`DepId₀`).

Each runtime instance uses exactly one parser selected during container configuration.

The parser:

- deterministically transforms CDC into `DepId₀`,
- may add default fields not explicitly encoded in CDC,
- defines the encoding system applicable to the supported subset of CDC under the selected profile,
- must preserve semantic injectivity: distinct semantic interpretations of CDC within the selected profile must not produce identical `DepId₀` values.

Deterministic syntactic sugar defined by the parser profile is permitted.

Injectivity applies strictly to the parser stage.

Canonicalization is not part of the immutable core linking pipeline. It is performed by the configured parser before core linking begins.

If a CDC string is rejected by the selected CDC profile, the parser throws a standard `Error`.

For a CDC string accepted by the selected CDC profile, construction of `DepId₀` must succeed.

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

The parser may normalize CDC internally as part of deterministic parsing. No intermediate canonical string representation is introduced as an architectural entity.

Each profile-supported semantic interpretation of CDC corresponds to exactly one initial structural canonical representation (`DepId₀`).

Final dependency identity used by the immutable core is defined after the preprocess stage in the linking model.

## Parser Variability and Compatibility

The architecture permits different CDC surface encodings implemented through different parsers.

Different teams may define distinct CDC surface encodings and corresponding parsers while using the same dependency container implementation.

Applications using different parsers are not required to be compatible with each other at the level of CDC surface contracts.

Compatibility between applications with respect to dependency declarations is defined by shared CDC profile.

Parser variability does not modify:

- the core linking pipeline,
- resolver semantics,
- lifecycle enforcement,
- freeze semantics,
- or core determinism guarantees.

The linking architecture remains invariant across parser variants.

## Default Parser Profile

The product distribution provides the Default CDC Profile and a corresponding reference parser.

At product level, the supported CDC interpretation is fixed as the Default CDC Profile. Parser replacement and alternative CDC surface encodings may be technically possible, but the resulting behavior is outside the product boundary.

Normative default-profile grammar, transformation rules, and validation rules are defined in:

- `ctx/docs/architecture/cdc-profile/default/grammar.md`
- `ctx/docs/architecture/cdc-profile/default/transformation.md`
- `ctx/docs/architecture/cdc-profile/default/validation.md`

Normative product positioning, stability guarantees, compatibility guarantees, and breaking-change policy for the Default CDC Profile are defined in `ctx/docs/product/default-cdc-profile.md`.

## Boundary Between CDC and Core Linking

The architectural boundary is defined as follows:

- CDC belongs to the public application layer.
- The parser belongs to the configuration layer.
- `DepId` belongs to the internal linking layer.
- Immutable core linking semantics operates exclusively on the structural canonical representation (`DepId`) after the preprocess stage.

Determinism of structural canonicalization into `DepId` is defined by identical container configuration, identical parser, and identical CDC.

Determinism of the full linking process is defined in `architecture/linking-model.md` and additionally depends on identical dependency stack conditions.

The immutable linking pipeline begins only after the parser has produced the structural canonical representation (`DepId`).
