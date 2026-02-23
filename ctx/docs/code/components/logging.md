# Container Logging Component Contract

Path: `./ctx/docs/code/components/logging.md`

## Purpose

This document defines the implementation contract of the logging mechanism as controlled by the `Container`.

Logging is a product-internal diagnostic facility activated exclusively by `Container` and affecting all infrastructure components.

Logging is not part of public behavioral semantics.

## Ownership Principle

The logger is owned and activated by `Container`.

Rules:

- Only `Container` may activate logging.
- No infrastructure component may activate logging.
- No infrastructure component may construct a logger independently.
- Logger lifecycle is bound to Container lifecycle.
- Logger is internal and MUST NOT be exposed.

## Activation API

Logging is activated via:

```js
enableLogging();
```

Rules:

- MUST be invoked during Builder phase.
- MUST throw if invoked after first `get`.
- Logging state becomes immutable at transition to Operational phase.
- Logging is disabled by default.

This API is defined as part of the Container public configuration surface .

## Construction Model

When logging is enabled:

- Container constructs a single logger instance.
- Logger MUST be synchronous.
- Logger MUST write exclusively to `console`.
- Logger MUST NOT depend on external configuration.
- Logger MUST NOT introduce asynchronous boundaries.

When logging is disabled:

- Container MUST provide a `null` reference or no-op logger.
- Infrastructure components MUST tolerate absence of logger.

## Propagation Model

At Operational transition:

- Container instantiates Parser, Resolver, Lifecycle, and other internal components.
- Logger reference MUST be passed to each of them.
- All components MUST share the same logger instance.

Infrastructure components:

- MUST NOT create their own logger,
- MUST NOT mutate logger reference,
- MUST NOT expose logger.

## Coverage Obligations

Container MUST log:

### Builder Phase

- enableLogging invocation,
- enableTestMode invocation,
- parser replacement,
- namespace registration,
- preprocess/postprocess registration.

### Operational Transition

- transition from Builder to Operational,
- resolver configuration snapshot creation.

### Runtime Pipeline

For each `get` call:

- CDC input,
- parsed DepId,
- preprocess entry/exit,
- mock lookup decision,
- resolve entry/exit,
- instantiation entry/exit,
- postprocess entry/exit,
- lifecycle enforcement,
- freeze stage,
- final success.

### State Transitions

- transition to Failed state,
- rejection of subsequent `get` calls after failure.

## Error Logging

On any pipeline error:

- The failure stage MUST be logged.
- The original error stack MUST be logged.
- Container MUST transition to Failed.
- Container MUST reject the call.
- Subsequent `get` calls MUST be rejected.

Logging MUST NOT wrap, suppress, or transform the error.

Fail-fast semantics remain unchanged .

## Semantic Inertness

Enabling logging MUST NOT:

- alter linking semantics,
- alter lifecycle behavior,
- alter cache behavior,
- alter instance identity,
- alter freeze timing,
- alter determinism scope,
- alter state transition logic,
- introduce additional awaits.

Logging is observational only.

## Determinism Boundary

Log output is not part of the determinism contract.

Container MUST preserve deterministic linking semantics independent of logging state .

## Testing Boundary

Unit tests MUST NOT depend on logging output.

Logging is intended solely for manual inspection during integration testing.

Logging MUST NOT be required for any test to pass.

## Breaking Change Invariants

The following are breaking changes:

- enabling logging by default,
- allowing external logger injection,
- exposing logger publicly,
- introducing logging levels,
- allowing runtime reconfiguration after Operational transition,
- allowing infrastructure components to activate logging,
- altering pipeline semantics when logging is enabled.

## Summary

Logging:

- is activated exclusively by Container,
- is owned by Container,
- is propagated internally,
- is console-based,
- is binary (on/off),
- is semantically inert,
- is not part of functional contract,
- exists solely for human diagnostics.

Container controls visibility.
Infrastructure emits events.
Semantics remain immutable.
