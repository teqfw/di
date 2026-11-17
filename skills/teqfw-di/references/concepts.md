# Package Model

`@teqfw/di` resolves native ESM dependencies deterministically. An Application
Module declares a Dependency Identifier in `__deps__`; the host Composition Root
configures policy; the Container resolves the graph; the JavaScript runtime
loads ES modules through native `import()`.

```text
Application Module → __deps__ → Dependency Identifier
Composition Root → configured Container → FIFO public and Provider entries
Container → entry Dependency Graphs + shared Singleton cache → entry values
```

Teq-compatible runtime modules have no static ES imports. They express runtime
dependencies through `__deps__`. Composition Root/bootstrap code and tests are
the exceptions because they establish or test composition.

## Ownership and boundaries

- The Application Module owns dependency intent and local dependency names.
- The Composition Root owns Namespace Mappings, substitutions, and configured
  processing policy before the first entry request.
- One Container owns a stable composition policy and Container-scoped Singleton
  cache across its entry resolutions, with one FIFO queue and one active graph.
- The JavaScript runtime owns native ESM loading and its ESM cache.

An ESM cache hit is not Container Singleton reuse. Direct and Transient remain
different even when the runtime returns the same module namespace.

Namespace Mapping locates only Teq addresses. Node and npm addresses use their
own loading routes. A Node.js `NamespaceRegistry` can prepare package-declared
mappings during composition; `PackageRegistry` reads static package metadata in
Node.js-only infrastructure. Neither registry is part of the Container graph or
may be imported by browser-reachable code.

## Suitable use

Use this package for ESM applications that need explicit dependency contracts,
host-selected implementations, and observable runtime composition. Do not use
it to hide ordinary local imports, infer interfaces, or retrieve unrelated
objects on demand from one Container. Multiple entries are for explicit staged
or lazy composition, not ad-hoc retrieval.

A deferred `__deps__` declaration injects a frozen Provider without resolving
its target. Each `resolve()` creates a separate queued entry with the same
policy and cache. An entry awaiting its own later queued request can deadlock.
The ordinary delivered object or function is shallow-frozen after adaptation
and Promise/thenable settlement; optional custom policy cannot disable Hardener.
