---
name: teqfw-di
description: >
  Use when installing, composing, testing, reviewing, or modifying native
  JavaScript ESM code that uses the @teqfw/di dependency-resolution Container.
license: Apache-2.0
metadata:
  package: "@teqfw/di"
---

# @teqfw/di

Use this version-matched skill for the installed `@teqfw/di` package. The host
project's instructions, architecture, and test conventions remain authoritative.

## Install and import

```sh
npm install @teqfw/di
```

Import the Container with `import Container from "@teqfw/di";`. Use the public
Node.js registry imports only in Node.js composition code.

## Non-negotiable use model

```text
Composition Root creates JSON-safe Container configuration
  → new Container(config) captures configuration
  → first public get() locks configuration: Configuring → Preparing
  → declared policy materializes once: Preparing → Running
  → first entry resolution begins
  → sequential public get() calls create entry resolutions
  → entry roots share policy and Container-scoped Singleton reuse
```

Do not treat `Container` as a service locator. Use multiple `get()` calls only
as controlled staged or lazy application entry points, such as bootstrap,
plugins, then a selected command. Runtime modules declare ordinary child
dependencies in `__deps__`; each entry resolves those recursively in its own
graph. The first `get()` locks configuration and prepares policy once;
subsequent sequential entries share that policy and Singleton cache. Concurrent
and re-entrant `get()` calls reject. A failed entry leaves a Running Container
usable, while preparation failure makes it unusable. Teq-compatible runtime
modules have no static ES imports.

Every later `get()` is valid only after the prior entry has settled, and only
for the next deliberate application phase.

For tests, use `enableTestMode()` and `register(specifier, value)` before the
first `get()`. Registered values may be arbitrary runtime JavaScript values;
they are separate test-only state, not part of the JSON-safe configuration DTO.

Use only these public imports in new code:

```text
@teqfw/di
@teqfw/di/node/registry/package
@teqfw/di/node/registry/namespace
```

`@teqfw/di/src/Config/NamespaceRegistry.mjs` is the deprecated COMPAT-001
migration path, not a new-code import. No other `src/**` path is public.

## Select references

| Consumer task | Read |
| --- | --- |
| Decide whether the package fits; preserve module and runtime boundaries | [Concepts](references/concepts.md) |
| Create configuration, resolve staged entries, introspect them, use test mode, or diagnose failure | [Container](references/container.md) |
| Write `__deps__`, construct Dependency Identifiers, or select a Lifestyle | [Usage](references/usage.md), [Dependency Identifiers](references/dependency-id.md) |
| Configure substitutions, Preprocessors, Postprocessors, or Wrappers | [Extensions](references/extensions.md) |
| Use Node.js package metadata and namespace utilities | [Usage](references/usage.md), [Concepts](references/concepts.md) |
| Work with JSDoc aliases | [Types](references/types.md) |
| Preserve a deprecated surface or mount the installed skill | [Compatibility](references/compatibility.md), [Distribution](references/distribution.md) |

The references are self-contained package guidance. Verify exact runtime behavior
against the installed package and test the host's composition before relying on
an integration.
