# Container

Create a JSON-safe configuration in the host Composition Root, then construct a
Container and call `get()` exactly once for the application root.

```js
import Container from "@teqfw/di";

const container = new Container({
  namespaces: [{prefix: "App_", target: "https://example.test/app", defaultExt: ".mjs"}],
  preprocessors: ["App_Policy_Preprocessor$"],
  postprocessors: ["App_Policy_Postprocessor$"],
});

const app = await container.get("App$");
```

The first `get()` claims the public root, materializes policy producers under
default policy, then resolves that root. A preparation or resolution failure
leaves the Container failed. Configuration never reopens and every later `get()`
rejects as invalid second-root usage.

## Configuration DTO

`namespaces` contains `{prefix, target, defaultExt}` mappings. `preprocessors`,
`postprocessors`, and optional `hardener` contain producer Dependency
Identifiers. `logging` and `introspection` are booleans. The DTO contains data,
not callbacks, so it can be JSON-serialized; a target path or URL must still be
loadable in the receiving runtime. Test-only `mocks` are explicit configuration
entries for composition tests.

## Structured introspection

Set `introspection: true`, then call `getIntrospection()` after the root settles.
It returns `null` when no introspection snapshot exists, otherwise
an immutable object with:

- `graph` — Dependency Graph nodes and edges for the one root graph;
- `trace` — ordered Resolution Trace events;
- `explanation` — Resolution Explanation, including requested and effective
  decisions, result or failure, and Container state.

This structured API is different from `enableLogging()`. Console messages and
private graph objects are diagnostics, not a public substitute for introspection.
