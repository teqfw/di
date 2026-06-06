# @teqfw/di

![npms.io](https://img.shields.io/npm/dm/@teqfw/di)
![jsdelivr](https://img.shields.io/jsdelivr/npm/hm/@teqfw/di)

**Namespace-based component addressing and deterministic runtime linking for pure JavaScript ES modules.**

`@teqfw/di` replaces file-based application dependency wiring with namespace-based component addressing and deterministic runtime linking for JavaScript ES module applications.

JavaScript applications commonly express dependencies through static imports that point to concrete file paths, URLs, package specifiers, framework conventions, or bundler-controlled module graphs. This works well for small applications, but it couples application dependency intent to the way code is physically located and loaded.

`@teqfw/di` introduces a different model. Application components are addressed by stable namespace-based component addresses. Those addresses are encoded as **Canonical Dependency Codes (CDC)** and declared in source modules through `__deps__`. A runtime container then resolves the declarations through finalized namespace roots and links the required objects deterministically.

The ES module system remains the underlying code loading mechanism. The package does not replace ESM. It replaces application-level dependency wiring through static imports.

The package is the reference implementation of the **Tequila Framework (TeqFW)** dependency method: a way to structure modular monolith and isomorphic web applications around namespaces, explicit dependency contracts, and deterministic late binding.

## Why This Package Exists

Traditional JavaScript web development often treats the file system and module specifiers as the primary way to express application structure.

A module usually says not only what it needs, but also where that dependency is located:

```javascript
import Repository from "../repository/UserRepository.js";
```

This binds the source module to a concrete file path or module specifier. As the application grows, dependency structure becomes scattered across imports, framework conventions, decorators, generated code, and local wiring.

Enterprise ecosystems such as Java, C#, and PHP have long used namespaces, component identifiers, dependency inversion, and runtime composition to keep large systems maintainable. JavaScript has the technical ability to load ES modules dynamically, but mainstream JavaScript development rarely uses namespaces as the primary application-level addressing model.

`@teqfw/di` brings that enterprise-style addressing model to pure JavaScript.

Instead of making application modules depend on file paths, the package lets them depend on namespace-based component addresses:

```javascript
export const __deps__ = {
  repository: "App_User_Repository$",
};
```

This declaration says that the module needs `App_User_Repository`, without hard-coding where its source file is located or how that dependency should be loaded in a particular runtime environment.

## Product Goal

The goal of `@teqfw/di` is to make namespace-based component addressing and late binding practical in pure JavaScript applications.

The package gives applications a dependency model that is:

- explicit in source artifacts;
- based on stable component addresses rather than local file paths;
- deterministic at runtime under finalized configuration;
- usable across browser and Node.js environments;
- readable by humans;
- reconstructible by coding agents;
- independent from TypeScript metadata, decorators, reflection, and framework-managed injection.

The intended result is not abstraction for its own sake. The intended result is architectural supervision: dependency relationships remain visible enough for one human to review while agents generate, maintain, and refactor parts of the codebase.

## How the Model Works

The product model follows this chain:

```text
Namespace
  -> Component Address
  -> CDC
  -> __deps__
  -> Namespace Root
  -> Runtime Linker
  -> Linked Object
```

A **namespace** defines a stable application-level addressing space.

A **component address** identifies a component inside that namespace.

A **CDC** encodes the component address and linking semantics such as export selection, lifecycle, wrappers, or platform-specific access.

A module declares its dependencies through `__deps__`.

A **namespace root** maps a namespace prefix to a concrete runtime module location, such as a filesystem directory in Node.js or a URL base in the browser.

The container resolves CDC values under finalized configuration, imports the necessary ES modules, links declared dependencies, and returns linked objects.

The linking happens at runtime, but it is not heuristic. The container does not infer dependencies from behavior, constructor signatures, decorators, reflection, or naming guesses.

For identical dependency declarations, CDC values, namespace roots, module exports, lifecycle rules, and finalized container configuration, the container must produce the same linked result or the same failure.

## What It Provides

`@teqfw/di` provides:

- namespace-based component addressing;
- deterministic runtime linking of ES modules;
- explicit dependency contracts through CDC and `__deps__`;
- namespace-based module resolution;
- lifecycle control for singleton and new-instance dependencies;
- immutable linked objects;
- wrapper-based extension points for cross-cutting behavior;
- one dependency model that can be used in both browser and Node.js environments.

The result is an application structure that is easier to analyze, test, replace, and evolve when dependency relationships need to remain explicit.

## Why It Matters for Browser and Node.js

Browser and Node.js environments use ES modules, but they do not make application-level dependency wiring automatically environment-independent.

Static imports usually contain concrete module specifiers. Those specifiers often depend on file layout, package layout, URL layout, bundler configuration, or runtime-specific rules.

`@teqfw/di` moves application dependency intent away from those concrete specifiers.

A source module can declare:

```javascript
export const __deps__ = {
  repository: "App_User_Repository$",
};
```

The same declaration can be resolved through different namespace roots in different environments.

In Node.js, `App_` may point to a filesystem directory.

In a browser, `App_` may point to a URL base.

The module still runs as ESM. The difference is that application dependency wiring is expressed through component addresses rather than hard-coded import paths.

## Why It Matters for Coding Agents

This package is designed for codebases where LLM agents participate in implementation and maintenance.

AI-assisted development changes the practical scale of solo web development. One developer working with coding agents can now build and maintain systems whose size and structural complexity were previously more typical for enterprise teams.

That makes dependency structure more important, not less important.

Agents can generate and modify code quickly, but hidden dependency structure amplifies disorder. If application wiring is scattered across static imports, decorators, framework conventions, and generated code, a human supervisor must reconstruct architectural intent indirectly.

`@teqfw/di` makes dependency intent source-attached and explicit. Agents can produce `__deps__` mechanically, and humans can review dependency intent directly as data.

Agent readability is not a separate feature. It is a consequence of explicit namespace-based dependency structure.

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

Most JavaScript and TypeScript projects express application dependency structure through some mix of:

- static imports;
- file paths;
- package specifiers;
- framework conventions;
- TypeScript-first source architecture;
- decorators or metadata-driven injection;
- framework-managed DI.

`@teqfw/di` makes a different tradeoff. It favors **namespace-based component addresses** and **explicit runtime contracts** over hidden or inferred wiring.

Instead of relying on TypeScript metadata, reflection, decorators, or framework-specific dependency rules, modules declare dependencies directly as data and the container resolves them deterministically at runtime.

TypeScript has had a major influence on the JavaScript ecosystem, and that influence has been broadly positive. At the same time, TeqFW targets a different design space: **pure JavaScript + JSDoc**, isomorphic runtime behavior, namespace-based addressing, and codebases where one explicit structural representation is more valuable than TypeScript-oriented convenience.

This is not presented as the only correct way to structure JavaScript. It is a deliberate alternative for projects that benefit from stronger runtime explicitness and machine-reconstructible structure.

## Comparison

| Concern                       | Common TS/JS Approach                                         | `@teqfw/di`                                         |
| ----------------------------- | ------------------------------------------------------------- | --------------------------------------------------- |
| Application dependency wiring | Static imports, file paths, decorators, framework wiring      | `__deps__` declarations with CDC values             |
| Addressing model              | File-based or framework-defined                               | Namespace-based component addressing                |
| Resolution model              | Static, partly implicit, or framework-driven                  | Deterministic runtime linking                       |
| Structural source of truth    | Spread across code, metadata, config, and conventions         | Declared in source-attached dependency contracts    |
| Cross-environment wiring      | Often handled by bundlers, adapters, or duplicated specifiers | Controlled through namespace roots                  |
| Best fit                      | TypeScript-first applications and framework-led projects      | Pure JavaScript + JSDoc, isomorphic modular systems |
| Agent readability             | Mixed, often indirect                                         | Intentionally explicit and reconstructible          |

## Best Fit

`@teqfw/di` is primarily a fit when most of the following are true:

- one developer or a very small team remains the long-term architectural owner of the product;
- coding agents are used actively for implementation, maintenance, or refactoring;
- the application is a modular monolith or another web-oriented system that shares code between browser and server;
- stable component addressing is more valuable than direct file-based dependency wiring;
- deterministic runtime linking is useful for testing, replacement, and long-term maintenance;
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
- resolves `App_` through the registered namespace root;
- translates `App_User_Repository$` into a concrete ES module location;
- imports the module;
- reads `__deps__` for the selected export;
- recursively links dependencies;
- returns a frozen linked object.

## Core Concepts

### Namespace

A namespace defines a stable addressing space for application components.

In TeqFW, a dependency address such as:

```text
App_User_Repository$
```

uses `App_` as a namespace prefix.

The namespace makes the dependency address independent from local file paths and runtime-specific module specifiers.

### Component Address

A component address identifies an application component inside a namespace.

For example:

```text
App_User_Repository
```

identifies the `Repository` component inside the `App_` namespace.

The component address is logical. It is not itself a file path or URL.

### CDC

A **Canonical Dependency Code** is the string contract used to request a dependency.

General form:

```text
[PlatformPrefix]ModuleName[__ExportName][LifecycleAndWrappers]
```

Examples:

```text
App_User_Repository$
App_User_Repository__Factory$$
node:fs
npm:lodash
```

Where:

- `App_User_Repository` is the namespace-based component address;
- `__Factory` selects a named export;
- `$` means singleton lifecycle;
- `$$` means new instance lifecycle;
- `node:` and `npm:` address platform-specific modules.

### `__deps__`

`__deps__` is a source-attached dependency declaration.

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

### Namespace Root

A namespace root maps a namespace prefix to a module-specifier base:

```javascript
container.addNamespaceRoot("App_", "/abs/path/to/src/App", ".mjs");
```

This lets the container translate logical module names such as `App_User_Repository$` into concrete ES module files or URL-based module specifiers.

In Node.js, that often means filesystem-backed module roots:

```javascript
container.addNamespaceRoot("App_", "/project/src/App", ".mjs");
```

In a browser-oriented or isomorphic application, it can also mean URL-backed roots:

```javascript
container.addNamespaceRoot("App_", "https://cdn.example.com/app", ".mjs");
container.addNamespaceRoot("Web_", "//cdn.example.com/web", ".mjs");
```

This keeps dependency addressing stable while allowing the same logical naming model to work across shared application code, browser-facing modules, and different runtime environments.

### Runtime Linking

Runtime linking is the process of resolving CDC values under finalized container configuration, importing the corresponding ES modules, injecting declared dependencies, and returning linked objects.

The mechanism is dynamic because it runs at runtime.

The mechanism is deterministic because dependencies are declared explicitly and resolved through fixed namespace roots and configuration.

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

## Documentation for Agents

This package includes a machine-oriented package interface under `./ai/`.

Those files are intended for system prompts, examples, and agent consumption. They describe:

- container usage;
- dependency descriptors;
- CDC behavior;
- integration patterns.

In other words, the package ships a human-facing README and a machine-oriented interface for agents that need to use it as a dependency.

## Further Reading

- Usage guide: `ai/usage.md`
- Container API notes: `ai/container.md`
- Dependency descriptor concepts: `ai/concepts.md`
- Dependency ID format: `ai/dependency-id.md`
- Extension points: `ai/extensions.md`
- Project philosophy and intended application domain: `PHILOSOPHY.md`

## TeqFW Context

`@teqfw/di` is the core dependency-linking building block of the Tequila Framework (TeqFW).

TeqFW is aimed at building modular monolith web applications with a unified JavaScript codebase across browser and server runtimes. The method favors namespace-based component addressing, late binding, explicit contracts, pure JavaScript, and source artifacts that remain legible to both humans and LLM agents.

The broader TeqFW position is that AI-assisted development changes not only how code is written, but also what kind of structure a solo developer needs in order to supervise a growing application. `@teqfw/di` is one concrete answer to that change at the dependency-linking level.
