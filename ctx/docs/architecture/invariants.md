# Architectural Invariants

Path: `./ctx/docs/architecture/invariants.md`

## Purpose

This document defines the immutable architectural invariants of the deterministic runtime linking architecture. These invariants apply across all parser profiles and all configurations and are not subject to extension or override.

## Core Boundary Invariant

The immutable core linking semantics begins strictly with `DepId` after parser execution.

No additional identity normalization is permitted inside the core. The core operates exclusively on structural canonical dependency representations (`DepId`).

Core semantics are non-replaceable.

## Identity Invariant

Dependency identity is defined in two stages:

- initial structural canonical identity (`DepId₀`) produced by the configured parser;
- final structural canonical identity (`DepId₁`) produced after preprocess.

Identity transformations are permitted only in the preprocess stage.

Identity MUST remain stable after resolution begins. Instantiation, postprocess, lifecycle enforcement, caching, and freeze must not alter dependency identity.

Distinct semantic interpretations of EDD within the same parser profile must not produce identical initial structural canonical representations (`DepId₀`).

## Determinism Invariant

For identical container configuration, identical parser, identical EDD interpreted under identical parser configuration, and identical dependency stack conditions, the linking process MUST produce identical lifecycle outcomes and identical wrapper composition.

Determinism is guaranteed at the level of the instance identity returned by the container.

Internal object state is outside the scope of this guarantee.

## Pipeline Invariant

The linking pipeline is linear and forward-only.

The following sequence is architecturally fixed:

DepId → preprocess → resolve → instantiate → postprocess → lifecycle enforcement → freeze

No stage may be reordered, bypassed, partially overridden, or conditionally skipped.

Backward transitions are not permitted.

## Resolver Invariant

Resolver semantics are architecturally fixed.

The resolver domain is defined by container configuration established prior to linking.

The configured resolver domain is the set of structural identities (`DepId`) that satisfy the domain predicate induced by container configuration.

Domain membership is a logical property of `DepId` under a fixed configuration and is independent of runtime availability of module sources.

The resolver MUST be total over its configured domain in the sense that, for any `DepId` in-domain, resolution is defined and resolution is attempted.

If a `DepId` is out of domain, the request violates the architecture.

If a `DepId` is in domain but module loading fails due to loader or environment failure, this is an environmental failure and does not contradict totality.

Resolution must not depend on mutable runtime state.

Lazy linking is prohibited.

## Composition and Lifecycle Invariant

Composition and lifecycle are orthogonal semantic dimensions defined in `DepId`.

The following conditions are architecturally fixed:

1. If `life = 'transient'`, then `composition = 'factory'`.

2. If `composition = 'factory'`, then `exportName != null`.

3. If `exportName = null`, then `composition = 'as-is'`.

4. Lifecycle enforcement must be applied strictly after postprocess and before freeze.

5. Lifecycle behavior must not depend on runtime state and must not vary across identical linking conditions.

6. Caching is part of lifecycle semantics.

7. Singleton instantiation occurs exactly once prior to caching.

Wrappers are applied to the value produced by composition and prior to lifecycle enforcement. Wrapper presence participates in structural dependency identity.

## Immutability Invariant

Freeze is mandatory and cannot be disabled.

Freeze enforces structural immutability of the value after lifecycle enforcement and before it is returned.

Returned values must not expose container internals.

## Extension Boundary Invariant

The extension surface consists exclusively of preprocess and postprocess stages.

Extensions may:

- transform dependency identity prior to resolution;
- wrap or replace instantiated values prior to lifecycle enforcement and freeze.

Extensions must not:

- modify or reorder core stages;
- alter resolver semantics;
- introduce lazy linking;
- introduce side effects outside the returned value;
- introduce non-determinism under identical conditions.

## Failure Invariant

Linking is fail-fast.

Any failure during preprocess, resolve, instantiate, postprocess, lifecycle enforcement, cycle detection, or freeze results in immediate termination of the linking process.

Deferred errors, fallback resolution, partial linking, and recovery continuation are prohibited.

## Acyclicity Invariant

Cyclic dependencies are prohibited.

Detection of a cycle results in immediate termination of linking.
