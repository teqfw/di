# Architecture Overview

Path: `./ctx/docs/architecture/overview.md`

## Architectural Role

The system defines a deterministic runtime linking architecture for ES modules.

All dependencies are declared explicitly as External Dependency Declarations (EDD). The architecture separates dependency declaration from implementation resolution and centralizes binding in a controlled composition phase.

Linking begins only after container configuration is finalized. Reconfiguration after resolution begins is prohibited.

The architecture operates exclusively at runtime. Static imports must not be used as an alternative dependency mechanism.

## External Dependency Declaration (EDD)

An External Dependency Declaration is the only permitted form of dependency description at the application level.

EDD is a string and MUST be a valid `AsciiEddIdentifier` as defined in `ctx/docs/architecture/edd-model.md`. Declarations that do not conform to this grammar MUST be rejected deterministically.

Characters `.`, `(`, `)`, and `:` are forbidden in EDD.

EDD constitutes a public architectural contract of an application. Changing the semantic interpretation of an EDD constitutes a breaking architectural change.

The internal segmentation or naming conventions of EDD are not regulated at the architectural level.

## Parser and Canonicalization

Each runtime instance uses exactly one parser selected during container configuration.

The parser validates EDD and transforms it into a structural canonical representation (`DepId`). The parser defines the dependency encoding scheme used by the application.

Different parser implementations may define different EDD encoding schemes while using the same container implementation. Applications using different parsers are not required to be compatible at the level of dependency declarations.

Normalization is internal to the parser and is not a separate architectural layer. No canonical string representation of EDD is introduced at the architectural level; identity is defined exclusively by the structural `DepId`.

Structural canonicalization resulting in `DepId` is not part of the immutable core linking semantics. The immutable core begins strictly with `DepId`.

Determinism at the structural canonicalization boundary is defined by identical container configuration, identical parser, and identical EDD interpreted under identical parser configuration.

## Structural Canonical Dependency Representation

`DepId` is the structural canonical representation of a dependency within the linking model.

`DepId` is a structural DTO produced exclusively by the configured parser. It is not part of the public contract and cannot be constructed directly by application code.

The core linking model operates exclusively on structural canonical `DepId` values.

## Core Linking Semantics

The core linking semantics is immutable and non-replaceable.

The resolution pipeline is architecturally fixed and forward-only. No stage may be reordered, bypassed, or partially overridden.

The core linking process follows this sequence:

DepId → preprocessing → resolution → instantiation → postprocessing → lifecycle enforcement → freeze

Backward transitions and structural branching are not permitted.

## Resolver Semantics

Resolver semantics are architecturally fixed and non-replaceable.

The resolver domain is defined by container configuration established prior to linking. Resolver behavior must not depend on mutable runtime state.

The resolver maps structural canonical `DepId` values to concrete ES module exports within the configured resolver domain and must be total over this domain. If a DepId falls outside the resolver domain or cannot be resolved, linking terminates immediately.

Internal caching does not alter resolution semantics and is part of lifecycle enforcement.

## Extension Surface

The extension surface consists of preprocess and postprocess stages.

Preprocess may transform dependency identity prior to resolution.

Postprocess may wrap or replace the instantiated object prior to lifecycle enforcement and freeze.

Extensions must not reorder or bypass core stages, alter resolver semantics, introduce lazy linking, or introduce non-determinism under identical configuration, identical EDD, and identical dependency stack conditions.

Extensions operate within the architectural constraints of the immutable core.

## Architectural Boundaries

The following actions violate the architecture:

- accessing the container or configuration from resolved services;
- modifying or reordering the core resolution pipeline;
- replacing resolver semantics;
- introducing dependency declarations that are not valid `AsciiEddIdentifier`;
- allowing cyclic dependencies.

Determinism is guaranteed at the level of instance identity produced by the container for identical container configuration, identical parser, identical EDD, and identical dependency stack dynamics. Internal object state is outside the scope of this guarantee.
