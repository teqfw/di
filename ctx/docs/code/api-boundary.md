# Public API Boundary

Path: `ctx/docs/code/api-boundary.md`

## 1. Scope and authority

This document defines the **public API boundary** of the `@teqfw/di` package at the code level: what is considered public surface and what is internal implementation. It is subordinate to the architectural dependency model and must not contradict it.

The public type surface is determined by the rules of `types.d.ts` visibility for `tsserver`.

## 2. Public API definition

A module belongs to the **public API** if it is intended to be used by external projects as a stable integration surface of the container.

A type belongs to the **public API** if it is published into consuming projects through `types.d.ts` in `declare global { ... }`.

Everything else is **internal implementation**.

## 3. Public vs internal classification rules

### 3.1 Public code modules

The following sources are public by definition:

- `src/Api/**` — interface-only modules describing public contracts (not executable code).

### 3.2 DTO visibility rule

A DTO is public **only** if it appears in any public contract signature (parameters / return values) declared in `src/Api/**`.

If a DTO is used only inside the library implementation and does not cross the API boundary, it is internal.

### 3.3 Internal code modules

By default, all implementation modules are internal, including (but not limited to):

- container implementation and its subsystems (composer, parser, resolver, processors);
- built-in chunks, helpers, constants, and utilities;
- any module whose purpose is to implement contracts from `src/Api/**`.

Internal modules are not intended for direct import by consumers.

## 4. Extension surface constraints

The package provides extensibility only along the architectural extensibility axes (binding rules, pre-processing, post-processing, namespace/path resolution).

The dependency identifier language is canonical and is **not** an extension point. Any “alternative depId DSL” surface is outside the model and must not be represented as a public API capability.

## 5. Export policy

The package MUST export only public API modules (interfaces and explicitly approved public DTOs).

Internal modules MUST NOT be exported as package entry points.

## 6. `types.d.ts` policy

- Declarations inside `declare global { ... }` form the public type surface of the package.
- Non-global declarations exist only to make internal sources reachable by `tsserver` during package development and are not part of the public API.
- Every public API module and every public DTO MUST have a rule-compliant `import()` alias in the global section.

## 7. Current codebase classification target

Public API (target set):

- `src/Api/**`
- DTO modules that are referenced by `src/Api/**` contracts (example: a depId DTO referenced by parser / processors contracts).

Internal implementation (target set):

- all other `src/**` modules not classified as public by rules above.

This document defines the classification goal; moving files, reshaping exports, and rebuilding `types.d.ts` are implementation tasks executed separately.
