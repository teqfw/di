# @teqfw/di

![npms.io](https://img.shields.io/npm/dm/@teqfw/di)
![jsdelivr](https://img.shields.io/jsdelivr/npm/hm/@teqfw/di)

**Enterprise-scale dependency architecture for pure JavaScript.**

`@teqfw/di` replaces fragile file-path-based wiring with namespace-based component contracts and deterministic runtime linking, so large JavaScript codebases remain understandable to humans and reconstructible by coding agents.

It is built for pure JavaScript ES modules.

No TypeScript metadata.
No decorators.
No reflection.
No framework-managed injection.
No transpilation requirement.

The package uses dependency injection techniques, but its main purpose is architectural governance, not constructor convenience.

## Why JavaScript Dependency Wiring Breaks at Scale

JavaScript applications usually express dependencies through static imports:

```javascript
import Repository from "../repository/UserRepository.js";
```

This looks simple.

But this line says two different things at once:

1. what the module needs;
2. where that dependency is physically located.

That coupling is acceptable in small codebases.

It becomes a structural problem when the application grows.

As modules multiply, dependency intent becomes scattered across:

- file paths;
- package specifiers;
- framework conventions;
- bundler configuration;
- generated code;
- decorators;
- local composition logic.

The architecture becomes harder to supervise because the real dependency graph is embedded inside implementation details.

A developer no longer sees a component dependency model.

The developer sees a filesystem.

## Why AI-Assisted Development Makes This More Important

Coding agents change the practical scale of JavaScript development.

One developer working with agents can now create and maintain systems whose size was previously more typical for enterprise teams.

The bottleneck is no longer only code generation.

The bottleneck is architectural control.

Agents can generate files quickly. They can modify many modules in one iteration. They can refactor local code. But if the dependency structure is hidden inside file paths and framework conventions, both the agent and the human supervisor must reconstruct architectural intent indirectly.

That does not scale well.

Large AI-assisted JavaScript systems need dependency structure that is:

- explicit;
- stable;
- reviewable;
- machine-readable;
- independent from local file layout;
- deterministic at runtime.

This is the problem `@teqfw/di` addresses.

## The Enterprise Shift: From Files to Components

Enterprise ecosystems such as Java and C# have long used namespaces, dependency inversion, IoC containers, component identifiers, explicit contracts, and runtime composition to keep large systems manageable.

`@teqfw/di` brings that model of thinking to pure JavaScript.

Instead of making a module depend on a file path:

```javascript
import Repository from "../repository/UserRepository.js";
```

the module declares a dependency on a component:

```javascript
export const __deps__ = {
  repository: "App_User_Repository$",
};
```

This declaration says:

> This module needs the `App_User_Repository` component.

It does not say where the source file is located.

The physical module location is resolved later by the container through configured namespace roots.

This is the central shift:

```text
from file paths
to component addresses

from local imports
to explicit dependency contracts

from scattered wiring
to deterministic runtime composition
```

## What @teqfw/di Is

`@teqfw/di` is a runtime composition layer for pure JavaScript ES modules.

It provides:

- namespace-based component addressing;
- Canonical Dependency Codes;
- source-attached dependency declarations through `__deps__`;
- deterministic runtime linking;
- namespace root mapping for Node.js and browser environments;
- lifecycle control for singleton and new-instance dependencies;
- explicit replacement in test mode;
- wrapper-based extension points;
- immutable linked objects.

The ES module system remains the underlying loading mechanism.

The package does not replace ESM.

It replaces application-level dependency wiring through static imports.

## Product Goal

The goal of `@teqfw/di` is to make enterprise-scale dependency architecture practical in pure JavaScript.

The package gives JavaScript applications a dependency model that is:

- based on stable namespace-based component addresses;
- explicit in source artifacts;
- deterministic under finalized runtime configuration;
- usable across browser and Node.js environments;
- readable by humans;
- reconstructible by coding agents;
- independent from TypeScript metadata, decorators, reflection, and framework-managed injection.

The intended result is architectural supervision.

A developer should be able to see what a component needs without tracing import paths across the filesystem.

An agent should be able to modify code without silently destroying the dependency structure.

A runtime should be able to link components through explicit contracts rather than inference.

## Core Model

The model follows this chain:

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

A **CDC** — Canonical Dependency Code — encodes the component address and linking semantics.

A module declares its dependencies through `__deps__`.

A **namespace root** maps a namespace prefix to a concrete runtime module location.

The container resolves CDC values under finalized configuration, imports the required ES modules, links declared dependencies, and returns linked objects.

The linking happens at runtime, but it is not heuristic. The container does not infer dependencies from behavior, constructor signatures, decorators, reflection, or naming guesses.

For identical dependency declarations, CDC values, namespace roots, module exports, lifecycle rules, and finalized container configuration, the container must produce the same linked result or the same failure.

## Example: File-Oriented vs Component-Oriented Wiring

Traditional JavaScript wiring:

```javascript
import Repository from "../repository/UserRepository.js";
```

This is file-oriented.

The module depends on a concrete module specifier.

With `@teqfw/di`:

```javascript
export const __deps__ = {
  repository: "App_User_Repository$",
};
```

This is component-oriented.

The module depends on a logical component address.

The difference is not just technical.

It changes the source of architectural truth.

## Why It Matters for Coding Agents

In agent-assisted development, dependency declarations become part of the shared cognitive field between the human developer, the coding agent, and the runtime system.

A module can expose its dependency intent as data:

```javascript
export const __deps__ = {
  repository: "App_User_Repository$",
  logger: "App_Logger$",
  config: "App_Config$",
};
```

This structure is easy for agents to generate.

It is easy for humans to review.

It is deterministic for the container to execute.

Agent readability is not a separate feature. It is a consequence of explicit namespace-based dependency structure.

## Why It Matters for Browser and Node.js

Browser and Node.js environments both support ES modules, but they do not provide one shared application-level dependency wiring model.

Static imports usually depend on:

- file layout;
- package layout;
- URL layout;
- bundler behavior;
- runtime-specific module resolution.

`@teqfw/di` moves dependency intent away from those concrete specifiers.

The same source module can declare:

```javascript
export const __deps__ = {
  repository: "App_User_Repository$",
};
```

In Node.js, `App_` may point to a filesystem directory.

In a browser, `App_` may point to a URL base.

The dependency declaration remains stable.

Only the namespace root changes.

## Who It Is For

`@teqfw/di` is designed primarily for:

- solo developers and small teams building long-lived web applications;
- developers using coding agents as active implementation and maintenance participants;
- modular monolith applications;
- isomorphic JavaScript systems that share code between browser and server;
- pure JavaScript + JSDoc codebases;
- projects where explicit dependency structure is more important than minimal local ceremony;
- applications expected to grow beyond prototype size.

It is especially relevant when one human remains responsible for architectural supervision while agents participate in code generation, maintenance, and refactoring.

## When It Is Not the Best Fit

`@teqfw/di` is usually not the best fit when:

- the project is a short-lived prototype;
- the application is small enough for direct imports to remain clear;
- the team is fully committed to a decorator-driven TypeScript framework;
- framework conventions are more important than explicit dependency contracts;
- minimal local ceremony is more valuable than architectural traceability;
- runtime linking is not acceptable for the project’s deployment model.

This package is a deliberate architectural tradeoff.

It favors explicit structure over local simplicity.

## How It Fits in JavaScript

This approach is unusual in mainstream JavaScript.

Most JavaScript and TypeScript projects express application dependency structure through some mix of:

- static imports;
- file paths;
- package specifiers;
- framework conventions;
- TypeScript-first source architecture;
- decorators or metadata-driven injection;
- framework-managed DI;
- bundler-controlled module graphs.

`@teqfw/di` makes a different tradeoff.

It favors namespace-based component addresses and explicit runtime contracts over hidden or inferred wiring.

TypeScript has had a major influence on the JavaScript ecosystem, and that influence has been broadly positive. At the same time, TeqFW targets a different design space:

- pure JavaScript + JSDoc;
- no transpilation requirement;
- isomorphic runtime behavior;
- namespace-based addressing;
- explicit dependency declarations;
- source artifacts readable by humans and agents.

This is not presented as the only correct way to structure JavaScript.

It is a focused alternative for projects that need stronger runtime explicitness and machine-reconstructible structure.

## Comparison

| Concern                    | Common JS/TS Approach                                 | `@teqfw/di`                             |
| -------------------------- | ----------------------------------------------------- | --------------------------------------- |
| Dependency expression      | Static imports, decorators, framework wiring          | `__deps__` declarations with CDC values |
| Addressing model           | File-based, package-based, or framework-defined       | Namespace-based component addressing    |
| Resolution model           | Static, implicit, framework-driven, or bundler-driven | Deterministic runtime linking           |
| Structural source of truth | Spread across code, metadata, config, and conventions | Source-attached dependency contracts    |
| Cross-environment wiring   | Bundlers, adapters, duplicated specifiers             | Namespace roots                         |
| Best fit                   | Framework-led or TypeScript-first applications        | Pure JavaScript + JSDoc modular systems |
| Agent readability          | Mixed and often indirect                              | Explicit and reconstructible            |
| Architectural mindset      | Local module graph                                    | Enterprise-scale component composition  |

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
```

Output:

```javascript
{ id: 42, name: "User 42" }
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

The component address is logical.

It is not itself a file path or URL.

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

The container is builder-configurable until the first `get(...)`.

After that point configuration is locked.

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

The package ships both a human-facing README and a machine-oriented interface for agents that need to use it as a dependency.

## Further Reading

- Usage guide: `ai/usage.md`
- Container API notes: `ai/container.md`
- Dependency descriptor concepts: `ai/concepts.md`
- Dependency ID format: `ai/dependency-id.md`
- Extension points: `ai/extensions.md`
- Project philosophy and intended application domain: `PHILOSOPHY.md`

## TeqFW Context

`@teqfw/di` is the core dependency-linking building block of the Tequila Framework.

TeqFW is aimed at building modular monolith web applications with a unified JavaScript codebase across browser and server runtimes. The method favors namespace-based component addressing, late binding, explicit contracts, pure JavaScript, and source artifacts that remain legible to both humans and LLM agents.

The broader TeqFW position is that AI-assisted development changes not only how code is written, but also what kind of structure a solo developer needs in order to supervise a growing application.

When JavaScript applications reach enterprise scale under human-agent development, file-path-based dependency wiring becomes too local and too implicit.

`@teqfw/di` is one concrete answer to that change: enterprise-scale dependency architecture for pure JavaScript.
