---
name: teqfw-di
description: >
  Use this skill when integrating, using, testing, reviewing, or modifying JavaScript
  modules that use @teqfw/di runtime linking, Dependency Specifiers, namespace
  mappings, lifecycle selectors, hooks, wrappers, mocks, browser ESM, or Node.js
  package and namespace registries.
license: Apache-2.0
metadata:
  package: "@teqfw/di"
---

# @teqfw/di

Use this skill for consumer code that composes or depends on the installed `@teqfw/di` package. Treat the host project's instructions, architecture, and test conventions as authoritative.

## Apply

1. Use only public imports: `@teqfw/di`, `@teqfw/di/node/registry/namespace`, and `@teqfw/di/node/registry/package`.
2. Never import `@teqfw/di/src/**`. Preserve `@teqfw/di/src/Config/NamespaceRegistry.mjs` only in existing migration code; new code uses `@teqfw/di/node/registry/namespace`.
3. Configure the container before its first `get()`; retain the canonical export-scoped `__deps__` form for new or changed modules.
4. Keep Node.js registries in a Node.js composition root. Do not import them from browser or DI-managed runtime modules.
5. Read the references selected below before editing, then validate with the host project tests.

## Select References

| Consumer task | Read |
| --- | --- |
| Understand package boundaries, token mapping, or compatibility | [Concepts](references/concepts.md), [Compatibility](references/compatibility.md) |
| Write or change a DI module, compose an application, use browser ESM, mocks, or package metadata | [Usage](references/usage.md), [Dependency Specifiers](references/dependency-id.md) |
| Configure a container, diagnose lock/failure behavior, or register mocks | [Container](references/container.md), [Package API](references/package-api.ts) |
| Add preprocess, postprocess, or wrappers | [Extensions](references/extensions.md), [Dependency Specifiers](references/dependency-id.md) |
| Build Node.js package-backed composition | [Usage](references/usage.md), [Concepts](references/concepts.md), [Package API](references/package-api.ts) |
| Mount or discover the installed skill | [Distribution](references/distribution.md) |

The container links stable Module Tokens through finalized namespace roots. Prefer one principal application value in `default export` and explicit source-attached `__deps__` declarations. This skill defines correct package use, not host application architecture or policy.
