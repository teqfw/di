# concepts.md

Version: 20260727

## Core Model

```text
Module Token -> Module Registry -> ES Module -> Principal Application Value
```

A Module Token is logical identity. A Module Specifier is the physical location passed to `import()`. The ES Module is the loading unit. Its `default export` is the preferred Principal Application Value; `__deps__` is metadata describing the values required to link it.

## Late Binding

Dependencies are resolved at runtime rather than through direct static imports between application modules. This keeps modules independent of concrete implementations and moves dependency binding into the container.

## Runtime Linker

The container acts as a runtime linker for ES modules. It interprets dependency specifiers, resolves modules, selects exports, and produces linked values for callers.

## Dependency Specifiers And Declarations

Dependencies are declared through Dependency Specifier strings and module-level `__deps__` declarations. A specifier contains a Module Token plus optional export, lifecycle, and wrapper selectors.

The canonical `__deps__` form is hierarchical and keyed by export name.

## Namespace Mapping

Logical module identifiers are translated into module-specifier bases through namespace roots. This keeps dependency addressing independent from concrete filesystem paths or URL locations.

## Immutable Linked Values

Values returned by the container are frozen after linking. Consumers should treat them as stable resolved values rather than mutable construction targets.

## Cycle Boundary

Cycles in the dependency graph managed by the container are forbidden and fail linking. Circular imports internal to third-party ESM packages remain outside the package boundary and are handled by the native loader.

## Runtime Package Graph

PackageRegistry is a Node.js composition-stage helper. It returns immutable static metadata records for the application root and installed transitive runtime dependencies in deterministic breadth-first order. NamespaceRegistry consumes this graph to build namespace roots. Applications may separately interpret provider metadata, but DI does not provide a plugin registry or load modules during discovery.
