# Integration Testing Contract

Path: `./ctx/docs/code/layout/testing/integration.md`

## Purpose

This document defines the normative integration-testing contract of the base package at the container runtime boundary.

Integration testing verifies immutable linking semantics of the container under real composition conditions. This layer serves as executable specification, architectural regression guard, and final acceptance validation of container runtime behavior.

Integration tests protect the public semantics of the container against unintended behavioral drift introduced by internal refactoring or agent-generated changes.

## Scope

Integration tests validate system-level invariants of container behavior, including:

- configuration locking after first resolution;
- namespace resolution rules, including deterministic longest-prefix selection;
- request-local dependency graph resolution and completeness of request-local graph construction;
- cyclic dependency detection and fail-fast behavior;
- lifecycle semantics for singleton and transient components;
- wrapper execution order, composition, and constraints;
- test mode semantics and mock injection rules;
- failure state behavior and transition guarantees;
- container state transitions across the full runtime lifecycle.

Integration tests operate strictly at the public container boundary and validate externally observable behavior only.

## Placement

Integration tests are located exclusively in:

```txt
./test/integration/
```

Structural mirroring of `src/` is not required.

Integration tests are scenario-based and correspond to runtime aspects of the container pipeline rather than to individual source files. Each file represents a distinct semantic domain of runtime behavior.

## Allowed Side Effects

Integration tests MAY:

- access filesystem;
- use dynamic import;
- load fixture modules;
- verify object identity;
- verify freezing and immutability guarantees;
- verify runtime error propagation;
- verify container state transitions.

Integration tests MUST NOT:

- depend on external network;
- rely on environment-dependent behavior;
- mutate global process state outside test scope;
- introduce nondeterministic timing dependencies.

Integration tests must remain deterministic across repeated executions.

## Structural Model

Each integration test file MUST represent a distinct runtime aspect of the container pipeline.

Integration tests MUST:

- validate observable invariants rather than implementation details;
- remain independent of internal module structure;
- avoid indirect behavioral assumptions;
- avoid abstraction layers that obscure runtime configuration;
- avoid helper utilities that hide configuration or resolution semantics.

Integration tests collectively verify the full runtime pipeline:

1. Configuration phase
2. Resolution phase
3. Instantiation phase
4. Wrapping phase
5. Lifecycle phase
6. Failure-state transition

The ordering of integration scenarios SHOULD reflect logical pipeline progression to improve auditability.

## Acceptance Role

Integration tests define the acceptance boundary for container behavior.

A build MUST NOT be considered behaviorally valid if integration tests fail.

Integration tests act as the authoritative executable definition of public linking semantics. When discrepancies arise between documentation and behavior, integration tests define the effective contract unless documentation is updated explicitly.

## Invariant Coverage Requirement

Integration tests MUST cover all publicly observable runtime invariants of the container.

For every externally observable semantic rule of the container, there MUST exist at least one integration scenario validating it.

No publicly documented runtime behavior may remain unverified.

When new runtime semantics are introduced, a corresponding integration test scenario MUST be added within the same change set.

Removal or modification of an integration scenario requires explicit justification and documentation update.

Integration tests function as architectural regression guards for immutable linking semantics.

## Relationship to Unit Testing

Integration tests:

- do not replace unit tests;
- do not validate internal module contracts;
- do not verify deterministic normalization of isolated components;
- do not enforce structural mirroring of source files.

Unit tests validate module-level correctness and local invariants.

Integration tests validate system-level linking semantics at the container runtime boundary.

Both layers are normative, complementary, and operate at distinct architectural levels.

## Summary

The integration testing layer defines runtime-boundary verification of:

- linking semantics;
- lifecycle invariants;
- wrapper semantics;
- test mode behavior;
- fail-fast failure-state semantics;
- container state integrity across transitions.

This layer serves as executable specification and final acceptance validation of container behavior under real composition conditions and preserves the immutability of linking semantics against architectural regression.
