# @teqfw/di

![npms.io](https://img.shields.io/npm/dm/@teqfw/di)
![jsdelivr](https://img.shields.io/jsdelivr/npm/hm/@teqfw/di)

**Late binding for AI-assisted JavaScript applications that grow beyond simple static wiring.**

`@teqfw/di` is a runtime dependency container for pure JavaScript ES module applications.

It exists because AI-assisted development changes the practical scale of solo web development. One developer working with coding agents can now build and maintain systems whose size and structural complexity were previously more typical for enterprise teams.

Enterprise development has long used late binding, dependency inversion, and dependency containers to keep large systems maintainable. These techniques are common in Java and C# ecosystems, but they are not a dominant practice in JavaScript web development.

`@teqfw/di` adapts this architectural technique to modern JavaScript. It provides explicit dependency declarations and deterministic runtime linking instead of hidden application-level wiring through static imports, decorators, framework conventions, or generated code.

The package is the reference implementation of the **Tequila Framework (TeqFW)** dependency method: a way to structure modular monolith and isomorphic web applications around **Canonical Dependency Codes (CDC)** and module-level dependency descriptors (`__deps__`).

In practice, this means the package is not only a container library. It is also the concrete runtime model for a broader way of structuring JavaScript applications around explicit contracts, namespace-based addressing, and late binding.

## Why This Package Exists

Traditional JavaScript web development often works well when an application is small, short-lived, or strongly controlled by a single framework. Direct imports, local wiring, framework conventions, and implicit project knowledge are often enough.

That changes when a web application becomes a long-lived system with many modules, multiple runtime environments, and continuous agent-assisted maintenance.

Coding agents can generate, modify, and reorganize code quickly. They can also amplify disorder when the dependency structure is hidden, scattered, or reconstructed only from behavioral code. A human supervisor then has to recover architectural intent from static imports, framework conventions, decorators, local wiring, and generated output.

`@teqfw/di` addresses this problem by making dependency structure explicit and source-attached.

The package is based on the assumption that AI-assisted web development will make some enterprise-style architectural techniques more relevant to JavaScript developers. When one person with agents can work at enterprise-like scale, that person also needs enterprise-like tools for managing dependency structure.

## Product Goal

The goal of `@teqfw/di` is to make late binding practical, deterministic, and reviewable in pure JavaScript applications.

The package gives applications a dependency model that is:

- explicit in source artifacts;
- deterministic at runtime;
- readable by humans;
- reconstructible by coding agents;
- usable across browser and Node.js environments;
- independent from TypeScript metadata, decorators, and framework-managed injection.

The intended result is not abstraction for its own sake. The intended result is architectural supervision: dependency relationships remain visible enough for one human to review while agents generate, maintain, and refactor parts of the codebase.

## What It Provides

`@teqfw/di` provides:

- deterministic runtime linking of ES modules;
- explicit dependency contracts through CDC and `__deps__`;
- namespace-based module resolution;
- lifecycle control for singleton and new-instance dependencies;
- immutable linked objects;
- wrapper-based extension points for cross-cutting behavior;
- one runtime dependency model that can be used in both browser and Node.js environments.

The result is an application structure that is easier to analyze, test, replace, and evolve when dependency relationships need to remain explicit.

## Who It Is For

This package is designed primarily for:

- solo developers and very small teams building long-lived web applications;
- developers using coding agents as active implementation and maintenance participants;
- modular monolith web applications;
- isomorphic JavaScript systems that share code between browser and server;
- pure JavaScript + JSDoc codebases;
- projects where explicit dependency structure is more important than minimal local ceremony.

The package also aligns naturally with **[ADSM (Agent Driven Software Management)](http://fly.wiredgeese.com/flancer/leanpub/adsm-en/)**, a methodology for human-agent software development built around a maintained cognitive context.

## How It Fits in JavaScript

This approach is unusual in mainstream JavaScript.

Most JavaScript and TypeScript projects express dependency structure through some mix of:

- static imports;
- framework conventions;
- TypeScript-first source architecture;
- decorators or metadata-driven injection;
- framework-managed DI.

`@teqfw/di` makes a different tradeoff. It favors **explicit runtime contracts** over hidden or inferred wiring.

Instead of relying on TypeScript metadata, reflection, decorators, or framework-specific dependency rules, modules declare dependencies directly as data and the container resolves them deterministically at runtime.

That tradeoff is intentional.

TypeScript has had a major influence on the JavaScript ecosystem, and that influence has been broadly positive. At the same time, TeqFW targets a different design space: **pure JavaScript + JSDoc**, isomorphic runtime behavior, namespace-based addressing, and codebases where one explicit structural representation is more valuable than TypeScript-oriented convenience.

This is not presented as the only correct way to structure JavaScript. It is a deliberate alternative for projects that benefit from stronger runtime explicitness and machine-reconstructible structure.

## Comparison

| Concern                    | Common TS/JS Approach                        | `@teqfw/di`                                         |
| -------------------------- | -------------------------------------------- | --------------------------------------------------- |
| Dependency structure       | static imports, decorators, framework wiring | explicit CDC + `__deps__`                           |
| Resolution model           | partly implicit or framework-driven          | deterministic runtime linking                       |
| Structural source of truth | spread across code, metadata, config         | declared in module contracts                        |
| Best fit                   | TypeScript-first applications                | pure JavaScript + JSDoc, isomorphic modular systems |
| Agent readability          | mixed, often indirect                        | intentionally explicit                              |

## Best Fit

`@teqfw/di` is primarily a fit when most of the following are true:

- one developer or a very small team remains the long-term architectural owner of the product;
- coding agents are used actively for implementation, maintenance, or refactoring;
- the application is a modular monolith or another web-oriented system that shares code between browser and server;
- explicit runtime contracts are more valuable than compile-time import wiring;
- pure JavaScript + JSDoc is preferred over a TypeScript-first authoring model;
- the product is expected to outlive its initial prototype.

It is usually not the best fit for short-lived prototypes, teams that already depend heavily on decorator-driven TypeScript frameworks, or applications where mainstream framework conventions are more important than explicit machine-reconstructible dependency structure.

## Installation

```bash
npm install @teqfw/di
```

## Quick Start

Define one repository module and one service module that declares the repository as an explicit dependency.

`src/App/User/Repository.mjs`

```javascript
export default function Repository() {
  return {
    async findNameById(id) {
      return `User ${id}`;
    },
  };
}
```

`src/App/User/Service.mjs`

```javascript
export default function Service({ repository }) {
  return {
    async getProfile(id) {
      const name = await repository.findNameById(id);
      return { id, name };
    },
  };
}

export const __deps__ = {
  repository: "App_User_Repository$",
};
```

Configure the container and request the dependency:

```javascript
import path from "node:path";
import { fileURLToPath } from "node:url";
import Container from "@teqfw/di";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const container = new Container();
container.addNamespaceRoot("App_", path.resolve(__dirname, "./src/App"), ".mjs");

const service = await container.get("App_User_Service$");

const profile = await service.getProfile(42);

console.log(profile);
// { id: 42, name: "User 42" }
```

In this flow the container:

- parses the dependency request;
- resolves the module through the registered namespace root;
- reads `__deps__` for the selected export;
- recursively links dependencies;
- returns a frozen linked object.

## Core Concepts

### Late Binding

Late binding means that a module does not hard-code all concrete dependencies through static application-level imports.

Instead, the module declares what it needs, and the container links those dependencies at runtime according to explicit contracts and finalized configuration.

This allows application structure to remain changeable without hiding dependency decisions inside framework conventions or build-time transformations.

### `__deps__`

`__deps__` is a module-level dependency descriptor.

For a single-export module, dependencies can be declared in shorthand form:

```javascript
export const __deps__ = {
  localName: "Dependency_CDC",
};
```

Rules:

- the canonical form is hierarchical and keyed by export name;
- each export entry maps constructor argument names to CDC strings;
- if `__deps__` is absent, the export has no declared dependencies;
- a flat `__deps__` object is shorthand for limited single-export cases.

Canonical export-scoped form:

```javascript
export const __deps__ = {
  default: {
    localName: "Dependency_CDC",
  },
  Factory: {
    localName: "Dependency_CDC",
  },
};
```

### CDC

A **Canonical Dependency Code** is the string contract used to request a dependency.

General form:

```txt
[PlatformPrefix]ModuleName[__ExportName][LifecycleAndWrappers]
```

Examples:

```txt
App_Service$
App_Service__Factory$$
node:fs
npm:lodash
```

Where:

- `__Factory` selects a named export;
- `$` means singleton lifecycle;
- `$$` means new instance lifecycle;
- `node:` and `npm:` address platform-specific modules.

### Namespace Root

A namespace root maps a CDC prefix to a module-specifier base:

```javascript
container.addNamespaceRoot("App_", "/abs/path/to/src/App", ".mjs");
```

This lets the container translate logical module names such as `App_Root__Factory$` into concrete ES module files or URL-based module specifiers.

In Node.js, that often means filesystem-backed module roots:

```javascript
container.addNamespaceRoot("App_", "/project/src/App", ".mjs");
```

In a web-oriented or isomorphic application, it can also mean URL-backed roots for browser imports:

```javascript
container.addNamespaceRoot("App_", "https://cdn.example.com/app", ".mjs");
container.addNamespaceRoot("Web_", "//cdn.example.com/web", ".mjs");
```

This keeps dependency addressing stable while allowing the same logical naming model to work across shared application code, browser-facing modules, and different runtime environments.

## Public API

Create a container:

```javascript
const container = new Container();
```

Configure it before the first `get(...)`:

- `setParser(parser)`
- `addNamespaceRoot(prefix, target, defaultExt)`
- `addPreprocess(fn)`
- `addPostprocess(fn)`
- `enableLogging()`
- `enableTestMode()`
- `register(cdc, mock)`

Resolve dependencies:

```javascript
await container.get(cdc);
```

The container is builder-configurable until the first `get(...)`. After that point configuration is locked.

## Test Mode

Test mode allows registered mocks to be resolved before module instantiation:

```javascript
container.enableTestMode();
container.register("App_Service$", mockService);
```

This keeps replacement explicit and local to container configuration.

## Browser Usage

```html
<script type="module">
  import Container from "https://cdn.jsdelivr.net/npm/@teqfw/di@2/+esm";

  const container = new Container();
</script>
```

## LLM-Oriented Development

This package is designed for codebases where LLM agents participate in implementation and maintenance.

That affects the architecture directly. In many human-oriented JavaScript codebases, local explicitness is treated as extra ceremony. Here it is a deliberate tradeoff: dependency structure stays visible where it is needed, instead of being inferred from decorators, reflection, framework conventions, or scattered configuration.

This increases local structural surface area, but it reduces ambiguity.

For LLM-driven maintenance, explicit dependency declarations make dependency structure easier to reconstruct, edit, and verify from source code alone. Agents can produce `__deps__` mechanically, while humans can review dependency intent directly as source-attached data.

## When This Fits

This approach is a good fit when you want:

- a modular monolith with explicit component boundaries;
- shared JavaScript code across browser and Node.js;
- runtime late binding instead of static application wiring;
- explicit, machine-readable dependency structure;
- deterministic dependency resolution under finalized configuration;
- a pure JavaScript + JSDoc stack instead of TypeScript-first architecture;
- a codebase that remains legible to both humans and coding agents.

## When It Probably Does Not

This approach is probably a poor fit when:

- your project is deeply committed to TypeScript-first conventions;
- you prefer decorator-based or framework-managed injection;
- your team values minimal local ceremony over explicit structural contracts;
- you do not need isomorphic runtime structure or late binding;
- the codebase is optimized only for human authorship and not for machine-assisted maintenance;
- the application is small enough that direct imports remain the clearest dependency model.

## Documentation for Agents

This package includes a machine-oriented package interface under `./ai/`.

Those files are intended for system prompts, examples, and agent consumption. They describe:

- container usage;
- dependency descriptors;
- CDC behavior;
- integration patterns.

In other words, the package ships a human-facing README and a machine-oriented interface for agents that need to use it as a dependency.

## Further Reading

- Product overview: `ctx/docs/product/overview.md`
- Product domain model and boundaries: `ctx/docs/product/domain.md`
- Default CDC profile and compatibility surface: `ctx/docs/product/default-cdc-profile.md`
- Architecture overview: `ctx/docs/architecture/overview.md`
- Runtime linking model: `ctx/docs/architecture/linking-model.md`
- Container implementation contract: `ctx/docs/code/components/container.md`
- Project philosophy and intended application domain: `PHILOSOPHY.md`

## TeqFW Context

`@teqfw/di` is the core dependency-linking building block of the Tequila Framework (TeqFW).

TeqFW is aimed at building modular monolith web applications with a unified JavaScript codebase across browser and server runtimes. The method favors late binding, namespace-based structure, explicit contracts, pure JavaScript, and source artifacts that remain legible to both humans and LLM agents.

The broader TeqFW position is that AI-assisted development changes not only how code is written, but also what kind of structure a solo developer needs in order to supervise a growing application. `@teqfw/di` is one concrete answer to that change at the dependency-linking level.
