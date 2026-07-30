# @teqfw/di

**Deterministic token-based runtime linking for native JavaScript ES modules.**

`@teqfw/di` lets an application declare dependencies by stable module tokens instead of coupling them to local import paths. A container resolves those declarations through configured namespace roots at runtime. This makes isomorphic JavaScript decomposable while it is written and linkable when it runs - explicit enough for agents to analyze and evolve. It brings enterprise practices such as SOLID to JavaScript without TypeScript or transpilation.

Use it for long-lived pure JavaScript + JSDoc applications where explicit, reviewable dependency structure matters. It is not a decorator, reflection, or framework-managed DI system, and it is usually unnecessary for a small application with clear direct imports.

## Install

```sh
npm install @teqfw/di
```

The normative runtime model is native ESM on Node.js or in a browser-compatible environment.

## Quick Start

A module exports its principal value, then declares dependencies with `__deps__` at the end of the file:

```js
export default function Service({repository}) {
  return {
    async getProfile(id) {
      return {id, name: await repository.findNameById(id)};
    },
  };
}

export const __deps__ = {
  default: {
    repository: "App_User_Repository$",
  },
};
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

Keep registries in a Node.js composition root; browser and DI-managed runtime modules must not import them. New code must not import `@teqfw/di/src/**`.

## Guidance for Coding Agents

The version-matched `teqfw-di` Agent Skill is published at `node_modules/@teqfw/di/skills/teqfw-di`. It gives an agent detailed guidance for integrating this package. A host project decides whether and how to mount it; installation does not modify the host project.

```sh
mkdir -p .agents/skills
ln -s ../../node_modules/@teqfw/di/skills/teqfw-di .agents/skills/teqfw-di
```

Use the equivalent skills directory when a host project uses another agent layout. Alternatively, install it for the current user:

```sh
npx skills add teqfw/di --skill teqfw-di
```

The `teqfw-platform` skill helps agents build TeqFW applications. The `adsm-ctx` skill supports the author's Agent-Driven Software Management (ADSM) methodology. The host project's own instructions and cognitive context remain authoritative for application intent and architecture.

## Development and Ecosystem

This product is developed by AI agents under the direction of Alex Gusev, following the Agent-Driven Software Management (ADSM) methodology. It is built for the Tequila Framework (TeqFW) platform and contributes to its ecosystem.

- [Tequila Framework](https://teqfw.com/?teqfw-di)
- [Alex Gusev's Personal Website](https://wiredgeese.com/?teqfw-di)
- [Alex Gusev's Telegram Channel](https://t.me/alexgusev_lab_en)
- [Agent-Driven Software Management: A Practical Guide](http://fly.wiredgeese.com/flancer/leanpub/adsm-en/?teqfw-di)
