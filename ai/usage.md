# usage.md

Version: 20260606

## Purpose

This document shows canonical usage patterns for the container. Examples are intentionally short and prioritize supported, recommended forms over convenience shorthand.

## Canonical Module Descriptor

The canonical form of `__deps__` is hierarchical and keyed by export name.

```js
// @ts-check

export const __deps__ = {
  default: {
    cast: "App_Helper_Cast$",
  },
};

export default class App_Root {
  /**
   * @param {{cast: (value: unknown) => string}} deps
   */
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

Dependency module:

```js
// @ts-check

export default function App_Helper_Cast() {
  return function cast(value) {
    return String(value);
  };
}
```

Rules:

- the hierarchical export-scoped form is canonical;
- each export entry maps constructor dependency names to CDC identifiers;
- if `__deps__` is omitted, the module has no declared dependencies;
- dependencies are resolved recursively before instantiation.

## Canonical Container Setup

The container is configured in the composition root before the first resolution.

```js
import path from "node:path";
import { fileURLToPath } from "node:url";
import Container from "@teqfw/di";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const container = new Container();
container.addNamespaceRoot("App_", path.resolve(__dirname, "./src/App"), ".mjs");
```

Namespace roots may also use URL-backed module-specifier bases:

```js
container.addNamespaceRoot("App_", "https://cdn.example.com/app", ".mjs");
```

## Resolve Root Dependency

Applications typically resolve one root dependency and let the container build the full object graph.

```js
const root = await container.get("App_Root$");
console.log(root.configure({name: 123}).name);
console.log(Object.isFrozen(root));
```

## Named Export

Named exports use the `__ExportName` segment in the CDC and the same hierarchical `__deps__` structure.

```js
export const __deps__ = {
  default: {
    cast: "App_Helper_Cast$",
  },
  Factory: {
    cast: "App_Helper_Cast$",
  },
};

export default class RuntimeWrapper {
  constructor() {
    return {mode: "runtime"};
  }
}

export class Factory {
  constructor({ cast }) {
    this.configure = function (params = {}) {
      return {
        mode: "factory",
        name: cast(params.name ?? "app"),
      };
    };
  }
}
```

Resolution examples:

```js
const runtime = await container.get("App_Module$");
const factory = await container.get("App_Module__Factory$");
```

## Singleton And Transient

Common lifecycle-based compositions:

```txt
App_Service$
App_Task$$
App_Task$$$
```

- `$` creates and reuses a singleton instance;
- `$$` creates a new instance for each request;
- `$$$` is a transient alias in the current implementation.

## Wrappers

Wrapper exports are selected by CDC suffixes and are applied after postprocess hooks.

```txt
App_Service$$_wrapLog_wrapTrace
```

This pattern is useful when runtime behavior should be decorated without changing the service module contract.

## Platform Modules

CDC may refer to platform modules directly.

```txt
node:fs
npm:@humanfs/core
node:worker_threads
```

These forms resolve the selected platform module export as-is unless a lifecycle marker is explicitly added.

## Non-Canonical Shorthand

A flat `__deps__` object is a supported shorthand for default-export-only modules, but it is not the canonical model.

```js
export const __deps__ = {
  cast: "App_Helper_Cast$",
};

export default class App_Short {
  constructor({ cast }) {
    this.cast = cast;
  }
}
```

Prefer the hierarchical form for new integrations and for any module that exposes named exports.

## Empty Descriptor

Modules with no declared dependencies omit `__deps__` entirely.

```js
export default class App_Empty {
  constructor() {
    this.ready = function () {
      return true;
    };
  }
}
```
