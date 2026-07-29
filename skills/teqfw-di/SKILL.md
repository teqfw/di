---
name: teqfw-di
description: >
  Use this skill when integrating, using, reviewing, or modifying JavaScript
  modules with @teqfw/di runtime linking, dependency specifiers, namespace
  mappings, lifecycle selectors, preprocessors, postprocessors, wrappers, test
  mocks, browser ESM, or Node.js package and namespace registries.
license: Apache-2.0
metadata:
  package: "@teqfw/di"
---

# @teqfw/di

Use this skill for consumer code that composes or depends on `@teqfw/di`. It describes the package version installed beside this directory.

## Apply

1. Read the host project instructions and preserve its architecture, naming, and test conventions.
2. Select and read only the reference for the requested task.
3. Use only supported public imports; never import `@teqfw/di/src/**` or another unexported path, except when maintaining existing migration code that explicitly uses the deprecated `@teqfw/di/src/Config/NamespaceRegistry.mjs` compatibility entry.
4. Configure the container before its first `get()` and preserve the existing `__deps__` contract form unless the task explicitly changes it.
5. Validate consumer changes with the host project tests.

The container links a stable Module Token to an ES module through finalized namespace roots. A Dependency Specifier adds optional export, lifecycle, and wrapper selectors. Prefer one principal application value in `default export` and explicit source-attached `__deps__` declarations.

Use only these public runtime imports:

- `@teqfw/di` — default `Container`.
- `@teqfw/di/node/registry/namespace` — Node.js-only composition-stage namespace registry.
- `@teqfw/di/node/registry/package` — Node.js-only composition-stage package registry.

Keep registry utilities in a Node.js composition root, never in browser or DI-managed runtime modules. The `Container` and its namespace-root mapping are isomorphic.

## Choose A Reference

- [Concepts](references/concepts.md) — terminology, boundaries, package graph, and namespace metadata.
- [Container](references/container.md) — configuration, resolution, failure state, freezing, and test-mode rules.
- [Dependency Specifiers](references/dependency-id.md) — grammar, export selection, lifecycle, and wrappers.
- [Extensions](references/extensions.md) — preprocess, postprocess, and wrapper constraints.
- [Usage](references/usage.md) — modules, composition, mocks, browser ESM, and package-backed setup.
- [Package API](references/package-api.ts) — exact supported imports, method signatures, and structural protocols.

This skill is dependency integration knowledge, not a runtime part of the container. It does not define host application architecture, domain, policies, or intent; the host cognitive context and instructions do. The host project or its tooling owns mounting this directory into an agent catalog. Package installation does not create links or modify the host project.
