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
Composition Root configures Container
  → one public get(root Dependency Identifier)
  → one root Dependency Resolution and Dependency Graph
  → host uses the returned root
```

Do not treat `Container` as a service locator. Its first `get()` claims the
only root; a later `get()`, even for the same identifier, is invalid. A different
root requires another configured Container. Runtime modules declare child
dependencies in `__deps__`; the Container resolves them recursively in that
same graph. Teq-compatible runtime modules have no static ES imports.

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
| Configure one root, introspect it, use test mode, or diagnose failure | [Container](references/container.md) |
| Write `__deps__`, construct Dependency Identifiers, or select a Lifestyle | [Usage](references/usage.md), [Dependency Identifiers](references/dependency-id.md) |
| Configure substitutions, Preprocessors, Postprocessors, or Wrappers | [Extensions](references/extensions.md) |
| Use Node.js package metadata and namespace utilities | [Usage](references/usage.md), [Concepts](references/concepts.md) |
| Work with JSDoc aliases | [Types](references/types.md) |
| Preserve a deprecated surface or mount the installed skill | [Compatibility](references/compatibility.md), [Distribution](references/distribution.md) |

The references are self-contained package guidance. Verify exact runtime behavior
against the installed package and test the host's composition before relying on
an integration.
