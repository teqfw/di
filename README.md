# @teqfw/di

`@teqfw/di` is a deterministic dependency-resolution Container for native
JavaScript ES modules. Runtime modules declare what they need with `__deps__`;
the host Composition Root chooses locations and implementation policy before
resolution starts.

It is useful when an ESM application needs explicit dependencies, late binding,
and an inspectable composition space. Small applications that do not need
runtime composition can use direct imports instead.

## Install

```sh
npm install @teqfw/di
```

Native ESM is the normative runtime model. The package also ships browser
compatibility bundles, but UMD is a distribution artifact rather than a second
DI model.

## Start an application composition

The host Composition Root discovers policy, creates a JSON-safe configuration
DTO, then constructs a Container before it resolves its first entry:

```js
import path from "node:path";
import {fileURLToPath} from "node:url";
import Container from "@teqfw/di";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const container = new Container({
  namespaces: [{prefix: "App_", target: path.join(rootDir, "src/App"), defaultExt: ".mjs"}],
  preprocessors: ["App_Composition_Preprocessor$"],
  postprocessors: ["App_Composition_Postprocessor$"],
});

const app = await container.get("App$");
await app.start();
```

`namespaces` prepares Namespace Mappings: each maps Teq addresses in a namespace
to a module-location root. A filesystem directory is only a Node.js example; a
browser host can configure a URL root. `preprocessors` and `postprocessors` are
ordered producer Dependency Identifiers, not JavaScript callbacks. Container
materializes them under default policy before it resolves the first entry.

The first `get()` locks configuration, materializes policy once, and enters the
Container's Running state. Later sequential `get()` calls create additional
entry resolutions in the same configured composition space. They share
Namespace Mappings, processors, hardening policy, and the Container-scoped
Singleton cache, so a common Singleton is produced once. This supports staged
composition such as bootstrap, plugins, and a lazily selected command.

The Container is still not an arbitrary service locator: public entries are
deliberate application phases, while ordinary dependencies remain declarations
in `__deps__`. Concurrent or re-entrant `get()` calls reject deterministically.
An entry-resolution failure does not destroy an already Running Container; a
policy-preparation failure does make it unusable.

## Declare runtime dependencies

Teq-compatible runtime modules have no static ES imports. They declare runtime
dependencies in source-attached `__deps__`; the Container resolves those child
dependencies recursively inside the entry Dependency Graph.

```js
// src/App/App.mjs
export const __deps__ = {
  default: {
    repository: "App_Data_Repository$",
  },
};

export default function App({repository}) {
  return {
    async start() {
      return repository.connect();
    },
  };
}
```

The hierarchical, export-scoped form shown above is canonical. A flat
`__deps__` object is supported only for a default-export-only module. Omit
`__deps__` when a producer has no dependencies. Composition Root/bootstrap code
and tests are the exceptions that may use static imports.

## Dependency Identifiers

A Dependency Identifier identifies a dependency target together with its
resolution semantics. It serves as a public entry root, an `__deps__` child
dependency, or a configured policy producer; those uses share one identifier
language. It has a Dependency Address and can add Export Selection, a
Dependency Lifestyle, and ordered Wrapper Selection.

| Address Kind | Example | Resolution route |
| --- | --- | --- |
| Teq | `App_Service` | Unprefixed. Namespace Mapping derives its module location. |
| Node | `node:fs` | Uses the Node-native module specifier. |
| npm | `npm:@scope/package` | Uses an environment-appropriate package specifier. |

Namespace Mapping applies only to Teq. `teq:` is not a supported serialized
prefix. Node addresses are Node.js-specific; npm addresses can use a supported
environment-specific route and are not Teq namespace lookups.

`__ExportName` selects a named export. With no selected export and no Lifestyle
Marker, Direct exposes the whole module namespace. A Lifestyle Marker selects
the default export when no explicit export is named.

```text
App_Service__format                 named export, Direct
App_Service$                        default export, Singleton
App_Service__create$$               named export, Transient
App_Service__format$$$_wrapTrace    named export, explicit Direct with a Wrapper
```

The Lifestyle Marker selects how the export becomes the dependency value:

| Lifestyle | Marker | Meaning |
| --- | --- | --- |
| Direct | none, or `$$$` explicitly | Exposes the selected export as-is. It does not call a function or construct a class. |
| Singleton | `$` | Uses the selected export as a producer and reuses one final managed value in this Container. |
| Transient | `$$` | Uses the selected export as a producer and creates a fresh value for each applicable resolution. |

Direct is not Transient. Native ESM caching belongs to the JavaScript runtime;
it does not provide Container Singleton behavior. Wrappers are selected by the
identifier and can adapt even a Direct value. `$$$` keeps Direct explicit when
Wrapper Selection requires a Lifestyle Marker.

## Composition policy

The host Composition Root owns discovery of Namespace Mappings and ordered
policy. It transfers that policy as a JSON-safe DTO; Container resolves every
policy producer under default policy before installing any of them and before the
first entry begins. A producer must synchronously
return the callable required by its role. A substitution can replace an
abstraction identifier with a concrete one without changing the consuming
module. Preprocessors, Postprocessors, and Wrappers are distinct mechanisms.

For Node.js package-backed composition, use the public utilities before the
first entry request:

```js
import PackageRegistry from "@teqfw/di/node/registry/package";
import NamespaceRegistry from "@teqfw/di/node/registry/namespace";
```

`NamespaceRegistry` builds namespace roots from package metadata for a Node.js
Composition Root. `PackageRegistry` reads the static runtime package graph in
Node.js-only infrastructure. Neither belongs in browser-reachable modules.
`@teqfw/di/src/Config/NamespaceRegistry.mjs` remains only as the deprecated
COMPAT-001 migration import; new code must use the canonical namespace path.

## Inspect entry resolutions

Structured introspection is separate from optional console logging. Declare it
in configuration and read its immutable snapshot afterward:

```js
const container = new Container({
  namespaces: [{prefix: "App_", target: "https://cdn.example.com/app", defaultExt: ".mjs"}],
  introspection: true,
});

const app = await container.get("App$");
const inspection = container.getIntrospection();
```

`inspection` retains immutable snapshots in `entries`, one for each completed
entry. Each entry contains three projections:

- Dependency Graph — actual Container-managed relationships.
- Resolution Trace — ordered resolution events.
- Resolution Explanation — the policy and causal decisions behind results or a
  failure.

Logging is diagnostic console output; it is not structured introspection or a
public graph API. An entry failure is retained with its entry provenance and
the Container remains Running; only preparation failure makes it unusable.

## Guidance for coding agents

The npm package includes the version-matched `teqfw-di` Agent Skill at
`skills/teqfw-di/`. A host may mount it explicitly in its own skill catalog:

```sh
mkdir -p .agents/skills
ln -s ../../node_modules/@teqfw/di/skills/teqfw-di .agents/skills/teqfw-di
```

The design uses established dependency and composition ideas. Its explicit
declarations and deterministic behavior are also a good fit for coding agents;
they do not replace the host project's architecture or instructions.
