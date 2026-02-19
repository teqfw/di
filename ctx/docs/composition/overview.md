# Composition Overview

Path: `./ctx/docs/composition/overview.md`

## Purpose

This document defines the lifecycle and execution model of the container as a runtime service. It formalizes container states, state transitions, temporal determinism, and failure behavior without redefining structural linking semantics established at the architecture level.

## Runtime Service Model

The container is a persistent runtime service within a single process. All guarantees apply strictly within the lifecycle of a single container instance.

A single container per runtime is the recommended execution model for predictable configuration management and deterministic behavior.

Multiple independent containers within a single process are permitted.

Architectural invariants, including determinism, parser injectivity, and structural identity via `DepId`, apply per container instance provided container configuration and parser profile are consistent for the evaluated instance.

## Lifecycle States

The container has exactly three states:

1. NotConfigured  
   The container instance exists and configuration is mutable. No dependency requests have been processed.

2. Operational  
   The first dependency request has been initiated. The container processes dependency requests on demand under sealed configuration.

3. Failed  
   A fatal linking error has occurred. The container is irreversibly invalid.

No additional states exist. There is no partially linked, shutdown, or disposal state.

The container has no termination phase.

## State Transitions

- NotConfigured → Operational occurs on the first dependency request.
- Operational → Failed occurs on any fatal linking error.
- Transition from Failed to any other state is prohibited.

Configuration becomes immutable at the transition to Operational.

## On-Demand Resolution Model

The container does not construct a global dependency graph.

Dependencies are resolved per request. Linking is completed when the requested instance is returned.

There is no global linking phase.

## Execution Semantics

The execution model is single-threaded.

Parallel dependency requests are not supported.

Recursive reentrancy within a single dependency resolution chain is required.

Asynchronous resolution is permitted provided it preserves single-threaded semantics and determinism.

Concurrent linking is outside the execution model.

## Failure Semantics

Any fatal error during dependency resolution transitions the container to Failed.

Partially constructed singleton instances must not persist after failure.

Rollback is not performed.

Fail-fast behavior applies to the entire container lifecycle.

## Temporal Determinism

Determinism applies to the entire lifecycle of the container.

For identical configuration and identical dependency requests, outcomes must remain invariant regardless of invocation order.

Invocation history is semantically neutral except for lifecycle caching.

Independent dependency requests must not influence future linking outcomes.

## Responsibility Boundary

This level governs only internal lifecycle and execution semantics of the container.

External application orchestration is outside the model.

## Stability of Execution Model

Lifecycle structure, state transitions, determinism scope, and failure semantics are part of the architectural identity of the system.

Changes to these elements constitute architectural evolution beyond the current model.
