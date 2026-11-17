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

Availability: FIFO entries, deferred Providers, and strengthened final-value
hardening below are accepted targets awaiting implementation and verification.
Their examples describe the target contract; verify support in the installed
release before using them. This status does not change the accepted contract.

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
  → public get() and Provider resolve() requests share one FIFO queue
  → each dequeued request creates its own entry resolution
  → entry roots share policy and Container-scoped Singleton reuse
```

Do not treat `Container` as a service locator. Use multiple `get()` calls only
as controlled staged or lazy application entry points, such as bootstrap,
plugins, then a selected command. Runtime modules declare ordinary child
dependencies in `__deps__`; each entry resolves those recursively in its own
graph. The first `get()` locks configuration and prepares policy once;
subsequent entries share that policy and Singleton cache. Concurrent and
re-entrant requests wait in the same FIFO queue; only one entry graph executes
at a time. A failed entry leaves a Running Container usable and advances the
queue; preparation failure makes it unusable and rejects waiting requests.
Teq-compatible runtime modules have no static ES imports.

Use `~` only in `__deps__` for a frozen Provider exposing `resolve()`. Its
creation does not load or preprocess the target; each call queues a new entry
with ordinary policy, lifestyles, fresh ancestry, and no Provider-owned cache.
An active entry awaiting its own later queued request can deadlock.

Final-value hardening is mandatory: settle a Promise/thenable before freezing
the ordinary object or function actually delivered. Optional custom Hardener
processing is synchronous and cannot return a deferred replacement or bypass
freezing. This guarantee is shallow; module namespaces retain native semantics.

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
| Create configuration, queue public or Provider entries, introspect them, use test mode, or diagnose failure | [Container](references/container.md) |
| Write eager or deferred `__deps__`, construct Dependency Identifiers, or select a Lifestyle | [Usage](references/usage.md), [Dependency Identifiers](references/dependency-id.md) |
| Configure substitutions, Preprocessors, Postprocessors, Wrappers, or final-value protection | [Extensions](references/extensions.md) |
| Use Node.js package metadata and namespace utilities | [Usage](references/usage.md), [Concepts](references/concepts.md) |
| Work with JSDoc aliases | [Types](references/types.md) |
| Preserve a deprecated surface or mount the installed skill | [Compatibility](references/compatibility.md), [Distribution](references/distribution.md) |

The references are self-contained package guidance. Verify exact runtime behavior
against the installed package and test the host's composition before relying on
an integration.
