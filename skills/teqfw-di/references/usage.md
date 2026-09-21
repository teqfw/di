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

## Staged entries in a Node.js Composition Root

```js
import path from "node:path";
import {fileURLToPath} from "node:url";
import Container from "@teqfw/di";

const hostDir = path.dirname(fileURLToPath(import.meta.url));
const container = new Container({
  namespaces: [{prefix: "App_", target: path.join(hostDir, "src/App"), defaultExt: ".mjs"}],
});

const app = await container.get("App$");
await app.start();
const command = await container.get("App_Command_Selected$");
await command.run();
```

The entries are deliberate phases, not arbitrary lookup. Each entry's declared
children resolve recursively through `__deps__` in its own graph; both entries
share the configured policy and Container-scoped Singleton values.

## Package-backed namespace composition

Use Node.js registries only in a Node.js Composition Root. Put every derived
mapping in the DTO before Container construction.

```js
import fs from "node:fs/promises";
import path from "node:path";
import Container from "@teqfw/di";
import NamespaceRegistry from "@teqfw/di/node/registry/namespace";

const appRoot = "/absolute/path/to/application";
const mappings = await new NamespaceRegistry({fs, path, appRoot}).build();
const container = new Container({
  namespaces: mappings.map(({prefix, dirAbs, ext}) => ({prefix, target: dirAbs, defaultExt: ext})),
});

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

const container = new Container({
  namespaces: [{prefix: "App_", target: "https://cdn.example.com/app", defaultExt: ".mjs"}],
});

const app = await container.get("App$");
```

This does not make Node addresses browser-compatible. Do not pull Node registry
utilities into browser code.

## Test substitution

Use separate test-only setup for Container composition tests:

```js
const container = new Container({
  namespaces: [{prefix: "App_", target: fixtureRoot, defaultExt: ".mjs"}],
});
container.enableTestMode();
container.register("App_Data_Repository$", mockRepository);

const app = await container.get("App$");
```

Enable test mode and register substitutions before the first `get()`. A value
may be any runtime JavaScript value; it is intentionally outside the JSON-safe
DTO. The first `get()` applies the complete configured and compatibility
preprocessing policy to each registered specifier, then lookup uses its
effective dependency identity. A canonicalization failure fails preparation;
the returned substitution otherwise still passes through the applicable output
boundary.
