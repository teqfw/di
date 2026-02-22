# Architecture Overview

Path: `./ctx/docs/architecture/overview.md`

## Architectural Role

The system defines a deterministic runtime linking architecture for ES modules.

All dependencies are declared explicitly as Canonical Dependency Contracts (CDC). The architecture separates dependency declaration from implementation resolution and centralizes binding in a controlled composition phase.

Linking begins only after container configuration is finalized. Reconfiguration after resolution begins is prohibited.

The architecture operates exclusively at runtime. Static imports must not be used as an alternative dependency mechanism.

## Canonical Dependency Contract (CDC)

A Canonical Dependency Contract is the only permitted form of dependency declaration at the application level.

CDC is a string. Admissibility and interpretation of CDC values are defined by the selected CDC profile at the parser boundary. Declarations rejected by the selected profile MUST be rejected deterministically.

CDC constitutes a public architectural contract of an application. Changing the semantic interpretation of a CDC constitutes a breaking architectural change.

The internal segmentation or naming conventions of CDC are not regulated at the architectural level beyond the selected CDC profile.

## Parser and Canonicalization

Each runtime instance uses exactly one parser selected during container configuration.

The parser validates CDC and transforms it into a structural canonical representation (`DepId`). The parser defines the CDC profile used by the application.

Different parser implementations may define different CDC surface encodings while using the same container implementation. Applications using different parsers are not required to be compatible at the level of dependency declarations.

Normalization is internal to the parser and is not a separate architectural layer. No canonical string representation of CDC is introduced at the architectural level; identity is defined exclusively by the structural `DepId`.

Structural canonicalization resulting in `DepId` is not part of the immutable core linking semantics. The immutable core begins strictly with `DepId`.

Determinism at the structural canonicalization boundary is defined by identical container configuration, identical parser, and identical CDC interpreted under identical CDC profile configuration.

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

The resolver maps structural canonical `DepId` values to ES module namespaces within the configured resolver domain and must be total over this domain. If a `DepId` falls outside the resolver domain or cannot be resolved, linking terminates immediately. Export selection and export existence verification occur during instantiation.

Internal caching does not alter resolution semantics and is part of lifecycle enforcement.

## Extension Surface

The extension surface consists of preprocess and postprocess stages.

Preprocess may transform dependency identity prior to resolution.

Postprocess may wrap or replace the instantiated object prior to lifecycle enforcement and freeze.

Extensions must not reorder or bypass core stages, alter resolver semantics, introduce lazy linking, or introduce non-determinism under identical configuration, identical CDC, and identical dependency stack conditions.

Extensions operate within the architectural constraints of the immutable core.

## Architectural Boundaries

The following actions violate the architecture:

- accessing the container or configuration from resolved services;
- modifying or reordering the core resolution pipeline;
- replacing resolver semantics;
- introducing dependency declarations rejected by the configured parser profile;
- allowing cyclic dependencies.

Determinism is guaranteed at the level of instance identity produced by the container for identical container configuration, identical parser, identical CDC, and identical dependency stack dynamics. Internal object state is outside the scope of this guarantee.
