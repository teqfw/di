# Container Execution Model

Path: `./ctx/docs/architecture/execution-model.md`

## Purpose

This document defines the execution model of the container as a runtime service: lifecycle states, state transitions, request handling semantics, determinism scope across time, and failure behavior. It does not redefine product meaning, CDC profile grammar, or implementation-level component interfaces.

## Runtime Service Model

The container is a persistent runtime service within a single process.

All guarantees defined by this document apply only within the lifecycle of a single container instance.

Multiple independent containers within a single process are permitted.

## Lifecycle States

The container has exactly three lifecycle states:

- NotConfigured: configuration is mutable and no dependency requests have been processed.
- Operational: configuration is sealed and dependency requests are processed.
- Failed: a fatal linking error has occurred and the container is irreversibly invalid.

No additional states exist.

The container has no termination phase.

## State Transitions

The following transitions are defined:

- NotConfigured to Operational occurs at the beginning of the first dependency request.
- Operational to Failed occurs on any fatal linking error.

Transition from Failed to any other state is prohibited.

Configuration becomes immutable at the transition to Operational.

## Request Model

Dependency linking is request-driven.

A request is an explicit dependency retrieval initiated at the container boundary.

The container performs request-local dependency discovery and request-local linking for the requested root.

The container does not expose or persist dependency graphs as public artifacts.

## Execution Semantics

The container execution model is single-threaded.

Parallel dependency requests are outside the execution model and are not supported.

Recursive reentrancy within a single dependency-resolution chain is required.

Asynchronous operations are permitted only where required by module loading, provided they preserve single-threaded semantics and deterministic outcomes.

## Failure Semantics

Linking is fail-fast.

Any fatal error during request processing transitions the container to Failed.

After transition to Failed, all subsequent dependency requests must reject, and all configuration methods must throw.

Partial results must not be returned.

Rollback is not performed.

## Temporal Determinism

Determinism applies to the entire lifecycle of the container instance.

For identical configuration and identical dependency requests, observable outcomes must remain invariant regardless of invocation order, except for lifecycle caching effects that are part of declared lifecycle semantics.

Invocation history is semantically neutral beyond lifecycle caching.

## Stability Boundary

Lifecycle structure, state transitions, request model, determinism scope across time, and failure semantics defined by this document are part of the architectural identity of the system.

Changes to these elements constitute architectural evolution beyond the current model.

