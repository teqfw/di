# @teqfw/di

![npms.io](https://img.shields.io/npm/dm/@teqfw/di)
![jsdelivr](https://img.shields.io/jsdelivr/npm/hm/@teqfw/di)

**Deterministic runtime dependency linker for ES modules, built for pure JavaScript applications with explicit contracts.**

`@teqfw/di` is a runtime container for JavaScript applications that want **late binding**, **explicit dependency declarations**, and **deterministic runtime linking** instead of application-level wiring through static imports.

It is the reference implementation of the **Tequila Framework (TeqFW)** method: a way to structure modular monolith and isomorphic web applications around **Canonical Dependency Codes (CDC)** and module-level dependency descriptors (`__deps__`).

In practice, "reference implementation of a method" means this package is not only a container library. It is also the concrete runtime model for a broader way of structuring JavaScript applications around explicit contracts, namespace-based addressing, and late binding.

This package is designed primarily for:

- modular monolith web applications;
- isomorphic JavaScript systems that share code between browser and server;
- pure JavaScript + JSDoc codebases;
- projects developed or maintained with significant LLM-agent involvement.

## Why Use It

`@teqfw/di` provides:

- deterministic runtime linking of ES modules;
- explicit dependency contracts through CDC and `__deps__`;
- namespace-based module resolution;
- lifecycle control for singleton and new-instance dependencies;
- immutable linked objects;
- wrapper-based extension points for cross-cutting behavior.

The result is an application structure that is easier to analyze, test, replace, and evolve when dependency relationships need to remain explicit.

## How It Fits in JavaScript

This approach is unusual in mainstream JavaScript.

Most JavaScript and TypeScript projects express dependency structure through some mix of:

- static imports;
- framework conventions;
- TypeScript-first source architecture;
- decorators or metadata-driven injection;
- framework-managed DI.

`@teqfw/di` makes a different tradeoff. It favors **explicit runtime contracts** over hidden or inferred wiring. Instead of relying on TypeScript metadata or decorator-driven injection, modules declare dependencies directly as data and the container resolves them deterministically at runtime.

That tradeoff is intentional.

TypeScript has had a major influence on the JavaScript ecosystem, and that influence has been broadly positive. At the same time, JavaScript itself continues to evolve every year, steadily narrowing part of the gap in developer ergonomics and language expressiveness.

For TypeScript-first ecosystems, other DI approaches are often a more natural fit because those ecosystems already rely on compile-time metadata, annotations, and framework or container conventions. TeqFW targets a different design space: **pure JavaScript + JSDoc**, isomorphic runtime behavior, and codebases where a single explicit structural representation is more valuable than TypeScript-oriented convenience.

This is not presented as the only correct way to structure JavaScript. It is a deliberate alternative for projects that benefit from stronger runtime explicitness and machine-reconstructible structure.

## Comparison

| Concern | Common TS/JS Approach | `@teqfw/di` |
| --- | --- | --- |
| Dependency structure | static imports, decorators, framework wiring | explicit CDC + `__deps__` |
| Resolution model | partly implicit or framework-driven | deterministic runtime linking |
| Structural source of truth | spread across code, metadata, config | declared in module contracts |
| Best fit | TypeScript-first applications | pure JavaScript + JSDoc, isomorphic modular systems |
| LLM readability | mixed, often indirect | intentionally explicit |

## Installation

```bash
npm install @teqfw/di
```

## Quick Start

Define one helper module and one module that declares its dependency explicitly.

`src/App/Helper/Cast.mjs`

```javascript
export default function App_Helper_Cast() {
  return function cast(value) {
    return String(value);
  };
}
```

`src/App/Root.mjs`

```javascript
export const __deps__ = {
  cast: "App_Helper_Cast$",
};

export default class App_Root {
  constructor({ cast }) {
    return {
      configure(params = {}) {
        return {
          name: cast(params.name ?? "app"),
        };
      },
    };
  }
}
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

const app = await container.get("App_Root$");

console.log(app.configure({ name: 123 }).name);
// "123"
```

In this flow the container:

- parses the dependency request;
- resolves the module through the registered namespace root;
- reads `__deps__` for the selected export;
- recursively links dependencies;
- returns a frozen linked object.

## Core Concepts

### `__deps__`

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

This increases local structural surface area, but it reduces ambiguity. For LLM-driven maintenance, that makes dependency structure easier to reconstruct, edit, and verify from source code alone.

## When This Fits

This approach is a good fit when you want:

- a modular monolith with explicit component boundaries;
- shared JavaScript code across browser and Node.js;
- runtime late binding instead of static application wiring;
- explicit, machine-readable dependency structure;
- a pure JavaScript + JSDoc stack instead of TypeScript-first architecture.

## When It Probably Does Not

This approach is probably a poor fit when:

- your project is deeply committed to TypeScript-first conventions;
- you prefer decorator-based or framework-managed injection;
- your team values minimal local ceremony over explicit structural contracts;
- you do not need isomorphic runtime structure or late binding;
- the codebase is optimized only for human authorship and not for machine-assisted maintenance.

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
- Product scope and boundaries: `ctx/docs/product/scope.md`
- Default CDC profile and compatibility surface: `ctx/docs/product/default-cdc-profile.md`
- Architecture overview: `ctx/docs/architecture/overview.md`
- Runtime linking model: `ctx/docs/architecture/linking-model.md`
- Container implementation contract: `ctx/docs/code/components/container.md`
- Project philosophy and intended application domain: `PHILOSOPHY.md`

## TeqFW Context

`@teqfw/di` is the core building block of the Tequila Framework (TeqFW).

TeqFW is aimed at building modular monolith web applications with a unified JavaScript codebase across browser and server runtimes. The method favors late binding, namespace-based structure, explicit contracts, and source artifacts that remain legible to both humans and LLM agents.
