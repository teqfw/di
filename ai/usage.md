# usage.md

Version: 20260307

## Purpose

This document describes typical usage patterns of the container. The examples illustrate how modules declare dependencies, how the container is configured in the composition root, and how Canonical Dependency Codes (CDC) control dependency resolution, instantiation, and behavioral modification.

The container performs deterministic runtime linking of ES modules and returns frozen object graphs constructed from explicitly declared dependency contracts.

## Module Structure

Modules intended for container linking may expose a default export, a named export, or both. The static dependency descriptor `__deps__` describes the dependencies of the export selected by the CDC.

Dependencies are injected into the constructor as a single structured object. In TeqFW-style modules the public API is defined inside the constructor through assignments to `this`, while internal state may be held in constructor-local variables captured by closures.

Example module:

```js
// @ts-check

export const __deps__ = {
  cast: "Fl32_Web_Helper_Cast$",
};

/**
 * Runtime wrapper that can hold non-DI behavior.
 */

export default class RuntimeWrapper {
  constructor() {
    return proxy;
  }
}

/**
 * @typedef {Object} App_Factory$Deps
 * @property {object} cast
 */

export class Factory {
  /**
   * @param {App_Factory$Deps} deps
   */
  constructor({ cast }) {
    this.configure = function (params = {}) {
      return {
        mode: "factory",
        cast,
        params,
      };
    };
  }
}
```

Dependency module:

```js
// @ts-check

export default class App_Child {
  constructor() {
    this.getName = function () {
      return "child";
    };
  }
}
```

Rules:

- if `__deps__` is absent the module has no dependencies
- keys correspond to constructor dependency names in the export they describe
- values are CDC identifiers
- dependencies are resolved recursively before instantiation

When the CDC selects `App_Module$`, the container uses the default export. When the CDC selects `App_Module__Factory$`, the container uses the named `Factory` export. In the first case the default export can act as a runtime wrapper or module shell; in the second case the named export is the DI-managed component that receives `__deps__`.

## Container Configuration

The container is configured in the composition root of the application. Namespace roots define how CDC prefixes map to module locations.

```js
import path from "node:path";
import { fileURLToPath } from "node:url";
import Container from "@teqfw/di";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const container = new Container();

container.addNamespaceRoot("App_", path.resolve(__dirname, "./src/App"), ".mjs");
```

Configuration must be completed before the first dependency resolution.

## Resolving Dependencies

Dependencies are obtained using CDC identifiers.

```js
const root = await container.get("App_Root$");
```

The container:

- parses the CDC
- loads the module
- resolves dependencies declared in `__deps__`
- instantiates modules
- links the dependency graph
- freezes the produced value

Example usage:

```js
console.log(root.getName());
console.log(root.getChild().getName());
console.log(Object.isFrozen(root));
```

## Typical CDC Usage Patterns

CDC identifiers define how the container interprets a dependency. The following patterns represent common usage scenarios.

### Module As-Is

A CDC without lifecycle marker returns the module export as-is.

```text
App_Service
```

Typical usage:

- utility modules
- stateless helpers
- constant providers

Example:

```js
const math = await container.get("App_Math");
```

### Singleton from Default Export

A lifecycle marker `$` creates a singleton instance.

```text
App_Service$
```

Typical usage:

- application services
- repositories
- infrastructure adapters

### Transient Instance

Marker `$$` creates a new instance for every request.

```text
App_Service$$
```

Typical usage:

- request objects
- short-lived workers
- task processors

### Named Export Resolution

CDC may reference a named export using the `__ExportName` segment.

```text
App_Module__build$
```

Typical usage:

- builders
- factory entry points
- specialized constructors

For modules with a runtime default export and a DI-managed named export, the descriptor follows the named export, for example:

```js
export const __deps__ = {
  cast: "Fl32_Web_Helper_Cast$",
};

export default class RuntimeWrapper {
  constructor() {
    return proxy;
  }
}

export class Factory {
  constructor({ cast }) {
    this.configure = function (params = {}) {
      return { cast, params };
    };
  }
}
```

### Wrapper Application

Wrappers modify the produced value through postprocess plugins.

```text
App_Service$$_log_trace
```

The container creates the dependency and applies wrappers in declared order.

Typical usage:

- logging
- tracing
- metrics collection
- behavioral instrumentation

### Platform Dependencies

CDC may reference runtime platform modules.

```text
node:fs
npm:@humanfs/core
node:worker_threads
npm:lodash
```

These identifiers provide access to Node.js built-ins and npm packages.

Typical usage:

- `node:worker_threads` for Node.js worker-thread primitives
- `npm:@humanfs/core` for a scoped npm package dependency

### Root Graph Resolution

Applications typically resolve a single root dependency.

```js
const root = await container.get("App_Root$");
```

The container recursively resolves all dependencies declared through `__deps__` and constructs the object graph.

## Wrapper-Based Behavioral Composition

Wrappers enable declarative behavioral composition at the dependency level. By attaching wrapper identifiers to CDC strings the caller can modify the runtime behavior of a dependency without modifying its module implementation.

Example:

```text
App_Service$$_log
```

The service module remains unaware of logging. The wrapper introduces cross-cutting behavior during the container postprocess stage.

This mechanism enables patterns similar to aspect-oriented programming while preserving deterministic dependency resolution.

## Minimal Smoke Pattern

A minimal integration scenario demonstrating container operation:

```js
const container = new Container();
container.addNamespaceRoot("Fx_", FIXTURE_DIR, ".mjs");

const value = await container.get("Fx_Root$");
```

The container loads modules, resolves dependencies, instantiates objects, and returns a frozen result.
