# Usage Patterns

## Runtime module declaration

Use the hierarchical export-scoped `__deps__` form for new runtime modules. The
module has no static ES imports for its runtime dependencies.

```js
export const __deps__ = {
  default: {
    clock: "App_Time_Clock$",
  },
};

export default function App_Feature({clock}) {
  return {
    now() {
      return clock.now();
    },
  };
}
```

The key under `default` is the producer parameter name. A named producer uses
its named export as the outer key. A flat declaration is supported only for a
default-export-only module; omit `__deps__` when there are no dependencies.

## One root in a Node.js Composition Root

```js
import path from "node:path";
import {fileURLToPath} from "node:url";
import Container from "@teqfw/di";

const hostDir = path.dirname(fileURLToPath(import.meta.url));
const container = new Container();

container.addNamespaceRoot("App_", path.join(hostDir, "src/App"), ".mjs");

const app = await container.get("App$");
await app.start();
```

There is no second lookup from this Container. The `App$` producer's declared
children resolve recursively through `__deps__` in its one graph.

## Package-backed namespace composition

Use Node.js registries only in a Node.js Composition Root. Register every
derived mapping before the root request.

```js
import fs from "node:fs/promises";
import path from "node:path";
import Container from "@teqfw/di";
import NamespaceRegistry from "@teqfw/di/node/registry/namespace";

const appRoot = "/absolute/path/to/application";
const container = new Container();
const mappings = await new NamespaceRegistry({fs, path, appRoot}).build();

for (const {prefix, dirAbs, ext} of mappings) {
  container.addNamespaceRoot(prefix, dirAbs, ext);
}

const app = await container.get("App$");
```

A package publishes mappings in the canonical array at
`package.json#teqfw.fw.di.namespaces`. The legacy `teqfw.namespaces` fallback is
active only when canonical metadata is absent. `appRoot` is the absolute
application root containing its `package.json`. Browser-reachable modules must
not import either registry.

## Browser-compatible ESM

The same runtime declaration can use a URL-backed Teq Namespace Mapping:

```js
import Container from "https://cdn.jsdelivr.net/npm/@teqfw/di@2/+esm";

const container = new Container();
container.addNamespaceRoot("App_", "https://cdn.example.com/app", ".mjs");

const app = await container.get("App$");
```

This does not make Node addresses browser-compatible. Do not pull Node registry
utilities into browser code.

## Test substitution

Use explicit test mode only when testing Container composition:

```js
const container = new Container();
container.enableTestMode();
container.register("App_Data_Repository$", mockRepository);
container.addNamespaceRoot("App_", fixtureRoot, ".mjs");

const app = await container.get("App$");
```

Register substitutions and configure mappings before `get()`. The returned mock
still passes through the applicable output boundary.
