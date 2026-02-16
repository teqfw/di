# Architectural Principles

Path: `./ctx/docs/product/principles.md`

## Declarative Dependency Model

The container requires explicit declarative dependencies expressed as External Dependency Declarations (EDD). All dependency relationships must be reconstructible from source code and must not rely on implicit imports, hidden registries, or runtime introspection.

Dependency identifiers form part of the public architectural contract of an application.

## Configurable Declaration Encoding

Dependency declarations are interpreted by a configured parser that transforms EDD into a structural canonical representation (`DepId`). The container provides a normative default EDD profile and parser. Alternative encoding schemes may be adopted through parser replacement without modifying the core linking architecture.

Compatibility between applications at the level of dependency declarations is defined by shared parser profile.

## Deterministic Runtime Linking

Given identical container configuration, identical parser, and identical EDD, dependency resolution must produce identical results. Linking behavior must not depend on evaluation order, implicit mutable state, or hidden global structures.

Determinism applies to the entire resolution process from dependency declaration to final object instance.

## Immutable Core Semantics

The core linking pipeline is structurally fixed and non-replaceable. Resolution, instantiation, wrapping, lifecycle enforcement, and freeze semantics cannot be reordered, substituted, or partially overridden.

The architecture isolates configuration-level variability from immutable core semantics.

The immutable core linking pipeline is an irreversible architectural decision. Structural replacement, redefinition, or optionalization of core stages constitutes a departure from the product identity rather than incremental evolution.

## Isomorphic Execution Model

The container preserves a single dependency resolution model across browser and Node.js environments. Isomorphism is a property of architectural integrity rather than an auxiliary feature.

## Object Immutability

Objects created by the container are immutable after construction and lifecycle enforcement. Immutability reduces unintended side effects and strengthens predictability in heterogeneous execution environments.

## Native ES Module Transparency

The core linking semantics operates on native ES module abstractions without relying on transpilation or compile-time metadata generation. Architectural reasoning is based on authored code and executed code as the same artifact.

Modules originating from other systems may be used only through explicit ES module adapters that preserve the linking semantics and structural canonical `DepId` identity model.

## Minimal Structural Core

The core remains structurally minimal and focused exclusively on disciplined runtime linking. Features that do not directly serve deterministic dependency resolution are excluded to preserve conceptual clarity and long-term stability.
