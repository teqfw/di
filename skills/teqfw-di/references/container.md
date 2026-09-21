# Container

Create a Container in the host Composition Root. Configure it fully, then call
`get()` exactly once for the application root.

```js
import Container from "@teqfw/di";

const container = new Container();
container.addNamespaceRoot("App_", "https://example.test/app", ".mjs");

const app = await container.get("App$");
```

The first `get()` transitions the Container out of its configurable state before
identifier processing or loading can fail. A successful request leaves it
resolved; a resolution failure leaves it failed. In either case, configuration
does not reopen and every later `get()` rejects as invalid second-root usage.
Use another configured Container for another root or after a failure.

## Configuration API

Call these only before the root `get()`:

- `addNamespaceRoot(prefix, target, defaultExt)` — adds a Teq Namespace Mapping.
- `addPreprocess(fn)` — adds ordered requested-to-effective identifier policy.
- `addPostprocess(fn)` — adds ordered final-value adaptation policy.
- `setHardener(fn)` — replaces the default final-value hardening policy.
- `enableLogging()` — enables optional console diagnostics.
- `enableIntrospection()` — enables structured observation of the one root.
- `enableTestMode()` and `register(identifier, mock)` — enable explicit test
  substitutions.

`register()` is unavailable unless test mode is enabled. Test substitutions are
for composition tests, not production implementation selection. Prefer direct
construction for an ordinary unit test.

## Structured introspection

Enable introspection before `get()`, then call `getIntrospection()` after the
root settles. It returns `null` when no introspection snapshot exists, otherwise
an immutable object with:

- `graph` — Dependency Graph nodes and edges for the one root graph;
- `trace` — ordered Resolution Trace events;
- `explanation` — Resolution Explanation, including requested and effective
  decisions, result or failure, and Container state.

This structured API is different from `enableLogging()`. Console messages and
private graph objects are diagnostics, not a public substitute for introspection.
