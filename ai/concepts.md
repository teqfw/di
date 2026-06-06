# concepts.md

Version: 20260606

## Late Binding

Dependencies are resolved at runtime rather than through direct static imports between application modules. This keeps modules independent of concrete implementations and moves dependency binding into the container.

## Runtime Linker

The container acts as a runtime linker for ES modules. It interprets CDC identifiers, resolves modules, selects exports, and produces linked values for callers.

## Dependency Contracts

Dependencies are declared through CDC strings and module-level `__deps__` descriptors. Together they form the contract between module code and runtime composition.

The canonical `__deps__` form is hierarchical and keyed by export name.

## Namespace Mapping

Logical module identifiers are translated into module-specifier bases through namespace roots. This keeps dependency addressing independent from concrete filesystem paths or URL locations.

## Immutable Linked Values

Values returned by the container are frozen after linking. Consumers should treat them as stable resolved values rather than mutable construction targets.
