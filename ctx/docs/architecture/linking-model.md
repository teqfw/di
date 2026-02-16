# Linking Model

Path: `./ctx/docs/architecture/linking-model.md`

## Purpose

This document defines the immutable core linking semantics and the formally defined extension surface of the deterministic runtime linking architecture. It specifies the linking pipeline, stage responsibilities, determinism scope, and failure semantics. EDD grammar and parser behavior are defined in `architecture/edd-model.md`.

## Core Boundary

A dependency request is expressed as EDD. The configured parser transforms EDD into a structural canonical representation `DepId`.

The parser is configuration-level and outside the immutable core.

The immutable core begins strictly with `DepId`. No additional identity normalization is permitted inside the core. Once `DepId` enters the core pipeline, it is final unless transformed by the preprocess stage.

## Pipeline

The linking process is linear and forward-only:

EDD
→ parse
→ DepId₀
→ preprocess
→ DepId₁
→ resolve
→ instantiate
→ postprocess
→ lifecycle enforcement and caching
→ freeze
→ return instance

Reordering, skipping, partial execution, or backward transitions are not permitted.

## Stage Semantics

### Preprocess

Preprocess is a configuration-level extension stage executed before resolution.

Input: `DepId₀`, dependency stack.
Output: `DepId₁`.

Preprocess MAY replace `DepId₀` with a different `DepId₁`, thereby changing dependency identity.

Preprocess MUST be deterministic for identical configuration, identical input `DepId₀`, and identical dependency stack. It MUST NOT produce side effects outside the linking process.

### Resolve

Resolve is a core stage.

Input: `DepId₁`.
Output: `ExportDescriptor`.

Resolver behavior is defined by container configuration established prior to linking. It must not depend on mutable runtime state and must not perform lazy linking.

Resolver MUST be total over its configured resolver domain. If a source cannot be resolved for `DepId₁`, linking terminates immediately.

### Instantiate

Instantiation is a core stage.

Inputs: `ExportDescriptor`, lifecycle policy.
Output: instance.

Instantiation depends only on `ExportDescriptor` and lifecycle policy. It must not depend on dependency stack or container runtime state.

Instantiation MUST NOT produce side effects outside the created object.

For singleton dependencies, instantiation MUST occur exactly once.

### Postprocess

Postprocess is a configuration-level extension stage executed after instantiation and before lifecycle enforcement.

Inputs: freshly created instance, `DepId₁`, dependency stack.
Output: instance′.

Postprocess MAY replace the created instance, including returning a proxy or wrapper. Wrapper semantics are encoded in `DepId`.

Postprocess MUST be a pure transformation of the created instance. It MUST NOT introduce side effects outside the returned object.

Postprocess MAY depend on the dependency stack.

For identical configuration, identical input instance, identical `DepId₁`, and identical dependency stack, postprocess MUST return an identical result.

### Lifecycle Enforcement and Caching

Lifecycle enforcement is a core stage and part of immutable core semantics.

Lifecycle behavior does not depend on runtime state and cannot be replaced by configuration.

Caching is part of lifecycle semantics.

Lifecycle operates on the postprocessed instance. For singleton dependencies, postprocess is executed once before lifecycle caching. Subsequent requests return the cached instance.

Lifecycle enforcement MUST NOT alter dependency identity between calls.

### Freeze

Freeze is a mandatory core stage.

Freeze enforces structural immutability of the final instance and occurs before the instance is returned.

Freeze cannot be disabled.

## Dependency Stack and Cycles

The dependency stack represents the active resolution chain and is available to preprocess and postprocess stages.

Cyclic dependencies are prohibited. Detection of a cycle results in immediate termination of linking.

## Determinism

Determinism is guaranteed at the level of instance identity.

For identical container configuration, identical parser, identical EDD interpreted under identical parser configuration, and identical dependency stack, linking must produce identical lifecycle outcomes and wrapper composition.

The architecture does not guarantee determinism of internal object state. Randomness or time-dependent behavior inside constructors is permitted.

## Failure Semantics

Any failure during preprocess, resolve, instantiate, postprocess, lifecycle enforcement, cycle detection, or freeze constitutes a fatal linking error.

Linking is fail-fast. Deferred errors, fallback resolution, partial linking, or recovery continuation are not permitted.

## Extension Surface Boundary

The extension surface consists exclusively of preprocess and postprocess stages.

Extensions may transform dependency identity before resolution and may wrap or replace instances before lifecycle enforcement and freeze.

Extensions must not reorder or bypass core stages, alter resolver semantics, introduce lazy linking, or introduce non-determinism under identical conditions.

Core linking semantics are immutable and non-replaceable.
