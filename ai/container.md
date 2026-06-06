# container.md

Version: 20260606

## Role

The container is the runtime composition root of the package. It interprets CDC identifiers, resolves them into modules, produces linked values, and returns frozen results.

Application modules do not resolve dependencies themselves. They declare dependency contracts and rely on the container to perform linking.

## Configuration Stage

Before the first `get()`, the container is in builder stage.

During this stage external code may:

- register namespace roots with `addNamespaceRoot()`;
- replace the CDC parser with `setParser()`;
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

For each `get(cdc)` request the container applies this pipeline:

1. `Parse` — convert the CDC string into a DepId DTO.
2. `Preprocess hooks` — transform the DepId DTO through ordered `addPreprocess()` hooks.
3. `Resolve` — map the identifier to a concrete module location.
4. `Instantiate` — load the module and either return the selected export as-is or instantiate it according to lifecycle composition rules.
5. `Postprocess hooks` — apply ordered `addPostprocess()` value transforms.
6. `Wrapper exports` — apply ordered wrapper exports selected by CDC suffixes.
7. `Lifecycle` — apply singleton caching or transient behavior.
8. `Freeze` — freeze the resolved value before returning it.

The pipeline is deterministic for a fixed configuration and input CDC.

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
