# Resolver Implementation Contract

Path: `./ctx/docs/code/resolver.md`

## Purpose

This document defines the implementation-level contract of the `Resolver` component in `@teqfw/di`. It specifies constructor semantics, public interface, resolution behavior, configuration model, caching rules, determinism scope, and breaking-change limits.

Architectural pipeline ordering and structural identity semantics are defined at higher levels and are not restated here.

## Normative References

The resolver implementation MUST conform to:

- `ctx/docs/architecture/linking-model.md`
- `ctx/docs/architecture/depid-model.md`
- `ctx/docs/constraints/overview.md`
- `ctx/docs/code/structure.md`
- `ctx/docs/environment/overview.md`
- `ctx/docs/code/conventions/teqfw/dto.md`

## Constructor Contract

The resolver is an infrastructure component and is not DI-managed.
However, it MUST follow the TeqFW constructor philosophy.

The constructor MUST accept exactly one dependency descriptor object.

Signature:

```js
new TeqFw_Di_Resolver(deps);
```

Descriptor structure:

```
{
    config: TeqFw_Di_Dto_Resolver_Config$DTO,
    importFn?: (specifier: string) => Promise<object>
}
```

Rules:

- Only one positional argument is permitted.
- The argument MUST be an object.
- `config` is mandatory.
- `importFn` is optional. If not provided, native dynamic `import()` MUST be used.
- No additional positional parameters are permitted.
- No setter-based configuration is permitted.
- No post-construction mutation of dependencies is permitted.

The constructor MUST NOT:

- perform resolution,
- derive specifiers,
- load modules,
- mutate the provided configuration DTO.

The resolver MUST create an internal immutable snapshot of configuration on first resolution attempt.

Changing constructor signature constitutes a breaking internal architectural change.

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

The resolver operates exclusively on structural fields of `DepId`.

Only:

- `moduleName`
- `platform`

participate in resolution.

The resolver MUST ignore:

- `exportName`
- `composition`
- `life`
- `wrappers`
- `origin`

Export selection and verification are outside resolver responsibility.

## Resolver Configuration Model

Configuration is provided at construction time via dependency descriptor.

Configuration DTOs are defined in:

```
ctx/docs/code/conventions/teqfw/dto.md
```

Structural form of `TeqFw_Di_Dto_Resolver_Config$DTO`:

```
namespaces: TeqFw_Di_Dto_Resolver_Config_Namespace$DTO[]
nodeModulesRoot?: string | undefined
```

Structural form of `TeqFw_Di_Dto_Resolver_Config_Namespace$DTO`:

```
prefix: string
target: string
defaultExt: string
```

DTOs are strictly structural.

They MUST NOT contain:

- computed values,
- normalized paths,
- runtime state,
- cache data.

## Namespace Matching Rule

For `platform = 'teq'`:

- The resolver MUST select namespace rule using deterministic longest-prefix match.
- Identical configuration and identical `DepId` MUST yield identical rule selection.

## Module Specifier Derivation

Specifier derivation MUST be deterministic.

For `platform = 'teq'`:

- Select namespace rule.
- Derive remainder from `moduleName`.
- Convert remainder into relative path.
- Append `defaultExt`.
- Combine with `target`.

Filesystem inspection and environment-specific normalization are prohibited.

For `platform = 'node'`:

- Specifier MUST be `node:${moduleName}`.

For `platform = 'npm'`:

- Specifier MUST be derived from `moduleName`.
- `nodeModulesRoot` MAY be used only if runtime requires absolute resolution.

## Module Loading

Modules MUST be loaded using injected `importFn` or native dynamic `import()`.

The resolver MUST NOT:

- inspect exports,
- verify export existence,
- instantiate exports,
- apply wrappers,
- enforce lifecycle,
- freeze objects.

## Configuration Boundary

Configuration becomes immutable on first resolution attempt.

The resolver MUST NOT allow configuration changes after first `resolve` call.

Post-start reconfiguration is forbidden.

## Module Caching

Resolver maintains internal cache.

Cache key:

```
(platform, moduleName)
```

For identical `(platform, moduleName)` under identical configuration, resolver MUST return identical namespace object reference.

Caching MUST NOT alter:

- resolution semantics,
- error propagation behavior.

## Error Semantics

Any error during:

- specifier derivation,
- namespace selection,
- dynamic import,

MUST result in rejected `Promise`.

Errors MUST NOT be classified or transformed.

No fallback strategies are permitted.

## Determinism

Given identical:

- constructor descriptor,
- `DepId`,
- runtime environment,

`resolve` MUST produce identical namespace object identity.

Invocation order MUST NOT influence result.

## Responsibility Boundary

Resolver is responsible for:

- deterministic specifier derivation,
- namespace selection,
- module loading,
- namespace caching.

Resolver is not responsible for:

- EDD parsing,
- DepId validation,
- export selection,
- instantiation,
- lifecycle,
- wrapper pipelines.

## Breaking Change Invariants

Breaking changes include:

- changing constructor signature,
- changing async contract of `resolve`,
- altering specifier derivation rules,
- modifying namespace matching semantics,
- altering caching key semantics,
- allowing post-start reconfiguration,
- introducing export validation.

Refactoring that preserves observable behavior is non-breaking.
