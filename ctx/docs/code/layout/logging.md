# Product Logging Principles

Path: `./ctx/docs/code/layout/logging.md`

## Purpose

This document defines global logging principles for the `@teqfw/di` implementation.

It establishes uniform logging behavior across all components while preserving architectural invariants, deterministic linking semantics, and fail-fast guarantees.

This document defines structural rules only. Component-specific logging details are defined in component-level contracts.

## Scope

These principles apply to all implementation modules under `src/`, including but not limited to:

- Container
- Parser
- Resolver
- Lifecycle
- DTO-related factories
- Internal orchestration modules

Logging is a product-wide diagnostic mechanism.

## Non-Functional Nature

Logging is strictly observational.

Logging MUST NOT:

- alter linking semantics,
- alter lifecycle behavior,
- alter caching behavior,
- alter pipeline stage ordering,
- alter error propagation,
- introduce asynchronous boundaries,
- introduce hidden state,
- mutate domain objects,
- influence determinism of resolution results.

Enabling logging MUST NOT change the functional outcome of any `get` invocation.

## Default State

Logging is disabled by default.

The product MUST operate identically whether logging capability exists or not.

## Activation Model

Logging is activated exclusively through the Container during Builder phase.

No other component may independently enable or disable logging.

Logging configuration becomes immutable once the system enters Operational phase.

## Global Logger Invariant

The product MUST use a single logger instance.

Rules:

- Logger is created and owned by Container.
- Logger reference is propagated to infrastructure components.
- Components MUST NOT create independent logger instances.
- Logger MUST NOT be exposed publicly.
- Logger MUST NOT be injectable from outside the product.

If logging is disabled:

- Logger reference MUST be `null` or a no-op implementation.
- Component behavior MUST remain unchanged.

## Output Channel

Logging output MUST go exclusively to `console`.

No external logging framework is permitted.

No structured logging transport is permitted.

No file logging is permitted.

No log level configuration is defined.

Logging is binary: enabled or disabled.

## Coverage Principle

When enabled, logging MUST provide full visibility of product activity, including:

- builder-stage configuration actions,
- state transitions,
- pipeline stage entry and exit,
- resolution and instantiation decisions,
- cache behavior,
- mock interactions,
- lifecycle enforcement,
- freeze operations,
- failure transitions.

Logging MUST be sufficiently detailed to reconstruct container activity flow manually.

## Error Visibility

On failure:

- The complete pipeline progression up to the failure point MUST be visible.
- The original error stack MUST be logged.
- Errors MUST NOT be wrapped or masked solely for logging purposes.
- Logging MUST NOT swallow or transform errors.

Fail-fast semantics remain intact.

## Determinism Boundary

Log output is not part of the deterministic contract.

Logs MAY contain:

- timestamps,
- module specifiers,
- object identities,
- stack traces.

Reproducibility of log output is not required.

Determinism applies to functional results only.

## Performance Constraint

Zero-overhead logging when disabled is desirable but not mandatory.

Logging checks MUST NOT introduce semantic branching.

Performance optimizations MUST NOT alter functional guarantees.

## Testing Boundary

Unit tests MUST NOT depend on logging output.

Logging is intended for manual inspection during integration testing.

Logging output is not part of any formal verification contract.

## Architectural Consistency

Logging implementation MUST align with the following architectural invariants:

- immutable core linking semantics,
- strict Builder → Operational transition,
- fail-fast behavior,
- infrastructure isolation,
- deterministic runtime linking.

Logging MUST NOT introduce cross-layer coupling or violate dependency direction rules defined in `structure.md`.

## Breaking Change Invariants

The following constitute breaking changes:

- enabling logging by default,
- introducing logging levels,
- allowing external logger injection,
- exposing logger publicly,
- making logging behavior part of deterministic contract,
- allowing logging to modify resolution flow.

## Summary

Product logging in `@teqfw/di` is:

- global,
- console-based,
- binary (on/off),
- enabled only via Container,
- semantically inert,
- non-deterministic,
- intended solely for human diagnostics.

It is a visibility layer over the runtime pipeline, not a behavioral feature.
