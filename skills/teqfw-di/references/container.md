# Container

Create a JSON-safe configuration in the host Composition Root, then construct a
Container. The first `get()` prepares policy and starts an entry resolution.

```js
import Container from "@teqfw/di";

const container = new Container({
  namespaces: [{prefix: "App_", target: "https://example.test/app", defaultExt: ".mjs"}],
  preprocessors: ["App_Policy_Preprocessor$"],
  postprocessors: ["App_Policy_Postprocessor$"],
});

const app = await container.get("App$");
```

The first `get()` locks configuration, materializes policy producers under
default policy once, then enters Running and resolves its entry root. Later
sequential `get()` calls resolve additional entry roots using that same policy
and Singleton cache. Concurrent and re-entrant calls reject. Preparation
failure leaves the Container unusable; a resolution failure ends only its entry
and leaves a Running Container available for a later entry.

## Configuration DTO

`namespaces` contains `{prefix, target, defaultExt}` mappings. `preprocessors`,
`postprocessors`, and optional `hardener` contain producer Dependency
Identifiers. `logging` and `introspection` are booleans. The DTO contains data,
not callbacks, so it can be JSON-serialized; a target path or URL must still be
loadable in the receiving runtime. Test-only `mocks` are explicit configuration
entries for composition tests.

## Structured introspection

Set `introspection: true`, then call `getIntrospection()` after an entry settles.
It returns `null` when no introspection snapshot exists, otherwise
an immutable object with:

- `entries` — completed entry snapshots with explicit `entryId` and root
  provenance;
- `graph`, `trace`, and `explanation` — compatibility views of the latest
  entry, with the same projections available on every entry snapshot.

This structured API is different from `enableLogging()`. Introspection is
enabled only by the configuration DTO; there is no mutable
`enableIntrospection()` path. Console messages and
private graph objects are diagnostics, not a public substitute for introspection.
