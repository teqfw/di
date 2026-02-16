# Environment Overview

Path: `./ctx/docs/environment/overview.md`

## 1. Purpose

The Environment level defines the execution conditions under which the `@teqfw/di` container is considered valid and operational. It specifies assumptions about the runtime, module system, filesystem, and process model that are required but not implemented by the container itself. This document establishes the boundary between environmental guarantees and container responsibilities. It does not describe architectural structure, lifecycle logic, dependency composition, or linking algorithms.

## 2. Supported Runtime Environments

The container operates in environments that provide native ECMAScript Modules support. Node.js with native ESM support is required. Browser runtime with native ESM support is mandatory and officially supported. Deno and Bun are allowed provided they implement standard ESM semantics compatible with the ECMAScript specification.

Transpilers, bundlers, alias resolvers, and module transformation tools are not supported. Only the standard ESM loader of the runtime is assumed. Import maps are not used.

## 3. Execution Model Assumptions

The execution model is single-threaded. Worker threads are not supported. The container assumes a single JavaScript runtime per logical execution context.

Multi-process environments are allowed. In such environments, the container remains strictly process-local. When used in cluster mode, each worker must instantiate its own container. Container state is not synchronized across processes.

The architecture assumes a single container per runtime for determinism guarantees.
Multiple containers within a single process are outside the guaranteed behavior domain and not covered by architectural invariants.

## 4. Module Loader Assumptions

Module resolution is fully delegated to the standard ESM loader of the runtime. The container does not modify or extend loader behavior.

Dynamic `import()` must conform to ECMAScript semantics. Within a single runtime, identical module specifiers must resolve to the same module namespace object. Module caching behavior is entirely controlled by the runtime and not by the container.

Errors originating from module loading, including syntax errors or missing modules, are considered environmental errors. The container does not intercept, normalize, or reinterpret loader exceptions.

## 5. Filesystem and Resolution Assumptions

The filesystem is assumed to be case-sensitive. Read-only filesystems are allowed. The physical file structure is assumed to remain immutable during container execution.

Namespace-to-path mapping is independent of symbolic links. The runtime’s native resolution algorithm is authoritative. The container does not validate file existence prior to import and does not implement fallback resolution strategies.

## 6. Determinism

Module resolution and namespace object identity are deterministic within a single runtime instance. Repeated resolution of the same specifier yields the same module namespace object. Determinism of `import()` is assumed as a property of the runtime.

The container does not manipulate or invalidate the module cache.

## 7. Object Immutability Semantics

All singleton instances created by the container are frozen using `Object.freeze`. Freeze is applied to container-managed instances and not to module namespace objects provided by the runtime.

The environment must implement standard ECMAScript semantics for `Object.freeze` without proxy-level interception or alteration.

The container does not protect against runtime mutation of imported module namespace objects.

## 8. Isolation Model

The container operates within a single execution context and does not coordinate state across processes or runtimes. Isolation is achieved by runtime boundaries and process separation. Cross-process state consistency is outside the container’s scope.

Global object mutability is not constrained by the container.

## 9. Test Mode Invariants

Test mode is a logical mode of the container and not a separate execution environment. It does not require module cache invalidation. Selection of a test runner is outside the scope of this document.

Test mode does not alter runtime linking semantics or environmental assumptions.

## 10. Debug Mode Invariants

Debug mode affects observability only and does not modify resolution, linking, or lifecycle algorithms. Runtime debugging facilities such as Node inspector are allowed. The semantic behavior of the container remains invariant under debug mode.

## 11. Out of Scope

Hot reload mechanisms are outside the scope of this document. Runtime module reloading is not supported. HTTP delivery configuration and server-level content handling are outside the scope of the container’s environmental assumptions.
