# Resolver Implementation Contract

Path: `./ctx/docs/code/resolver.md`

## Purpose

This document defines the implementation-level contract of the `Resolver` component in `@teqfw/di`. It specifies the public interface, resolution semantics, configuration model, module caching behavior, error semantics, determinism scope, and breaking-change limits.

Architectural pipeline ordering and structural identity semantics are defined at higher levels and are not restated here.

## Normative References

The resolver implementation MUST conform to:

- `ctx/docs/architecture/linking-model.md`
- `ctx/docs/architecture/depid-model.md`
- `ctx/docs/constraints/overview.md`
- `ctx/docs/code/structure.md`
- `ctx/docs/environment/overview.md`
- `ctx/docs/code/conventions/teqfw/dto.md`

## Public Interface

The resolver exposes a single method:

```
resolve(depId: DepId): Promise<object>
```

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

## Resolver Configuration Model

Resolver configuration is provided by the container before the container transitions to operational state.

Configuration is represented by two DTOs defined according to:

```
ctx/docs/code/conventions/teqfw/dto.md
```

The structural shape of these DTOs is normative. Any structural change constitutes a breaking change of the resolver implementation contract.

### 1. TeqFw_Di_Dto_Resolver_Config$DTO

Structural form:

```
namespaces: TeqFw_Di_Dto_Resolver_Config_Namespace$DTO[]
nodeModulesRoot?: string | undefined
```

Semantics:

- `namespaces` — complete set of namespace mapping rules used when `platform = 'teq'`.
- `nodeModulesRoot` — root directory of `node_modules`, used when deriving module specifiers for `platform = 'npm'` if absolute resolution is required by the runtime environment.

No additional fields are permitted.

The DTO:

- MUST NOT contain computed or derived values,
- MUST NOT contain normalized paths,
- MUST NOT contain cached data,
- MUST NOT contain container state.

### 2. TeqFw_Di_Dto_Resolver_Config_Namespace$DTO

Structural form:

```
prefix: string
target: string
defaultExt: string
```

Semantics:

- `prefix` — namespace prefix used for deterministic longest-prefix match against `DepId.moduleName`.
- `target` — base module specifier (filesystem path or base URL) to which the derived relative path is appended.
- `defaultExt` — extension appended to modules within this namespace. No global default extension exists.

No additional fields are permitted.

The DTO is strictly structural and contains no resolution logic.

### Namespace Matching Rule

When `platform = 'teq'`, the resolver MUST select the namespace rule using deterministic longest-prefix match.

Given identical configuration and identical `DepId`, namespace selection MUST produce identical results.

Namespace matching semantics are part of resolver behavior and not part of DTO logic.

## Module Specifier Derivation

The resolver derives a module specifier deterministically from `DepId`.

For `platform = 'teq'`:

- The resolver selects a namespace rule using longest-prefix match.
- The relative module path is derived from `moduleName` remainder.
- `defaultExt` of the selected namespace is appended.
- The final module specifier is constructed by combining `target` and derived path.

The resolver MUST NOT perform filesystem inspection or environment-specific normalization beyond configured mapping rules.

For `platform = 'node'`:

- The module specifier is constructed using the `node:` scheme and `moduleName`.

For `platform = 'npm'`:

- The module specifier is derived from `moduleName`.
- If required by runtime environment, `nodeModulesRoot` may be used to construct an absolute specifier.

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
- namespace selection,
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
- modifying namespace matching semantics,
- modifying platform interpretation rules,
- changing DTO structural shape,
- removing or altering resolver-level caching semantics,
- introducing export validation into resolver,
- introducing fallback resolution strategies,
- allowing post-start reconfiguration.

Refactoring that preserves module specifier derivation, namespace identity, and error behavior is non-breaking.

## Conformance Boundary

A compliant resolver implementation MUST:

- operate exclusively on structural `DepId`,
- use configuration DTOs exactly as specified,
- derive module specifiers deterministically,
- apply longest-prefix namespace matching,
- use native dynamic `import()`,
- maintain resolver-level module caching,
- remain independent of lifecycle semantics,
- preserve fail-fast behavior.

Deviation from these constraints constitutes non-compliance with the defined implementation contract.
