# Container Implementation Contract

Path: `./ctx/docs/code/components/container.md`

## Purpose

This document defines the implementation-level contract of the `Container` component as the single public entry point of the `@teqfw/di` product.

`Container` is the only externally visible orchestration boundary. All configuration of parsing, resolution, linking, extension pipelines, namespace mapping, and test overrides MUST be performed exclusively through this component.

Internal components (Parser, Resolver, Lifecycle, DepId factory) are infrastructure details and are not part of the public product surface.

Architectural linking semantics and structural identity are defined at higher levels and are not restated here.

## Normative References

The container implementation MUST conform to:

- `ctx/docs/architecture/linking-model.md`
- `ctx/docs/architecture/depid-model.md`
- `ctx/docs/architecture/execution-model.md`
- `ctx/docs/architecture/constraints.md`
- `ctx/docs/product/constraints.md`
- `ctx/docs/code/layout/structure.md`
- `ctx/docs/code/components/parser.md`
- `ctx/docs/code/components/resolver.md`

## Public API

### Constructor

```js
new Container();
```

The constructor MUST NOT accept parameters.

All configuration is performed via builder-style methods before the first `get` invocation.

### Resolution Entry Point

```js
get(cdc: string): Promise<any>
```

The method MUST:

- accept exactly one CDC string,
- return a `Promise`,
- resolve with a fully linked and frozen instance,
- reject on failure,
- never return partial results.

The return type MUST remain `Promise<any>`.

This requirement exists because the runtime type of the resolved dependency is determined by the CDC identifier and cannot be inferred from the `get` method signature itself.

The container MUST NOT declare the return type of `get` as `Promise<unknown>`.

Static typing of resolved dependencies MUST be applied at the call site using JSDoc annotations and the package type map defined in `types.d.ts`.

`get` is always asynchronous. Changing this contract constitutes a breaking change.

### Configuration Methods (Builder Stage Only)

All configuration methods are permitted only before the first `get` invocation.

After the first `get`, any configuration attempt MUST throw.

#### Parser Replacement

```js
setParser(parser);
```

Rules:

- `parser` MUST expose `parse(cdc: string): DepId`.
- The container MUST NOT validate parser internals beyond structural presence of `parse`.
- Parser replacement is forbidden after first `get`.

#### Namespace Registration (Resolver Configuration)

```js
addNamespaceRoot(prefix: string, target: string, defaultExt: string)
```

This method accumulates namespace-to-filesystem mapping rules.

Rules:

- Multiple namespace roots are permitted.
- Resolution rule selection remains the responsibility of Resolver.
- Container MUST internally construct the resolver configuration snapshot on first `get`.
- Namespace roots become immutable after first `get`.

Container MUST NOT expose Resolver DTOs or Resolver constructor publicly.

#### Extension Pipelines

```js
addPreprocess(fn);
addPostprocess(fn);
```

Execution order is defined strictly by registration order.

Preprocess functions:

- receive a `DepId`,
- MUST return a `DepId`,
- MUST preserve structural invariants.

Postprocess functions:

- receive the instantiated object,
- MAY return a different object,
- execute before lifecycle enforcement,
- are the normative mechanism for implementing CDC wrapper semantics via `addPostprocess(fn)`,
- MAY conditionally apply behavior based on `DepId` metadata, including wrapper markers from `DepId.wrappers`.

Wrapper capability is configuration-enabled through postprocess registration and is not built into CDC syntax parsing logic.

#### Logging Mode

```js
enableLogging();
```

Enables diagnostic logging of container pipeline execution.

Rules:

- MUST be invoked before first `get`.
- Logging is disabled by default.
- When enabled, container MAY emit diagnostic messages to `console`.
- Logging MUST NOT alter linking semantics, lifecycle behavior, state transitions, or determinism.
- Logging MUST NOT introduce asynchronous behavior or side effects beyond console output.

#### Test Mode

```js
enableTestMode();
```

Enables mock registration capability.

Rules:

- MUST be invoked before first `get`.
- Has no effect on production linking semantics unless mocks are registered.
- Does not alter resolver configuration or parser behavior.

#### Mock Registration

```js
register(cdc: string, mock: any)
```

Rules:

