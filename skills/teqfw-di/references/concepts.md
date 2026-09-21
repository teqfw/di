# Package Model

`@teqfw/di` resolves native ESM dependencies deterministically. An Application
Module declares a Dependency Identifier in `__deps__`; the host Composition Root
configures policy; the Container resolves the graph; the JavaScript runtime
loads ES modules through native `import()`.

```text
Application Module → __deps__ → Dependency Identifier
Composition Root → configured Container → one root get()
Container → one Dependency Graph → resolved root value
```

Teq-compatible runtime modules have no static ES imports. They express runtime
dependencies through `__deps__`. Composition Root/bootstrap code and tests are
the exceptions because they establish or test composition.

## Ownership and boundaries

- The Application Module owns dependency intent and local dependency names.
- The Composition Root owns Namespace Mappings, substitutions, and configured
  processing policy before the first root request.
- One Container owns one root graph and its Container-scoped Singleton cache.
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
objects on demand from one Container.
