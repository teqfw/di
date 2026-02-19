# Container Implementation Contract

Path: `./ctx/docs/code/container.md`

## Purpose

This document defines the implementation-level contract of the `Container` component in `@teqfw/di`. It specifies the public API, configuration model, execution semantics, state model, extension handling, failure behavior, and breaking-change invariants. Architectural linking semantics and structural identity are defined at higher levels and are not restated here.

## Normative References

The container implementation MUST conform to:

- `ctx/docs/architecture/linking-model.md`
- `ctx/docs/architecture/depid-model.md`
- `ctx/docs/composition/overview.md`
- `ctx/docs/constraints/overview.md`
- `ctx/docs/code/structure.md`
- `ctx/docs/code/parser.md`

## Public API

The only resolution entry point is:

`get(edd: string): Promise<any>`

The method MUST:

- accept exactly one EDD string,
- return a `Promise`,
- resolve with a fully linked and frozen instance,
- reject on failure,
- never return partial results.

The container MUST expose:

- `addPreprocess(fn)`
- `addPostprocess(fn)`

The constructor MUST NOT accept configuration parameters.

No additional public resolution methods are permitted.

`get` is always asynchronous. Changing this contract constitutes a breaking change.

## Configuration Model

The container is instantiated in state `NotConfigured`.

Configuration consists of:

- registering preprocess functions,
- registering postprocess functions,
- replacing the default parser.

Configuration is mutable only in state `NotConfigured`.

Transition from `NotConfigured` to `Operational` occurs immediately upon entry into the first `get` invocation, before resolution begins.

There is no externally observable `Configured` state.

Any attempt to modify configuration after the first `get` invocation MUST throw.

Invocation of `get` in `NotConfigured` without prior configuration is permitted. If resolver configuration is incomplete, resolution fails.

Registration of the same function multiple times is permitted. Each registration produces a distinct pipeline entry.

## Extension Model

The extension surface consists of two ordered pipelines:

- `preprocess[]`
- `postprocess[]`

Multiple functions are permitted in each pipeline. Execution order is defined strictly by registration order.

Preprocess functions:

- receive a `DepId`,
- MUST return a `DepId`,
- MAY return a structurally different `DepId`,
- MUST preserve structural invariants of `DepId`.

Postprocess functions:

- receive the freshly instantiated object,
- MAY return a different object,
- execute before lifecycle enforcement.

Extensions MUST be deterministic under identical configuration and inputs.

Any exception thrown by an extension is a fatal linking error.

## Resolution Semantics

The container orchestrates the immutable linking pipeline:

EDD → parse → DepId₀ → preprocess[] → DepId₁ → resolve → instantiate → postprocess[] → lifecycle enforcement → freeze → return instance

The container MUST invoke stages in this structural order.

Lifecycle-based caching does not alter pipeline structure. For singleton dependencies:

- resolve, instantiate, postprocess, lifecycle enforcement, and freeze execute exactly once per structural `DepId`,
- subsequent `get` calls return the cached instance provided by lifecycle,
- the container does not implement lifecycle-based branching.

The container does not perform static import analysis, module graph inspection, or lazy linking.

Lifecycle is responsible for caching singleton instances and applying freeze before exposure. The container MUST NOT store or manage singleton instances directly.

## State Model

The container has three observable states:

1. NotConfigured
2. Operational
3. Failed

NotConfigured → Operational occurs at the start of the first `get` invocation.

If the first invocation fails, the state transition sequence is:

NotConfigured → Operational → Failed

Operational → Failed occurs upon any fatal linking error.

No transition out of `Failed` is permitted.

After transition to `Failed`:

- all subsequent calls to `get` MUST reject without executing resolution,
- all configuration methods MUST throw.

No additional states exist.

## Failure Semantics

Linking is fail-fast.

Any error during parse, preprocess, resolve, instantiate, postprocess, lifecycle enforcement, freeze, or cycle detection:

- rejects the current `get` call,
- transitions the container to `Failed`.

No recovery or rollback semantics are permitted.

Partially constructed singleton instances must not persist after failure.

## Determinism Scope

For identical finalized configuration, identical parser, identical EDD interpreted under identical parser profile, and identical dependency stack conditions, `get` MUST resolve to identical instance identity.

Invocation order of independent dependencies must not influence outcomes except through lifecycle caching.

## Responsibility Boundary

The container is responsible exclusively for:

- orchestrating the linking pipeline,
- enforcing configuration immutability after first use,
- executing extension pipelines,
- managing state transitions,
- enforcing fail-fast behavior,
- delegating to parser, resolver, and lifecycle.

## Breaking Change Invariants

The following changes constitute breaking changes:

- modifying the signature or asynchronous contract of `get`,
- allowing configuration mutation after first `get`,
- altering pipeline stage order,
- modifying extension execution ordering,
- relocating caching responsibility from lifecycle to container,
- altering freeze timing,
- weakening fail-fast guarantees,
- changing determinism scope.

All other refactoring is non-breaking only if these invariants remain intact.

## Conformance Boundary

The container implementation MUST preserve immutable core semantics, deterministic linking, strict state transitions, extension ordering guarantees, and fail-fast behavior. Structural deviation from these constraints constitutes architectural evolution.