- Allowed only if test mode is enabled.
- Allowed only before first `get`.
- The container MUST parse the CDC and register the mock under canonical structural identity (excluding `origin`).
- During resolution, mock lookup occurs after parse and preprocess, but before resolver stage.
- Registered mocks bypass resolver, instantiation, and lifecycle stages.
- Freeze semantics still apply unless explicitly documented otherwise.

Mock registration MUST NOT alter production determinism when test mode is disabled.

## Configuration Model

The container has two operational phases:

1. Builder phase (pre-first-get)
2. Operational phase (post-first-get)

Configuration is mutable only in Builder phase.

Transition to Operational occurs at the beginning of the first `get` invocation.

Resolver instance and its configuration snapshot are created lazily at that moment.

No reconfiguration is permitted after transition.

### Wrapper Semantics

Wrapper behavior is implemented during the postprocess stage.

Wrapper identifiers are interpreted by registered postprocess logic.

Container MUST NOT automatically resolve wrappers from module exports.

Configuration, including wrapper-related postprocess registration, becomes immutable after the first `get`.

### Synchronous Composition Boundary

The container implementation enforces synchronous object composition at immutable-core stage.

Rules:

- factory composition (`composition = 'factory'`) MUST return a non-`Promise` value;
- wrapper execution MUST return a non-`Promise` value at every wrapper step;
- returning a `Promise` from factory or wrapper is a fail-fast error;
- asynchronous support is intentionally out of scope for composition stage.

Detection boundary:

- asynchronous violation is detected by nominal `value instanceof Promise` check;
- container MUST NOT perform generic thenable probing via `.then` access on arbitrary values.

## Resolution Semantics

The container orchestrates the immutable linking pipeline:

CDC → parse → DepId₀ → preprocess[] → DepId₁
→ mock lookup (if enabled)
→ resolve → instantiate → postprocess[]
→ lifecycle enforcement → freeze → return instance

Pipeline stage order MUST NOT change.

Mock lookup stage is conditional and only active in test mode.

Lifecycle-based caching does not alter pipeline structure.

Container MUST NOT perform:

- module graph inspection,
- static analysis,
- filesystem introspection.

Resolver remains responsible for specifier derivation and namespace matching.

## State Model

Container states:

1. NotConfigured (Builder phase)
2. Operational
3. Failed

Transitions:

- NotConfigured → Operational (on first `get`)
- Operational → Failed (on fatal linking error)

No transition out of Failed is permitted.

After Failed:

- all `get` calls MUST reject,
- all configuration methods MUST throw.

## Failure Semantics

Linking is fail-fast.

Any error during:

- parse,
- preprocess,
- mock lookup,
- resolve,
- instantiate,
- postprocess,
- lifecycle enforcement,
- freeze,
- cycle detection,

MUST:

- reject the current `get`,
- transition container to Failed.

No recovery semantics are permitted.

## Determinism Scope

For identical finalized configuration, identical parser, identical namespace roots, identical test mode state, identical mock registry, and identical CDC inputs interpreted under identical CDC profile configuration:

`get` MUST resolve to identical instance identity.

Invocation order of independent dependencies MUST NOT influence outcome except via lifecycle caching.

## Responsibility Boundary

Container is responsible for:

- being the sole public orchestration boundary,
- collecting builder-stage configuration,
- constructing resolver and lifecycle internally,
- enforcing configuration immutability,
- orchestrating pipeline stages,
- executing extension pipelines,
- managing state transitions,
- enforcing fail-fast semantics,
- supporting deterministic test overrides.

Container is not responsible for:

- CDC grammar definition,
- specifier derivation,
- namespace matching algorithm,
- export selection,
- domain validation.

## Breaking Change Invariants

Breaking changes include:

- modifying the signature or async contract of `get`,
- replacing `Promise<any>` with another declared return type for `get`,
- exposing Resolver or Parser as public components,
- allowing post-start reconfiguration,
- altering pipeline stage order,
- changing mock resolution stage position,
- relocating lifecycle caching into container,
- altering freeze timing,
- weakening fail-fast guarantees,
- changing determinism scope.

All other refactoring is non-breaking only if these invariants remain intact.

## Conformance Boundary

The container implementation MUST preserve:

- immutable core linking semantics,
- deterministic runtime behavior,
- strict builder-to-operational transition,
- isolation of infrastructure components,
- test override confinement to explicit test mode,
- single public orchestration boundary.

Structural deviation constitutes architectural evolution.
