# Scope and Responsibility

Path: `./ctx/docs/product/scope.md`

## Application Domain

`@teqfw/di` is an object container for programs operating within the JavaScript ES module execution model. Its scope is limited to deterministic runtime linking of declared dependencies within that model.

The container does not define or depend on domain semantics.

## Core Responsibility

The container is responsible for:

- interpreting External Dependency Declarations (EDD) through a configured parser;
- transforming EDD into structural canonical representations (`DepId`);
- resolving dependencies deterministically;
- instantiating objects according to declared semantics;
- enforcing lifecycle and immutability guarantees;
- maintaining structural integrity of the linking process.

The immutable core linking pipeline operates exclusively on structural canonical dependency representations (`DepId`).

## Configuration-Level Responsibility

The container configuration defines:

- the parser used to interpret dependency declarations;
- namespace and module mapping rules;
- debug and testing modes;
- permitted extension components.

Parser selection determines the dependency encoding profile of an application. Applications using different parsers are not required to be compatible at the level of dependency declarations.

Configuration does not modify core linking semantics.

## Supported Concerns Within Scope

Within its responsibility boundary, the container may:

- detect and prevent cyclic dependencies;
- provide diagnostic information;
- maintain internal operational state required for deterministic resolution;
- support controlled extension points that do not alter immutable core semantics.

## Out of Scope

The container does not manage:

- application lifecycle orchestration;
- domain logic or business rules;
- execution policies or scheduling;
- security policies beyond immutability guarantees;
- runtime platform behavior;
- cross-application compatibility of custom dependency encoding schemes.

## Extensibility Boundary

The container allows configurable parsers and defined extension points. Extensions may participate in dependency preprocessing or object wrapping but must not:

- replace the resolver;
- reorder or restructure the core pipeline;
- alter structural canonical `DepId` identity semantics;
- introduce non-deterministic behavior.

## Evolution Boundary

The core linking architecture remains stable across parser variants and product evolution.

Higher-level systems may be built on top of the container. The container itself remains limited to deterministic runtime dependency linking and disciplined object composition.
