# container.md

Version: 20260728

## Role

The container is the Runtime Linker and composition root of the package. It parses Dependency Specifiers, extracts Module Tokens, derives Module Specifiers through the configured registry, loads ES modules, and returns Resolved Values.

Application modules do not resolve dependencies themselves. They declare dependency contracts and rely on the container to perform linking.

## Configuration Stage

Before the first `get()`, the container is in builder stage.

During this stage external code may:

- register namespace roots with `addNamespaceRoot()`;
- add preprocess hooks with `addPreprocess()`;
- add postprocess hooks with `addPostprocess()`;
- enable diagnostics with `enableLogging()`;
- enable test-only mock registration with `enableTestMode()` and `register()`.

On the first `get()`:

- configuration is locked;
- namespace rules are snapshotted;
- internal resolution infrastructure is created.

After the first `get()`, builder-stage methods are no longer supported.

## Resolution Pipeline

For each `get(specifier)` request the container applies this pipeline:

1. `Parse` — convert the Dependency Specifier string into a DepId DTO.
2. `Preprocess hooks` — transform the DepId DTO through ordered `addPreprocess()` hooks.
3. `Resolve` — map the identifier to a concrete module location.
4. `Instantiate` — load the module and either return the selected export as-is or instantiate it according to lifecycle composition rules.
5. `Postprocess hooks` — apply ordered `addPostprocess()` value transforms.
6. `Wrapper exports` — apply ordered wrapper exports selected by dependency specifier suffixes.
7. `Lifecycle` — apply singleton caching or transient behavior.
8. `Freeze` — freeze the resolved value before returning it.

The pipeline is deterministic for a fixed configuration and input Dependency Specifier. Preprocess and postprocess callbacks are synchronous and run in registration order; their return values are used immediately.

## State Model

The container operates in three states:

- `builder` — configuration is still mutable.
- `operational` — dependency resolution is active.
- `failed` — a fatal pipeline error has occurred.

State transitions:

- construction starts in `builder`;
- the first successful or failed `get()` transitions the container out of mutable builder configuration;
- a fatal resolution error moves the container to `failed`.

## Freeze Semantics

Values returned by the container are frozen before they are returned to callers.

Freeze happens after:

- instantiation;
- postprocess hooks;
- wrapper exports;
- lifecycle application.

This means consumers receive stable linked values and should not mutate them.

## Failure Semantics

If any fatal error occurs during parsing, preprocessing, resolution, instantiation, postprocessing, wrapping, or lifecycle handling, the container enters `failed` state.

Once in `failed` state:

- the current `get()` request rejects;
- all subsequent `get()` calls reject;
- the container does not attempt partial recovery.

This fail-fast behavior prevents partially linked systems from continuing execution.

## Package Graph Boundary

PackageRegistry and NamespaceRegistry are Node.js-only utilities outside Container builder state. NamespaceRegistry prepares namespace roots in the composition root before the first Container.get(). PackageRegistry may be used after Container startup by a Node.js-only runtime component that only reads static package metadata; it neither configures Container nor resolves, loads, or interprets providers. Browser-reachable runtime modules must not import either registry.

The Rollup browser distribution build rejects any reachable `src/Node/` module.
