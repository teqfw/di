# AGENTS.md

Version: 20260307

## Package Purpose

This directory provides the **Agent Interface** of the package. It contains a compact usage-oriented description intended for LLM agents that use the package as a dependency. The documents describe how the package is applied by external code and exclude development methodology, repository organization, testing infrastructure, and other internal aspects of the project.

The package implements a **dependency container for ES modules** based on runtime late binding. Dependencies between modules are resolved by the container using structured dependency identifiers and deterministic namespace resolution rules rather than static imports. The container dynamically loads ES modules, instantiates exported factories, and returns linked objects according to dependency identifier semantics.

## When to Use This Package

This package should be used when a system requires the following capabilities:

- runtime dependency injection
- late binding between ES modules
- deterministic dependency resolution
- controlled instantiation of components
- modules that remain environment-agnostic across Node.js and browser runtimes

The container serves as the **composition root** of the application. Application modules declare dependencies and receive instantiated objects from the container rather than resolving dependencies directly.

## Architectural Model

The system is based on four mechanisms:

- **Late binding of dependencies at runtime**, allowing modules to remain independent of specific implementations.
- **A container responsible for dependency resolution and instantiation**, which loads modules and produces linked objects.
- **Structured dependency identifiers**, interpreted by the container to determine how a dependency must be resolved.
- **Namespace mapping rules**, which deterministically translate identifiers into module locations.

Together these mechanisms form a deterministic runtime linking system for ES modules.

## Runtime Linking Model

The container acts as a runtime linker for ES modules.

Instead of relying on static `import` statements, modules declare dependency contracts through `__deps__` descriptors and CDC identifiers. When a dependency is requested, the container resolves the identifier, loads the required module, constructs the object graph, and returns the linked result.

In this model:

- ES modules provide implementations.
- CDC identifiers define dependency contracts.
- the container performs deterministic runtime linking.

This mechanism separates module implementation from dependency binding and allows systems to assemble component graphs dynamically while preserving deterministic behavior.

## Reading Order

Agents should read the documents in this directory in the following order:

1. **AGENTS.md** — overview of the package and navigation of the Agent Interface.
2. **package-api.ts** — machine-readable contract of the supported programmatic API, public entrypoints, structural contracts, and internal exclusions.
3. **concepts.md** — architectural concepts and design principles.
4. **container.md** — container responsibilities and dependency resolution pipeline.
5. **dependency-id.md** — syntax and semantics of dependency identifiers.
6. **extensions.md** — extension mechanisms such as preprocessors and wrappers.
7. **usage.md** — minimal usage scenarios and examples.

This sequence reflects the intended agent workflow: contract surface first, then architectural model, operational mechanism, dependency addressing, extension points, and practical usage.

## Interface Scope

The documents in this directory define the supported usage semantics of the package. Behaviors not described here should be treated as undefined and should not be inferred. The interface intentionally contains only the information required to correctly apply the package in external code.

## Relation to TeqFW

The package follows architectural principles used in the **Tequila Framework (TeqFW)** platform, including:

- late binding between components
- separation of data structures and logic handlers
- namespace-based module organization
- development in modern JavaScript without compilation

Understanding the broader TeqFW ecosystem is not required to use the package, but the container follows the same architectural philosophy.
