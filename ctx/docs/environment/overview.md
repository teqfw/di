# Environment Overview

Path: `./ctx/docs/environment/overview.md`

## 1. Purpose

The Environment level defines the execution conditions under which the `@teqfw/di` container is considered valid and operational. It specifies assumptions about the runtime, module system, filesystem, and process model that are required but not implemented by the container itself. This document establishes the boundary between environmental guarantees and container responsibilities. It does not describe architectural structure, lifecycle logic, dependency composition, or linking algorithms.

## 2. Supported Runtime Environments

The container operates in environments that provide native ECMAScript Modules support.

Node.js with native ESM support is required.
Browser runtime with native ESM support is mandatory and officially supported.
Deno and Bun are allowed provided they implement standard ESM semantics compatible with the ECMAScript specification.

Transpilers, bundlers, alias resolvers, and module transformation tools are not supported as part of the normative execution model. Only the standard ESM loader of the runtime is assumed. Import maps are not part of the container model.

## 3. Execution Model Assumptions

The current reference implementation assumes a single-threaded execution context per container instance. Worker threads are not supported in the present implementation.

This is an implementation-level limitation and not an architectural constraint of the product model.

Multi-process environments are allowed. In such environments, the container remains strictly process-local. When used in cluster mode, each worker must instantiate its own container. Container state is not synchronized across processes.

Multiple independent containers within a single process are permitted.

Determinism guarantees apply per container instance for identical configuration and identical request dynamics and do not establish cross-container or cross-process consistency guarantees.

## 4. Module Loader Assumptions

Module resolution is fully delegated to the standard ESM loader of the runtime. The container does not modify or extend loader behavior.

Dynamic `import()` must conform to ECMAScript semantics. Within a single runtime, identical module specifiers must resolve to the same module namespace object. Module caching and module namespace identity are controlled exclusively by the runtime.

The runtime is the canonical source of module namespace identity. The container MUST NOT override, invalidate, or substitute the runtime module cache.

The resolver MAY maintain an internal cache as an optimization provided it does not change observable namespace identity or resolution semantics.

Errors originating from module loading, including syntax errors or missing modules, are considered environmental errors. The container does not reinterpret loader exceptions or alter their semantics.

## 5. Filesystem and Resolution Assumptions

The container does not impose assumptions about filesystem case sensitivity. Correctness of module resolution depends exclusively on the semantics of the underlying runtime loader and its filesystem abstraction.

Read-only filesystems are allowed. The physical file structure is assumed to remain stable during container execution.

Namespace-to-path mapping is defined by configuration and resolved through the runtime loader. The runtime’s native resolution algorithm is authoritative. The container does not validate file existence prior to import and does not implement fallback resolution strategies.

## 6. Determinism

Module resolution and namespace object identity are deterministic within a single runtime instance. Repeated resolution of the same specifier yields the same module namespace object.

Determinism of `import()` is assumed as a property of the runtime.

The container does not manipulate or invalidate the module cache.

## 7. Object Immutability Semantics

All instances created by the container are frozen using `Object.freeze`. Freeze is applied to container-managed instances and not to module namespace objects provided by the runtime.

The environment must implement standard ECMAScript semantics for `Object.freeze`.

The container does not protect against runtime mutation of imported module namespace objects.

## 8. Isolation Model

The container operates within a single execution context and does not coordinate state across processes or runtimes. Isolation is achieved by runtime boundaries and process separation. Cross-process state consistency is outside the container’s scope.

Global object mutability is not constrained by the container.

## 9. Test Mode Invariants

Test mode is a logical mode of the container and not a separate execution environment. It does not require module cache invalidation. Selection of a test runner is outside the scope of this document.

Test mode does not alter runtime linking semantics or environmental assumptions.

## 10. Debug Mode Invariants

Debug mode affects observability only and does not modify resolution, linking, or lifecycle algorithms. Runtime debugging facilities such as Node inspector are allowed. The semantic behavior of the container remains invariant under debug mode.

## 11. Runtime Evolution Considerations

Hot reload, module replacement mechanisms, or runtime-level module invalidation strategies are environmental concerns. The container does not define such mechanisms and does not depend on them.

If the runtime provides module replacement capabilities, they must not violate determinism, canonical identity semantics, or immutability guarantees defined at architecture and product levels.

## 12. Out of Scope

The document does not define:

- architectural linking semantics;
- dependency declaration rules;
- CDC profile interpretation;
- lifecycle algorithms;
- application orchestration;
- runtime platform security policies;
- HTTP delivery configuration or server infrastructure details.

The environment level defines execution assumptions only and does not modify product-level guarantees or architectural invariants.
