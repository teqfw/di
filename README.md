# @teqfw/di

**Deterministic token-based runtime linking for native JavaScript ES modules.**

`@teqfw/di` lets an application declare dependencies by stable module tokens instead of coupling them to local import paths. A container resolves those declarations through configured namespace roots at runtime.

Use it for long-lived pure JavaScript + JSDoc applications where explicit, reviewable dependency structure matters. It is not a decorator, reflection, or framework-managed DI system, and it is usually unnecessary for a small application with clear direct imports.

## Install

```sh
npm install @teqfw/di
```

The normative runtime model is native ESM on Node.js or in a browser-compatible environment.

## Quick Start

A module exports its principal value and declares dependencies with `__deps__`:

```js
export const __deps__ = {
  default: {
    repository: "App_User_Repository$",
  },
};

export default function Service({repository}) {
  return {
    async getProfile(id) {
      return {id, name: await repository.findNameById(id)};
    },
  };
}
```

Configure the container before its first request:

```js
import path from "node:path";
import {fileURLToPath} from "node:url";
import Container from "@teqfw/di";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const container = new Container();
container.addNamespaceRoot("App_", path.join(rootDir, "src/App"), ".mjs");

const service = await container.get("App_User_Service$");
console.log(await service.getProfile(42));
```

Namespace roots map token prefixes to module locations; browser-compatible code may use URL targets. Configure roots, hooks, diagnostics, and test mocks before the first `get()`. Resolved values are immutable. For tests, call `enableTestMode()` and `register(specifier, mock)` before the first request.

## Public API

- `@teqfw/di` — default `Container`.
- `@teqfw/di/node/registry/namespace` — Node.js composition-stage namespace discovery.
- `@teqfw/di/node/registry/package` — Node.js composition-stage package graph discovery.

Keep registries in a Node.js composition root; browser and DI-managed runtime modules must not import them. New code must not import `@teqfw/di/src/**`. The deprecated `@teqfw/di/src/Config/NamespaceRegistry.mjs` path exists only for migration.

## Guidance for Coding Agents

The version-matched `teqfw-di` Agent Skill is published at `node_modules/@teqfw/di/skills/teqfw-di`. A host project decides whether and how to mount it; installation does not modify the host project.

```sh
mkdir -p .agents/skills
ln -s ../../node_modules/@teqfw/di/skills/teqfw-di .agents/skills/teqfw-di
```

The skill provides detailed integration, composition, testing, compatibility, and metadata guidance for this installed package version. The host project's own instructions and cognitive context remain authoritative for application intent and architecture.
