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
`get()` calls and deferred Provider `resolve()` calls join one FIFO queue using
that same policy and Singleton cache. Concurrent and re-entrant requests wait;
at most one entry graph executes at a time. Requests made during preparation
wait for it, which still occurs only once. Preparation failure leaves the
Container unusable and rejects waiting requests without completed entry
snapshots. A resolution failure ends only its own entry, retains its snapshot
when introspection is enabled, and lets the next request execute.

## Deferred entries

Only `__deps__` accepts one leading `~`, yielding a frozen Provider with only
`resolve(): Promise<T>`. Creation validates the underlying identifier without
preprocessing, loading the target, or traversing its children. Each call queues
a new entry with empty ancestry and one ordinary root preprocessing pass. It
shares policy, test substitutions, lifestyle handling, wrappers, postprocessors,
settlement, mandatory Hardener, and the Singleton cache with eager entries.
The Provider retains no result cache and exposes no Container. Deferred timing
does not change Singleton identity; Transient is fresh per successful call.

Queueing is allowed from synchronous policy hooks, but those hooks remain
synchronous. It is an application error for active resolution to await a
Provider `resolve()` or later `get()` queued in the same Container. The active
entry and queued request remain pending and block later requests. Invoke the
Provider after the entry settles. The Container does not detect this error or
throw; there is no automatic timeout or recovery promise.

## Configuration DTO

`namespaces` contains `{prefix, target, defaultExt}` mappings. `preprocessors`,
`postprocessors`, and optional `hardener` contain producer Dependency
Identifiers. `logging` and `introspection` are booleans. The DTO contains data,
not callbacks, so it can be JSON-serialized; a target path or URL must still be
loadable in the receiving runtime. It does not contain runtime test-substitution
values.

This DTO is the only composition-policy surface. Mappings, ordered policy
producers, logging and introspection are captured at construction.

## Test substitutions

For a composition test, enable test mode and register each arbitrary runtime
value before the first `get()`:

```js
const container = new Container({
  namespaces: [{prefix: "App_", target: fixtureRoot, defaultExt: ".mjs"}],
});
container.enableTestMode();
container.register("App_Data_Repository$", mockRepository);
```

`register()` requires test mode and retains the requested specifier until the
first `get()`. After configured Preprocessors are installed,
the Container applies that complete policy and indexes the substitution by
effective dependency identity. Test substitutions are not part of the JSON-safe
DTO, do not materialize configured policy producers, and remain subject to
Postprocessors, Wrappers, Hardener, and applicable Singleton handling. A
canonicalization failure fails preparation before any entry starts. The first
`get()` locks test setup as well.

## Structured introspection

Set `introspection: true`, then call `getIntrospection()` after an entry settles.
It returns `null` when no introspection snapshot exists, otherwise
an immutable object with:

- `entries` — completed entry snapshots with explicit `entryId` and root
  provenance;
- `graph`, `trace`, and `explanation` — views of the latest
  entry, with the same projections available on every entry snapshot.

This structured API is different from optional console logging. Introspection is
enabled only by the configuration DTO; there is no mutable
`enableIntrospection()` path. Console messages and
private graph objects are diagnostics, not a public substitute for introspection.
A preparation failure happens before an entry starts, so it leaves no completed
entry snapshot; an entry-resolution failure is retained with its provenance.
Each executed Provider request has its own entry snapshot. Provider creation
is observed in its originating entry without a resolved target node or a
fabricated cross-entry graph edge.
