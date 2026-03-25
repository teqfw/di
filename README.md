# @teqfw/di

![npms.io](https://img.shields.io/npm/dm/@teqfw/di)
![jsdelivr](https://img.shields.io/jsdelivr/npm/hm/@teqfw/di)

**Runtime dependency linker for JavaScript applications designed for development with LLM agents.**

`@teqfw/di` is the core infrastructure of the **Tequila Framework (TeqFW)** — an architectural approach for building web applications in which **humans design system architecture and specifications, while LLM agents generate and maintain the implementation.**

Instead of wiring modules through static imports, TeqFW applications declare **explicit dependency contracts**, and the container performs **deterministic runtime linking**.

The result is an application architecture that is easier to:

- analyze
- generate
- refactor
- extend

— both for **human developers and AI agents**.

## The Shift in Software Development

Large language models are becoming a permanent part of the development process.

However, most software architectures were designed for **human-written code**, not for **code generated and maintained by AI agents**.

Typical JavaScript applications rely on:

- static imports
- implicit dependency graphs
- tight coupling to file structure
- constructor-based dependency inference

These patterns work well for humans but are difficult for automated agents to reason about reliably.

**TeqFW proposes a different architecture.**

Modules declare **explicit dependency contracts**, and a runtime container resolves those contracts deterministically.

This transforms the dependency graph into something that can be **analyzed, generated and modified programmatically.**

## What This Library Provides

`@teqfw/di` implements the runtime container that enables this architecture.

It provides:

- deterministic runtime linking of ES modules
- explicit dependency contracts (**CDC — Canonical Dependency Codes**)
- module dependency descriptors (`__deps__`)
- namespace-based module resolution
- runtime lifecycle management
- wrapper-based behavioral extensions

The container acts as a **runtime linker for JavaScript applications**.

## Designed for Development with LLM Agents

When software is generated or maintained by LLM agents, several structural problems appear.

| Problem          | Traditional Architecture | TeqFW Approach     |
| ---------------- | ------------------------ | ------------------ |
| Dependencies     | implicit imports         | explicit contracts |
| Dependency graph | implicit                 | deterministic      |
| Refactoring      | fragile                  | stable             |
| Testing          | manual wiring            | container driven   |
| AI compatibility | accidental               | intentional        |

TeqFW structures the application so that **LLM agents can reliably understand and modify the system.**

## Agent-Driven Implementation

Starting from version **2.0.0**, the source code of this library is **written primarily by Codex agents**.

The development workflow follows **specification-driven development**:

1. The human architect defines **product specifications**
2. LLM agents generate the implementation
3. The generated code is reviewed and integrated

This workflow follows the **ADSM methodology (Agent-Driven Software Management)** developed by **Alex Gusev**.

Earlier versions of the library (<2.0.0) were written manually.
The current version demonstrates how software can be developed using **human-defined architecture and AI-generated code**.

## Learn the Architecture (Interactive Onboarding)

Understanding this architecture can take time.

To make onboarding easier, an **interactive AI assistant** [is available](https://fly.wiredgeese.com/flancer/gpt/teqfw/guide/di/).

The assistant can explain:

- how the container works
- what Canonical Dependency Codes are
- how modules declare dependencies
- how runtime linking works
- how to integrate the library in real applications

The assistant acts as **interactive documentation** for the project.

Custom onboarding assistants like this can also be created **as a service** for other projects and libraries.

## Agent Interface (Documentation for LLM Agents)

This package includes **agent interface documentation** intended for LLM agents that use the library as an npm dependency.

These documents are distributed inside the package in:

```txt
./ai/
```

The files in this directory describe the **public interface of the package in an agent-friendly form**.

They explain:

- the container API
- dependency descriptors (`__deps__`)
- Canonical Dependency Codes (CDC)
- dependency resolution behavior
- integration patterns

Human developers typically read the README and source code, while **LLM agents can rely on the documentation in `./ai/`.**

## Tequila Framework Philosophy

`@teqfw/di` is the core building block of the **Tequila Framework (TeqFW)** ecosystem.

TeqFW is based on several architectural principles:

- runtime late binding between components
- namespace-based module organization
- modular monolith architecture
- pure JavaScript without compilation
- system structures optimized for collaboration with LLM agents

Full philosophy:

`PHILOSOPHY.md`

## Installation

```bash
npm install @teqfw/di
```

## Quick Example

### Define modules

`src/App/Child.mjs`

```javascript
export default function App_Child() {
  return { name: "child" };
}
```

`src/App/Root.mjs`

```javascript
export const __deps__ = {
  child: "App_Child$",
};

export default function App_Root({ child }) {
  return {
    name: "root",
    child,
  };
}
```

### Configure container

```javascript
import path from "node:path";
import { fileURLToPath } from "node:url";
import Container from "@teqfw/di";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const container = new Container();

container.addNamespaceRoot("App_", path.resolve(__dirname, "./src/App"), ".mjs");

const root = await container.get("App_Root$");

console.log(root.name);
console.log(root.child.name);
```

The container:

- loads modules
- resolves dependency contracts
- constructs the object graph
- returns **frozen linked objects**

## Dependency Contracts (`__deps__`)

Modules declare dependencies using a static export.

```javascript
export const __deps__ = {
  localName: "Dependency_CDC",
};
```

Rules:

- if `__deps__` is absent — module has no dependencies
- keys correspond to constructor argument names
- values are CDC dependency identifiers
- dependencies are resolved recursively

## Canonical Dependency Codes (CDC)

CDC identifiers describe **how dependencies should be resolved**.

General form:

```txt
[PlatformPrefix]ModuleName[__ExportName][LifecycleAndWrappers]
```

Examples:

```txt
App_Service
App_Service$
App_Service__build$$
App_Service$$_wrapLog_wrapTrace
node:fs
npm:@humanfs/core
node:worker_threads
npm:lodash
```

Where:

- `node:` platform prefix for Node.js built-in modules
- `npm:` platform prefix for npm packages
- `$` singleton lifecycle
- `$$` new instance lifecycle
- wrappers modify runtime behavior

## Public API

```javascript
const container = new Container();
```

Configuration methods (before first `get`):

- `setParser(parser)`
- `addNamespaceRoot(prefix, target, defaultExt)`
- `addPreprocess(fn)`
- `addPostprocess(fn)`
- `enableLogging()`
- `enableTestMode()`
- `register(cdc, mock)`

Dependency resolution:

```javascript
await container.get(cdc);
```

Behavior:

- deterministic linking
- fail-fast resolution pipeline
- immutable returned objects
- container enters failed state on fatal errors

## Wrappers

Wrappers allow cross-cutting behavior to be applied declaratively.

Example CDC:

```txt
App_Service$$_log_trace
```

Wrappers can implement:

- logging
- metrics
- tracing
- security checks
- behavioral instrumentation

This acts as a lightweight **DI-level AOP mechanism.**

Platform-specific examples:

```txt
node:worker_threads
npm:@humanfs/core
```

## Test Mode

```javascript
container.enableTestMode();

container.register("App_Service$", mockService);
```

Mocks are resolved before module instantiation.

## Browser Usage

```html
<script type="module">
  import Container from "https://cdn.jsdelivr.net/npm/@teqfw/di@2/+esm";

  const container = new Container();
</script>
```

## Documentation

Detailed documentation lives in `ctx/`:

- `ctx/docs/product/overview.md`
- `ctx/docs/product/default-cdc-profile.md`
- `ctx/docs/architecture/cdc-profile/default/grammar.md`
- `ctx/docs/architecture/cdc-profile/default/transformation.md`
- `ctx/docs/architecture/cdc-profile/default/validation.md`
- `ctx/docs/code/components/container.md`

## Author

**Alex Gusev**

Creator of:

- **Tequila Framework (TeqFW)**
- **ADSM (Agent-Driven Software Management)**

The project explores how software architecture evolves when **LLM agents become active participants in the development process**.
