# Scope and Responsibility

Path: `./ctx/docs/product/scope.md`

## Application Domain

The product is an LLM-first method of structuring JavaScript applications on the ES module execution model. The library `@teqfw/di` is the reference implementation of this method. Its scope is limited to deterministic runtime linking of explicitly declared dependencies within that model.

The method does not define or depend on domain semantics.

## Core Responsibility

The product defines the contract surface and the runtime guarantees required for compliant applications. The reference implementation enforces these guarantees at runtime under the Default CDC Profile shipped with the product:

- interpret Canonical Dependency Contracts (CDC) according to the Default CDC Profile;
- transform CDC into structural canonical representations (`DepId`);
- perform deterministic runtime linking of dependencies requested by declared metadata;
- compose module exports according to declared composition semantics;
- enforce lifecycle and immutability guarantees;
- preserve a single isomorphic execution model across browser and Node.js environments.

Immutable linking semantics are defined over structural canonical dependency representations (`DepId`), not raw CDC string equality.

## Configuration-Level Responsibility

Configuration defines:

- namespace and module mapping rules;
- debug and testing modes;
- permitted extension components.

Configuration must not modify immutable linking semantics, lifecycle semantics, or object immutability enforcement.

## CDC Profile Boundary

The product ships and normatively defines one CDC interpretation: the Default CDC Profile.

All architectural guarantees, identity semantics, determinism claims, and compatibility definitions of the product apply exclusively under the Default CDC Profile.

Alternative CDC profiles are outside the product’s guaranteed behavior and responsibility boundary.

## Supported Concerns Within Scope

Within its responsibility boundary, the reference implementation may:

- detect and prevent cyclic dependencies;
- provide diagnostic information;
- maintain internal operational state required to preserve determinism under declared contracts;
- support controlled extension points that do not alter immutable linking semantics.

## Out of Scope

The product does not manage:

- application lifecycle orchestration;
- domain logic or business rules;
- execution policies or scheduling;
- security policies beyond immutability guarantees;
- runtime platform behavior;
- public graph construction APIs, analysis-only modes, or full-application dependency preflight scans;
- cross-application compatibility of custom dependency encoding schemes.

Reflection-based dependency inference is outside the product model and must not be introduced as an alternative declaration mechanism.

## Extensibility Boundary

The reference implementation may expose extension mechanisms, but extensions must not:

- change immutable linking semantics under declared contracts;
- alter structural canonical `DepId` identity semantics;
- introduce non-deterministic behavior;
- introduce reflection-based inference as a dependency declaration mechanism.

## Evolution Boundary

The method and its guarantees remain stable across product evolution. The Default CDC Profile evolves only under the compatibility and stability policy defined at product level.

Introduction of additional normative CDC profiles within the same product package constitutes architectural evolution and is outside the current product model.

Higher-level systems may be built on top of the reference implementation. The reference implementation remains limited to deterministic runtime dependency linking and disciplined object composition.

## Declaration Boundary

Within the product boundary, runtime linking operates exclusively on explicit structural declarations.

Dependency requests are expressed as CDC values, and dependency requirements of module exports are expressed through module-level dependency descriptors. Descriptor omission results in zero dependencies.

Static `import` statements must not be used as an application-level dependency mechanism. No implicit inference, reflection-based reconstruction, or signature-driven dependency extraction is permitted within the product boundary.
