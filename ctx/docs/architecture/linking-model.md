# Linking Model

Path: `./ctx/docs/architecture/linking-model.md`

## Purpose

This document defines the immutable core linking semantics and the formally defined extension surface of the deterministic runtime linking architecture.

It specifies the linking pipeline, stage responsibilities, determinism scope, and failure semantics.

EDD is a string-level declaration interpreted by a configured parser profile. The architectural EDD model and the parser boundary are defined in `architecture/edd-model.md`.

## Core Boundary

A dependency request is expressed as EDD. The configured parser transforms EDD into a structural canonical representation `DepId`.

The parser is configuration-level and outside the immutable core.

The immutable core begins strictly with `DepId`. No additional identity normalization is permitted inside the core. Once `DepId` enters the core pipeline, it is final unless transformed by the preprocess stage.

All core semantics operate exclusively on the structural fields of `DepId`.

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
→ return value

Reordering, skipping, partial execution, or backward transitions are not permitted.

## Stage Semantics

### Preprocess

Preprocess is a configuration-level extension stage executed before resolution.

Input: `DepId₀`, dependency stack.
Output: `DepId₁`.

Preprocess MAY replace `DepId₀` with a different `DepId₁`, thereby changing dependency identity.

Preprocess MUST be deterministic for identical configuration, identical input `DepId₀`, and identical dependency stack. It MUST NOT produce side effects outside the linking process.

Identity MUST remain stable after preprocess completes.

### Resolve

Resolve is a core stage.

Input: `DepId₁`.
Output: `ModuleNamespace`.

Resolver behavior is defined by container configuration established prior to linking. It must not depend on mutable runtime state and must not perform lazy linking.

Resolve loads the ES module namespace for `DepId₁` within the configured resolver domain.

Resolve MUST NOT perform export selection or export existence verification.

Resolver MUST be total over its configured resolver domain. If a source cannot be resolved for `DepId₁`, linking terminates immediately.

### Instantiate

Instantiation is a core stage.

Inputs: `DepId₁`, `ModuleNamespace`.
Output: value.

Instantiation performs two logically distinct operations:

1. **Export selection**
2. **Composition execution**

#### Export Selection

- If `exportName != null`, the named export MUST exist in `ModuleNamespace`.
- If `exportName = null`, the selected value is the full `ModuleNamespace`.

Failure to locate a required export results in immediate termination of linking.

#### Composition Execution

Composition behavior is determined by `DepId.composition`:

- If `composition = 'as-is'`, the selected export is used directly.
- If `composition = 'factory'`, the selected export MUST be callable and is invoked to produce a value.

If `composition = 'factory'` and `exportName = null`, this is an invalid state and linking terminates immediately.

Instantiation MUST depend only on `DepId₁` and `ModuleNamespace`. It must not depend on container runtime state or dependency stack.

Instantiation MUST NOT produce side effects outside the created value.

Instantiation does not perform caching.

### Postprocess

Postprocess is a configuration-level extension stage executed after instantiation and before lifecycle enforcement.

Inputs: value, `DepId₁`, dependency stack.
Output: value′.

Postprocess MAY replace the value, including returning a proxy or wrapper.

Wrappers encoded in `DepId.wrappers` are applied conceptually at this stage.

Postprocess MUST be a pure transformation of the value. It MUST NOT introduce side effects outside the returned object.

Postprocess MAY depend on the dependency stack.

For identical configuration, identical input value, identical `DepId₁`, and identical dependency stack, postprocess MUST return an identical result.

### Lifecycle Enforcement and Caching

Lifecycle enforcement is a core stage and part of immutable core semantics.

Lifecycle operates on the postprocessed value.

Lifecycle behavior is determined by `DepId.life`:

- `'direct'` — no caching is applied. The value is returned as produced.
- `'singleton'` — the value is cached and reused for subsequent requests of identical structural identity.
- `'transient'` — a new value is produced per request without caching.

Lifecycle enforcement MUST NOT alter dependency identity.

Caching is part of lifecycle semantics and cannot be disabled.

For singleton dependencies:

- instantiation and postprocess MUST occur exactly once prior to caching;
- subsequent requests return the cached value.

Lifecycle behavior must not depend on mutable runtime state and must not vary across identical linking conditions.

### Freeze

Freeze is a mandatory core stage.

Freeze enforces structural immutability of the final value and occurs after lifecycle enforcement and before the value is returned.

Freeze may be implemented as part of lifecycle enforcement provided the observable stage ordering is preserved:

instantiate → postprocess → lifecycle enforcement and caching → freeze → return

Freeze cannot be disabled.

## Dependency Stack and Cycles

The dependency stack represents the active resolution chain and is available to preprocess and postprocess stages.

Cyclic dependencies are prohibited. Detection of a cycle results in immediate termination of linking.

## Determinism

Determinism is guaranteed at the level of returned value identity.

For identical container configuration, identical parser, identical EDD interpreted under identical parser configuration, and identical dependency stack, linking MUST produce identical lifecycle outcomes and identical wrapper composition.

The architecture does not guarantee determinism of internal object state. Randomness or time-dependent behavior inside constructors or factories is permitted.

## Failure Semantics

Any failure during preprocess, resolve, instantiate, postprocess, lifecycle enforcement, cycle detection, or freeze constitutes a fatal linking error.

Linking is fail-fast. Deferred errors, fallback resolution, partial linking, or recovery continuation are not permitted.

## Extension Surface Boundary

The extension surface consists exclusively of preprocess and postprocess stages.

Extensions may:

- transform dependency identity before resolution;
- wrap or replace values before lifecycle enforcement and freeze.

Extensions must not:

- reorder or bypass core stages;
- alter resolver semantics;
- introduce lazy linking;
- introduce non-determinism under identical conditions.

Core linking semantics are immutable and non-replaceable.
