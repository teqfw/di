# extensions.md

Version: 20260307

## Purpose

The container supports controlled extension of the dependency resolution process through **preprocess handlers** and **postprocess wrappers**. These mechanisms allow the behavior of dependency resolution and object creation to be adjusted without modifying container internals.

Extensions are registered during container configuration and become part of the deterministic resolution pipeline.

## Extension Points

Two extension points are available:

- **Preprocess handlers** — transform dependency identifiers before resolution.
- **Postprocess wrappers** — modify or decorate created objects after instantiation.

These extension points correspond to the preprocess and postprocess stages of the container pipeline described in **container.md**.

## Preprocess Handlers

Preprocess handlers receive a dependency identifier before it is interpreted by the container. A handler may transform the identifier and return a modified value that continues through the resolution pipeline.

Typical uses of preprocess handlers include:

- rewriting dependency identifiers
- applying identifier aliases
- enforcing project-specific identifier conventions

Preprocess handlers operate only on identifiers and do not interact with instantiated objects.

## Postprocess Wrappers

Postprocess wrappers operate on objects created by the container. A wrapper receives the instantiated object and may return a modified or decorated version.

Wrappers are typically used for:

- logging or tracing
- instrumentation
- capability injection
- runtime adaptation of object behavior

Wrappers do not modify the dependency resolution logic itself and operate only after object instantiation.

## Wrapper Selection

Wrappers are applied when their identifiers appear in a CDC. Wrapper identifiers are appended after the lifecycle marker and separated by underscores.

Example:

```txt
App_Service_User$$_wrapLog_wrapTrace
```

In this example the container creates a new instance of the dependency and applies the wrappers `wrapLog` and `wrapTrace` during the postprocess stage.

Wrappers do not change the structure of `__deps__`. Dependency descriptors remain either hierarchical export-scoped descriptors, shorthand flat descriptors for limited single-export cases, or omitted entirely for empty-descriptor modules.

## Execution Order

Multiple wrappers may be applied to a single dependency. Wrappers are executed in the order in which they appear in the CDC.

Each wrapper receives the object returned by the previous wrapper and may return a new object that becomes the input to the next wrapper.

## Extension Constraints

Extensions must satisfy the following constraints:

- they must be registered before the container becomes active
- they must be deterministic and free of side effects that alter container state
- they must not bypass lifecycle semantics enforced by the container

These constraints ensure that extensions do not compromise deterministic dependency resolution.
