# Constraints Overview

Path: `./ctx/docs/constraints/overview.md`

## Purpose

This document defines mandatory architectural boundaries of the system and the prohibited directions of evolution. It fixes the stability envelope of the deterministic runtime linking architecture and establishes non-negotiable constraints intended to keep implementation and LLM-assisted design inside the product identity.

Constraints define what the system must not become and which changes constitute exit from the current architectural model.

## Architectural Class Constraint

The system is permanently defined as a deterministic, request-driven runtime linking architecture.

The container does not have a predefined application entrypoint. The dependency structure is discovered only from explicit dependency requests (for example, via `get(root)`), and may differ between multiple roots requested within the same composition root.

A dependency graph is not a first-class artifact of the system. The system must not construct, expose, persist, or maintain a complete dependency graph as a standalone object.

The following transformations are prohibited:

- transition to graph-driven execution, including any model that uses graph traversal as the primary linking engine;
- introduction of a public graph API or an explicit “analysis-only” mode (graph build, dry-run, preflight scan);
- hybrid static/runtime linking models as a product feature;
- alternative linking modes within the same package;
- replacement or optionalization of the immutable core pipeline;
- modification of structural canonical `DepId` identity semantics under the default profile;
- expansion or contraction of determinism scope.

Request-driven recursive dependency analysis performed during a single `get(root)` is permitted. The implicit dependency tree formed during resolution is a transient internal structure and must not become a maintained architectural artifact.

Dynamic `import()` is permitted as the runtime module loading primitive.

Any prohibited transformation constitutes exit from the current architectural model and requires a new architectural branch of the product.

## Dependency Declaration Constraint

Compliant applications must express dependency relations exclusively through Canonical Dependency Contracts (CDC) declared in module-level dependency descriptors.

The following are prohibited as compliant application dependency mechanisms:

- use of static `import` statements to express application dependency structure;
- reflection-based inference of dependencies from behavioral code;
- implicit injection by signature inspection, parameter-name extraction, decorator metadata, or source parsing;
- hidden registries or container-side heuristics that derive dependencies without explicit descriptors.

Static imports are permitted inside the implementation of the container itself as an implementation technique. They must not become a product-level dependency mechanism for applications.

The container must treat the module-level dependency descriptor as the sole canonical source of declared dependencies for a given export. No inference is permitted.

## Request-Driven Pre-Resolution Constraint

For each explicit dependency request `get(root)`, the container must perform a complete request-local dependency discovery for the root and all transitively required dependencies before starting object instantiation.

If the dependency structure cannot be fully discovered for the requested root due to missing sources, invalid contracts, or unsatisfied resolution prerequisites, the container must fail fast and must not partially instantiate the requested object graph.

This discovery is not a separate mode of operation and must not be exposed as a standalone public API.

## Cycle Detection Constraint

The system may detect and prevent cyclic dependencies. Cycle detection is permitted as an internal safety mechanism.

The system must not introduce graph-driven orchestration, scheduling, or graph-based lifecycle planning under the guise of cycle handling.

## CDC Profile and Parser Contract Constraint

The package ships a Default CDC Profile. All architectural guarantees, identity semantics, and determinism claims of the product apply under this default profile.

Consumers may use alternative CDC profiles, but such profiles are outside the responsibility boundary and guaranteed behavior domain of the product.

Within the Default CDC Profile, the following are prohibited:

- modification of CDC grammar without a breaking product change;
- weakening of parser injectivity;
- introduction of semantic alias mechanisms.

Parser injectivity is a permanent constraint for the Default CDC Profile.

Injectivity applies to semantic interpretation of CDC into structural canonical `DepId`, not to raw CDC string equality.

Distinct semantic interpretations of CDC must remain distinct at the structural canonical `DepId` level within the Default CDC Profile.

Deterministic syntactic sugar is permitted provided it does not collapse distinct semantic interpretations.

## Determinism Constraint

Given identical declared contracts (CDC and descriptors) and identical finalized container configuration, request-driven linking must produce identical resolution outcomes.

Linking behavior must not depend on evaluation order side effects, hidden mutable global state, or environment-dependent resolution logic.

## Configuration Constraint

Linking behavior is defined by finalized container configuration.

The following are prohibited:

- runtime reconfiguration after linking begins (after the first dependency request);
- configuration-dependent changes of immutable linking semantics;
- configuration-dependent changes of canonical identity semantics under the Default CDC Profile.

Configuration must be textually determinable and reproducible as a defined state.

## Extension Constraint

The extension surface is permanently fixed to the predefined stages of the pipeline. Extensions must not alter immutable linking semantics, canonical identity semantics, injectivity guarantees, or the request-driven nature of resolution.

Extensions must not introduce reflection-based inference or any alternative dependency declaration mechanism.

Extensions that violate these conditions place the system outside its guaranteed behavior domain.

## Responsibility Boundary

The system is responsible for deterministic runtime linking under explicit declared contracts and for fail-fast behavior on invalid or unsatisfied dependency structures during request-driven resolution.

The system is not responsible for:

- application lifecycle orchestration;
- scheduling, orchestration, or runtime management beyond linking;
- build-time analysis modes, preflight validation APIs, or full-application graph generation;
- behavior of created objects beyond lifecycle enforcement and immutability guarantees defined elsewhere.

## Stability Boundary

The system remains within its architectural model as long as:

- the immutable core pipeline remains unchanged;
- the Default CDC Profile identity semantics remain stable and injective;
- determinism scope is not expanded or reduced;
- linking remains strictly request-driven, with no public analysis-only modes;
- dependency declarations remain explicit and descriptor-driven, with no inference by reflection.

Any structural modification beyond these boundaries constitutes architectural evolution rather than incremental change.
