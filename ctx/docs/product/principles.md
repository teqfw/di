# Architectural Principles

Path: `./ctx/docs/product/principles.md`

## LLM-First Declarative Contracts

The product is optimized for LLM-assisted development workflows. Dependency structure is declared primarily for machine reconstruction and deterministic agent behavior, not for manual convenience.

The method assumes a division of labor in which agents author and maintain structural declarations while humans review semantic intent and validate invariants.

All dependency relationships MUST be declared explicitly as data and MUST be statically reconstructible from source artifacts. Dependency declarations MUST NOT rely on implicit imports, hidden registries, or introspection of behavioral code.

Dependency identifiers form part of the public architectural contract of an application and are subject to human architectural review.

## Module-Level Dependency Descriptors

Dependencies of a module export MUST be declared through a module-level ES module export descriptor. The descriptor is a static public contract and is indexed by export name.

The runtime linking process MUST treat the descriptor as the sole canonical source of dependency requirements for a given export. Descriptor omission is interpreted as an empty dependency set. No implicit inference is permitted.

Runtime signature analysis, constructor parameter parsing, source-code string analysis, and other reflection-based extraction mechanisms are prohibited as canonical dependency declaration sources.

## CDC-Based Identity Encoding

Dependency contracts are interpreted according to the Default CDC Profile, which deterministically maps CDC strings to a structural canonical representation (`DepId`). The library `@teqfw/di` enforces this interpretation as the reference implementation of the method.

The product defines exactly one CDC interpretation: the Default CDC Profile.

The Default CDC Profile is the only CDC interpretation normatively supported and guaranteed by the product.

Alternative profiles may exist in external systems, but they are not covered by the product’s architectural guarantees.

CDC is a string-level contract. `DepId` is the structural canonical identity object produced by CDC interpretation.

Compatibility between applications at the level of dependency contracts is defined by conformance to the Default CDC Profile.

## Determinism for Machine Reasoning

Given identical declared contracts (CDC and descriptors) and identical configuration, runtime linking MUST produce identical results. Linking behavior MUST NOT depend on evaluation order, implicit mutable state, or hidden global structures.

Determinism is a prerequisite for stable machine reasoning, reproducible agent behavior, and reliable automated refactoring. It applies from declared dependency metadata to the resulting linked object graph.

## Immutable Linking Semantics

Linking obeys immutable linking semantics: the meaning of declared contracts is structurally fixed and non-replaceable. Configuration and extensions MUST NOT change the meaning of declared contracts, alter lifecycle and wrapper semantics, or weaken immutability guarantees.

Configuration-level variability is isolated from immutable linking semantics.

Immutable linking semantics are an irreversible product-level decision. Structural replacement, redefinition, or optionalization of this behavior constitutes a departure from the product identity rather than incremental evolution.

## Isomorphic Execution Model

The product preserves a single deterministic linking model across browser and Node.js environments. Isomorphism is a property of architectural integrity rather than an auxiliary feature.

## Object Immutability

Objects created by the reference implementation are immutable after construction and lifecycle enforcement. Immutability reduces state space, simplifies agent reasoning, enables reliable automated refactoring, and strengthens predictability in heterogeneous execution environments.

## Native ES Module Transparency

Linking semantics operate on native ES module abstractions without relying on transpilation or compile-time metadata generation. Architectural reasoning is based on authored code and executed code as the same artifact.

Modules originating from other systems may be used only through explicit ES module adapters that preserve the linking semantics and structural canonical `DepId` identity model.

## Minimal Structural Core

The reference implementation remains structurally minimal and focused exclusively on disciplined runtime linking. Features that do not directly serve deterministic linking under declared contracts are excluded to preserve conceptual clarity and long-term stability.
