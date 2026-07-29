# usage.md

Version: 20260729

## Purpose

This document shows canonical usage patterns for the container. Examples are intentionally short and prioritize supported, recommended forms over convenience shorthand.

## Contents

- [Canonical Module Descriptor](#canonical-module-descriptor)
- [Canonical Container Setup](#canonical-container-setup)
- [Lifecycle Composition](#lifecycle-composition)
- [Test Mode And Mocks](#test-mode-and-mocks)
- [Browser Entry Point](#browser-entry-point)
- [Package-Backed Composition](#package-backed-composition)
- [Package Namespace Metadata](#package-namespace-metadata)

## Canonical Module Descriptor

The preferred module exposes one Principal Application Value through `default export`. The `__deps__` export is declarative metadata listing the values required to link it. The canonical declaration form is hierarchical and keyed by export name.

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
- each export entry maps constructor dependency names to dependency specifiers;
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

Named exports are a JavaScript ecosystem compatibility surface. They use the `__ExportName` segment in the Dependency Specifier and the same hierarchical `__deps__` structure.

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

Without a lifecycle marker, the export is resolved as-is — the class or function itself, not an instance:

```js
const FactoryClass = await container.get("App_Module__Factory");
const factory = new FactoryClass({cast: resolvedCast});
```

## Lifecycle Composition

Common lifecycle-based compositions:

```txt
App_Service$
App_Task$$
App_Task$$$
```

- `$` creates and reuses a singleton instance;
- `$$` creates a new instance for each request;
- `$$$` uses direct factory composition: it produces a value for the request without lifecycle caching.

## Wrappers

Wrapper exports are selected by dependency specifier suffixes and are applied after postprocess hooks.

```txt
App_Service$$_wrapLog_wrapTrace
```

This pattern is useful when runtime behavior should be decorated without changing the service module contract.

## Platform Modules

Dependency Specifier may refer to platform modules directly.

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

## Package-Backed Composition

In Node.js, a composition root may import `PackageRegistry` from `@teqfw/di/node/registry/package`, import `NamespaceRegistry` from `@teqfw/di/node/registry/namespace`, use the latter for namespace roots, and independently inspect each immutable package record for application-owned metadata. Package discovery reads only static manifests and transitive dependencies; it does not resolve container values or interpret providers. These imports are forbidden in browser runtime modules. All `src/**` package subpaths are unsupported except the deprecated `@teqfw/di/src/Config/NamespaceRegistry.mjs` compatibility import; new code must use `@teqfw/di/node/registry/namespace` instead.

## Test Mode And Mocks

Enable test mode and register mocks before the first `get()`. A registered mock is selected by canonical Dependency Specifier identity, bypasses resolution and instantiation, and is frozen before it is returned.

```js
const container = new Container();
container.enableTestMode();
container.register("App_Service$", mockService);

const service = await container.get("App_Service$");
```

Do not use test mode as an application-time substitution mechanism: configuration is locked by the first `get()`.

## Browser Entry Point

The container and URL-backed namespace roots can be used in browser ESM code. Node.js registry utilities are excluded from browser runtime code.

```html
<script type="module">
  import Container from "https://cdn.jsdelivr.net/npm/@teqfw/di@2/+esm";

  const container = new Container();
  container.addNamespaceRoot("App_", "https://cdn.example.com/app", ".mjs");
</script>
```

## Package Namespace Metadata

A package declares namespace mappings in `package.json` using `teqfw.fw.di.namespaces`; the declaration is always an array, including one mapping.

```json
{
  "teqfw": {
    "fw": {
      "di": {
        "namespaces": [
          {"prefix": "App_", "path": "./src", "ext": ".mjs"}
        ]
      }
    }
  }
}
```

Each `path` is a non-empty relative path from its publishing package, must resolve to an existing directory inside that package, and must use an ESM-compatible extension. Canonical metadata takes precedence over the legacy `teqfw.namespaces` array; they are never merged. Build registries and add their roots during composition, before the first `container.get()`.
