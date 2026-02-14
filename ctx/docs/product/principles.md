# Architectural Principles

Path: `./ctx/docs/product/principles.md`

## Declarative Dependency Model

The container enforces explicit declaration of dependencies. Implicit dependencies are not considered acceptable. All relationships between modules must be expressed declaratively and remain reconstructible from source code. Architectural discipline is achieved through prohibition of hidden coupling and through preference of explicit structure over implicit linkage.

## Isomorphic Linking Model

The container maintains a single model of dependency resolution across execution environments. Browser and Node.js contexts share identical linking semantics. Isomorphism is not a convenience feature but a principle of architectural integrity. The system must preserve a unified cognitive and structural model regardless of runtime environment.

## Immutability-First Composition

Objects created by the container are immutable. Immutability is treated as a security principle and as a protection against unintended mutation in heterogeneous web environments where code from different sources may coexist. Predictable behavior is reinforced through the absence of post-instantiation state mutation.

## Technological Transparency

The container operates on native ES6 modules without reliance on transpilation or compile-time metadata generation. This choice reflects a commitment to transparency: the executed code is identical to the authored code. Architectural reasoning must not depend on hidden transformation stages.

## Deterministic Resolution

Dependency resolution must be deterministic. Given the same identifier and environment, the container must produce the same result. Linking behavior must not depend on implicit state, order of evaluation, or hidden registries. Determinism is treated as a foundation of transparency and predictability.

## Minimal Core

The container is intentionally minimal. It provides a disciplined linking mechanism without evolving into a runtime platform. Higher-level runtimes and frameworks may be constructed on top of it, but the core remains structurally restrained in order to preserve clarity and conceptual stability.
