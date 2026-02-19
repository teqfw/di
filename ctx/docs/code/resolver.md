# Resolver Implementation Contract

Path: `./ctx/docs/code/resolver.md`


## Purpose

This document defines the implementation-level contract of the `Resolver` component in `@teqfw/di`. It specifies the public interface, resolution semantics, configuration boundary, module caching model, error behavior, determinism scope, and breaking-change limits.

Architectural pipeline ordering and structural identity semantics are defined at higher levels and are not restated here.

## Normative References

The resolver implementation MUST conform to:

- `ctx/docs/architecture/linking-model.md`
- `ctx/docs/architecture/depid-model.md`
- `ctx/docs/constraints/overview.md`
- `ctx/docs/code/structure.md`
- `ctx/docs/environment/overview.md`

## Public Interface

The resolver exposes a single method:

`resolve(depId: DepId): Promise<object>`

The method MUST:

- accept a fully validated `DepId`,
- return a `Promise`,
- resolve with the ES module namespace object,
- reject on failure.

No additional public resolution methods are permitted.

## Input Contract

The resolver operates exclusively on structural fields of `DepId`. Only the following fields participate in resolution:

- `moduleName`
- `platform`

The resolver MUST ignore:

- `exportName`
- `composition`
- `life`
- `wrappers`
- `origin`

Export selection and verification are performed during instantiation and are outside resolver responsibility.

## Module Specifier Derivation

The resolver derives a module specifier deterministically from `DepId`.

For `platform = 'teq'`:

- A namespace-to-path mapping provided by container configuration is applied to `moduleName`.
- The mapping produces the final module specifier.
- The resolver does not perform filesystem inspection or path normalization beyond configured mapping rules.

For `platform = 'node'`:

- The module specifier is constructed using the `node:` scheme and `moduleName`.

For `platform = 'npm'`:

- The module specifier is the bare specifier derived from `moduleName`.

Given identical configuration and identical `DepId`, module specifier derivation MUST produce identical results.

## Module Loading

The resolver loads the module using native dynamic `import()` and returns the module namespace object provided by the runtime.

The resolver MUST NOT:

- inspect exported members,
- verify export existence,
- instantiate exported values,
- apply wrappers,
- enforce lifecycle,
- freeze objects.

## Configuration Boundary

Resolver configuration is provided by the container prior to the first resolution.

Configuration includes namespace-to-path mapping rules for the `teq` platform.

Configuration becomes immutable when the container transitions to operational state.

The resolver MUST NOT allow configuration changes after the first resolution attempt.

## Module Caching

The resolver maintains an internal cache of loaded module namespace objects.

The cache key is the pair `(platform, moduleName)`.

Resolver-level caching applies only to module namespace objects and is independent from lifecycle caching of instantiated objects.

For identical `(platform, moduleName)` under identical configuration, the resolver MUST return the same namespace object reference.

Caching MUST NOT alter resolution semantics or error behavior.

## Error Semantics

Any error during module specifier derivation or dynamic import results in rejection of the returned `Promise`.

The resolver does not classify or normalize errors.

No fallback resolution, recovery, or partial behavior is permitted.

All errors are considered fatal at container level.

## Determinism

For identical:

- finalized container configuration,
- `DepId`,
- runtime environment,

`resolve` MUST produce identical module namespace object identity.

Resolver behavior MUST NOT depend on invocation order or external mutable state.

Determinism applies only to module namespace identity.

## Responsibility Boundary

The resolver is responsible for:

- deterministic module specifier derivation,
- loading ES modules,
- caching module namespace objects.

The resolver is not responsible for:

- parsing EDD,
- validating structural invariants of `DepId`,
- export selection or verification,
- instantiation logic,
- lifecycle enforcement,
- freeze semantics,
- extension pipelines.

## Breaking Change Invariants

The following changes constitute breaking changes:

- changing the asynchronous contract of `resolve`,
- altering module specifier derivation for a given `(platform, moduleName)`,
- modifying platform interpretation rules,
- removing or altering resolver-level caching semantics,
- introducing export validation into resolver,
- introducing fallback resolution strategies,
- allowing post-start reconfiguration.

Refactoring that preserves module specifier derivation, namespace identity, and error behavior is non-breaking.

## Conformance Boundary

A compliant resolver implementation MUST:

- operate exclusively on structural `DepId`,
- derive module specifiers deterministically,
- use native dynamic `import()`,
- maintain resolver-level module caching,
- remain independent of lifecycle semantics,
- preserve fail-fast behavior.

Deviation from these constraints constitutes non-compliance with the defined implementation contract.
