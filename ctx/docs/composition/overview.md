# Composition Overview

Path: `./ctx/docs/composition/overview.md`

## Purpose

This document defines the lifecycle and execution model of the container as a runtime service. It formalizes container states, state transitions, temporal determinism, and failure behavior without redefining structural linking semantics established at the architecture level.

## Runtime Service Model

The container is a persistent runtime service within a single process. All guarantees apply strictly within the lifecycle of a single container instance.

A single container per runtime is the recommended execution model for predictable configuration management and deterministic behavior.

Multiple containers within a single process are not prohibited by architecture.

Architectural invariants, including determinism, parser injectivity, and structural identity via `DepId`, apply per container instance provided container configuration and parser profile are consistent for the evaluated instance.

## Lifecycle States

The container has exactly four states:

1. Created  
   The container instance exists and requires configuration.

2. Configured  
   Configuration is complete and mutable no longer. No dependency requests have been processed.

3. Operational  
   The first dependency request has been executed. The container processes dependency requests on demand under sealed configuration.

4. Failed  
   A fatal linking error has occurred. The container is irreversibly invalid.

No additional states exist. There is no partially linked, shutdown, or disposal state.

The container has no termination phase.

## State Transitions

- Created → Configured occurs after configuration completion.
- Configured → Operational occurs on the first dependency request.
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
