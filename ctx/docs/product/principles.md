# Architectural Principles

Path: `./ctx/docs/product/principles.md`

## Declarative Dependency Model

The container requires explicit declarative dependencies. Relationships between modules must remain reconstructible from source code, with no hidden coupling.

## Isomorphic Linking Model

The container preserves one dependency resolution model across browser and Node.js environments. Isomorphism is a principle of architectural integrity, not a convenience feature.

## Immutability

Objects created by the container are immutable. Immutability enhances security and reduces unintended mutation in heterogeneous execution environments.

## Native ES6 Transparency

The container operates on native ES6 modules without transpilation or compile-time metadata generation. Architectural reasoning is based on authored code and executed code as the same artifact.

## Deterministic Resolution

Given the same identifier and environment, dependency resolution must return the same result. Linking behavior must not depend on implicit state, evaluation order, or hidden registries.

## Minimal Core Model

The core remains structurally minimal and focused on disciplined dependency linking to preserve conceptual clarity and stability.
