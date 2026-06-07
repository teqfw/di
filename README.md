# @teqfw/di

![npms.io](https://img.shields.io/npm/dm/@teqfw/di)
![jsdelivr](https://img.shields.io/jsdelivr/npm/hm/@teqfw/di)

**Enterprise-style component addressing and deterministic runtime linking for pure JavaScript ES modules.**

`@teqfw/di` brings an enterprise development mindset to JavaScript: components are addressed by stable namespaces, dependencies are declared as explicit contracts, and application wiring is performed by a deterministic runtime linker.

It is not primarily “another dependency injection library”.

It is a way to move JavaScript applications from file-path-based dependency wiring toward namespace-based component composition — a model familiar from enterprise ecosystems such as Java and C#, but implemented for pure JavaScript ES modules without TypeScript metadata, decorators, reflection, or framework-managed injection.

The package is the reference implementation of the **Tequila Framework (TeqFW)** dependency method.

## Why This Package Exists

JavaScript started as a language for browser scripts and web pages. Its mainstream dependency model still reflects that history.

Most JavaScript applications express dependencies through static imports:

```javascript
import Repository from "../repository/UserRepository.js";
```

This works well when the codebase is small.

But as an application grows, the module no longer says only what it needs. It also hard-codes where that dependency is physically located. Application intent becomes mixed with file layout, package layout, URL layout, bundler rules, framework conventions, and local wiring decisions.

That coupling is manageable in small projects.

It becomes a structural problem in long-lived applications.

Enterprise ecosystems such as Java and C# solved this problem differently. They developed a mindset based on namespaces, dependency inversion, IoC containers, component identifiers, explicit contracts, and runtime composition. The goal was not abstraction for its own sake. The goal was architectural manageability at scale.

`@teqfw/di` transfers that mindset into pure JavaScript.

Instead of depending on a file path, a module declares that it needs a component:

```javascript
export const __deps__ = {
  repository: "App_User_Repository$",
};
```

This declaration says:

> This module needs the `App_User_Repository` component.

It does not say where the file is located.

The mapping from logical component address to concrete ES module location is handled by the container through namespace roots.

## Why This Matters Now

AI-assisted development changes the practical scale of JavaScript projects.

One developer working with coding agents can now build and maintain systems whose size and complexity were previously typical for enterprise teams. The limiting factor is no longer only code generation speed. The limiting factor is architectural supervision.

Agents can produce code quickly.

But if dependency structure is hidden inside static imports, framework conventions, decorators, generated code, and local wiring, the human supervisor must reconstruct architectural intent indirectly.

That does not scale.

`@teqfw/di` makes dependency intent explicit, source-attached, and machine-reconstructible.

A coding agent can generate `__deps__` declarations mechanically.

A human can review dependency intent directly as data.

The container can resolve those declarations deterministically at runtime.

The result is not just a technical mechanism. It is a different way to organize JavaScript code for human-agent software development.

## Product Goal

The goal of `@teqfw/di` is to make enterprise-style component addressing and late binding practical in pure JavaScript applications.

It gives JavaScript applications a dependency model that is:

- based on stable namespace-based component addresses;
- explicit in source artifacts;
- deterministic under finalized runtime configuration;
- usable across browser and Node.js environments;
- readable by humans;
- reconstructible by coding agents;
- independent from TypeScript metadata, decorators, reflection, and framework-managed injection.

The intended result is architectural supervision.

A developer should be able to see what a component needs without tracing import paths across the filesystem. An agent should be able to modify code without silently destroying the dependency structure. A runtime should be able to link components through explicit contracts rather than heuristic inference.

## Core Idea

Static imports answer this question:

> Where is the code?

Canonical Dependency Codes answer a different question:

> What component is needed?

That difference is the core of the package.

```javascript
import Repository from "../repository/UserRepository.js";
```

This binds a module to a concrete module specifier.

```javascript
export const __deps__ = {
  repository: "App_User_Repository$",
};
```

This binds a module to a logical component address.

The first form is file-oriented.

The second form is architecture-oriented.

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

A **CDC** — Canonical Dependency Code — encodes the component address and linking semantics such as export selection, lifecycle, wrappers, or platform-specific access.

A module declares its dependencies through `__deps__`.

A **namespace root** maps a namespace prefix to a concrete runtime module location, such as a filesystem directory in Node.js or a URL base in the browser.

The container resolves CDC values under finalized configuration, imports the required ES modules, links declared dependencies, and returns linked objects.

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
- one dependency model for browser and Node.js environments;
- source structure that remains legible to humans and LLM agents.

## Why It Matters for Browser and Node.js

Browser and Node.js environments both support ES modules, but they do not provide an environment-independent application wiring model.

Static imports usually contain concrete module specifiers. Those specifiers depend on file layout, package layout, URL layout, bundler configuration, or runtime-specific rules.

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

In agent-assisted development, the main risk is not that agents cannot generate code. The risk is that they generate code faster than the architecture can be supervised.

Hidden wiring amplifies that risk.

If dependency structure is scattered across imports, decorators, framework conventions, generated files, and local composition code, both the human and the agent must reconstruct intent indirectly.

`@teqfw/di` makes dependency intent visible:

```javascript
export const __deps__ = {
  repository: "App_User_Repository$",
  logger: "App_Logger$",
  config: "App_Config$",
};
```

This is not just executable configuration.

It is an architectural statement attached to the source module.

Agents can produce it.

Humans can review it.

The container can execute it.

That makes dependency structure part of the shared cognitive field between the human developer, coding agents, and runtime system.

## Who It Is For

This package is designed primarily for:

- solo developers and very small teams building long-lived web applications;
- developers using coding agents as active implementation and maintenance participants;
- modular monolith web applications;
- isomorphic JavaScript systems that share code between browser and server;
- pure JavaScript + JSDoc codebases;
- projects where explicit dependency structure is more important than minimal local ceremony;
- applications expected to grow beyond prototype size.

It is usually not the best fit for short-lived prototypes, teams already committed to decorator-driven TypeScript frameworks, or applications where mainstream framework conventions are more important than explicit machine-reconstructible dependency structure.

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

It is a deliberate alternative for projects that benefit from stronger runtime explicitness and machine-reconstructible structure.

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
| Architectural mindset         | Local module graph                                            | Enterprise-style component composition              |

## Best Fit

`@teqfw/di` is primarily a fit when most of the following are true:

- one developer or a very small team remains the long-term architectural owner of the product;
- coding agents are used actively for implementation, maintenance, or refactoring;
- the application is a modular monolith or another web-oriented system that shares code between browser and server;
- stable component addressing is more valuable than direct file-based dependency wiring;
- deterministic runtime linking is useful for testing, replacement, and long-term maintenance;
- pure JavaScript + JSDoc is preferred over a TypeScript-first authoring model;
- the product is expected to outlive its initial prototype.

It is usually not the best fit when:

- the project is a short-lived prototype;
- the team is fully invested in a framework-managed DI model;
- TypeScript decorators and metadata are central to the architecture;
- file-based imports are sufficient and architectural supervision is not a concern;
- minimal local ceremony is more important than explicit dependency structure.

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

`@teqfw/di` is one answer to that change: enterprise-style component composition for pure JavaScript.
