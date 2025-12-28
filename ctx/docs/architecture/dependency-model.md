# Dependency Model

Path: `ctx/docs/architecture/dependency-model.md`

## 1. Scope and Authority

This document is a **normative architectural specification** of the dependency resolution model in `@teqfw/di`, defined for the ECMAScript (ES6+) modular runtime environment.
It establishes a **mandatory context** that takes precedence over examples, tests, and implementation details.

All documentation and source code related to the container and using it **must be interpreted strictly within this model** and must not contradict it.

## 2. Model Intent

The model defines:

- what is considered a dependency,
- how a dependency is interpreted by the container,
- where the **hard boundaries of allowed extensibility** are within a standard ES6 module execution environment.

The model describes the **architectural form of dependency injection** only.
It does **not** describe container implementation details, runtime behavior optimizations, or performance characteristics.

## 3. Model Boundaries

The model exclusively covers **dependency resolution and object composition within the container**.

The model explicitly does **not** describe:

- application business logic,
- project structure,
- user scenarios or UX,
- testing and operational execution modes, except where explicitly stated.

The model is defined **only** for runtime environments using the standard ECMAScript (ES6+) module system with `import` / `export` semantics.

The model does **not** apply to environments without ES6 modules and does not extend to alternative loading, linking, or module resolution mechanisms.

## 4. Canonical Concepts

### 4.1 Dependency

A dependency is an **architectural relationship between components**, declared declaratively and resolved by the container.

### 4.2 Dependency Identifier

A dependency identifier is a **textual representation of a dependency**.
It is the **primary architectural artifact** of the model and the **only input** to the resolution mechanism.

### 4.3 Resolution

Dependency resolution is the act of obtaining an object or value by the container **solely based on a dependency identifier and the formal rules of the model**.

### 4.4 Interpretation

Interpretation is the application of formal rules to a dependency identifier **without domain knowledge analysis and without interpreting source code as executable logic**.

Extracting dependency identifiers from a constructor or factory signature is considered **contract declaration**, not code execution or semantic analysis.

### 4.5 Binding

Binding is the association of a dependency identifier with an implementation source, defined within the ES6 module environment.

### 4.6 Lifecycle

A lifecycle is a rule defining the **quantity and lifetime** of created objects.

### 4.7 Composition

Composition is the process by which the container creates a resulting object, taking into account dependency identifiers and their lifecycles.

### 4.8 Wrappers

Wrappers are declaratively specified layers applied by the container during post-processing of composition results.
They add additional functional behavior **without modifying the original dependency implementation**.

## 5. Static Import Constraints

Within this model, the following constraints apply to ES6 static imports:

- static imports are **forbidden** in component code that uses container-based dependency injection;
- static imports are allowed **only**:

  - inside the container library itself (for infrastructure assembly),
  - in the application composition root that initializes the container;

- all other ES6 modules in the application **must receive dependencies exclusively through the container** and must not use static imports for injected components;
- the container uses dynamic `import()` for loading and instantiating requested dependencies.

## 6. Model Invariants

The following invariants are fixed and non-negotiable within the model:

- the container **interprets dependency identifiers**, but does not analyze source code as executable programs;
- the dependency identifier is the **primary architectural artifact**;
- dependencies are declared declaratively and resolved by the container **only during the composition phase**;
- runtime dependency resolution is allowed **exclusively inside the container** and only as part of composition;
- created objects have **no access to the container** and cannot initiate dependency resolution;
- service-locator semantics are **explicitly excluded by definition**.

## 7. Extensibility Axes

The model allows extensibility **only** along the following axes:

- binding rules between identifiers and implementation sources;
- pre-resolution modification of dependency identifiers;
- post-processing of composition results, including wrapper application;
- namespace and path resolution strategies.

Any form of extensibility outside these axes is prohibited.

## 8. Conceptual Resolution Model

Dependency resolution is defined as a **unidirectional conceptual pipeline**:

- the input is a dependency identifier,
- each phase transforms data without feedback,
- the output is a ready-to-use object or value.

Cycles, rollbacks, or dynamic restructuring of the process are **not supported by the model**.

## 9. Language Constraint

The model assumes a **single canonical language** for dependency identifiers.

This language is intended for use within an ES6 module environment and is **not an extension point**.

Support for multiple DSLs, alternative identifier formats, or syntax negotiation is explicitly excluded.

## 10. Test Mode Exception

For testing purposes, the container may be switched into a **test mode**, in which explicit registration of objects corresponding to dependency identifiers is permitted.

In production mode, such registration is forbidden, and all dependencies are resolved and instantiated by the container **exclusively based on declarative identifiers**.

## 11. Explicit Non-Goals

The model intentionally does **not** address the following concerns:

- support for multiple identifier languages;
- dependency graph analysis;
- automatic linkage optimization;
- runtime dependency discovery by objects;
- adaptation of the model to libraries or runtimes that do not use the standard ES6 module system.

## 12. Agent Usage Notes

Any conclusions, suggestions, or modifications produced by automated agents concerning container code or components are considered valid **only if they comply with this model**.

An agent must interpret code and related documentation within the context of this document and must not propose solutions that contradict the constraints defined here.

In case of discrepancies between implementation, examples, and this model, **the model takes precedence**.

## 13. Related Normative Documents

- `dependency-language.md`
- `types-map.md`
- `product/overview.md`
