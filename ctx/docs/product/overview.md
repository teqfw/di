# Object Container for ES6-Module-Based Applications

Path: `./ctx/docs/product/overview.md`

## Purpose

`@teqfw/di` is an object container for applications operating within the JavaScript ES module execution model. The container implements deterministic runtime linking and disciplined late binding of dependencies as an alternative to structural coupling introduced by static imports. It operates uniformly in browser and Node.js environments without altering the development model.

The container enforces architectural discipline through explicit dependency declaration, controlled object composition, and immutable core linking semantics.

## Dependency Declaration Model

Dependencies are declared explicitly as External Dependency Declarations (EDD).

An EDD is a string-level public contract and must conform to `AsciiEddIdentifier` grammar as defined at the architecture level. Dependency resolution is performed exclusively through EDD values and does not rely on static imports.

Each runtime instance uses a configured parser that transforms EDD into a structural canonical representation (`DepId`). The parser may define deterministic syntactic sugar for dependency declarations, provided it does not introduce semantic aliasing.

Dependency identity is determined by structural `DepId`, not by raw EDD string equality.

The product distribution provides a default EDD profile and corresponding parser. The default profile is immutable within a library version. A breaking library change of the default profile is a semantic change in EDD interpretation that alters the resulting structural canonical `DepId`. Cosmetic or surface grammar expansions are not breaking changes when they preserve semantic interpretation, preserve resulting structural canonical `DepId`, and do not introduce semantic aliasing. Applications may replace the default parser to adopt alternative encoding schemes while preserving the same core linking architecture. Compatibility between applications at the dependency level is defined by a shared parser profile.

## Problem Domain

Modern JavaScript applications commonly embed dependency structure through static imports. This fixes dependency graphs at authoring time, increases structural coupling, constrains architectural evolution, and introduces divergence between frontend and backend execution models.

`@teqfw/di` replaces structural imports with declarative dependency identifiers, deterministic runtime resolution, and explicit object composition.

## Architectural Position

The container is defined by the following principles:

- linking semantics are based on the ES module execution model;
- static imports must not be used as an alternative dependency mechanism;
- non-ESM code may be integrated only through explicit ES module adapters;
- no reliance on transpilation or compile-time metadata generation;
- identical linking semantics in browser and Node.js environments;
- immutability of created objects;
- deterministic resolution under identical configuration and dependency declarations.

These principles define the architectural scope and limits of the system.

## Value

The primary value of the container is architectural discipline and controlled dependency management. It provides explicit linking semantics, deterministic behavior, predictability, testability, immutability-based safety, and transparent resolution mechanics.

## Positioning

`@teqfw/di` is a standalone infrastructure component focused exclusively on object linking and dependency resolution. It does not embed domain semantics and can serve as a foundation for higher-level architectural styles.

The product defines a stable immutable core linking architecture while allowing versioned evolution of dependency declaration formats through parser profiles.

## Responsibility Boundary

The responsibility of the container is limited to deterministic object creation and dependency resolution through runtime linking.

Application lifecycle orchestration, domain behavior, execution policies, concurrency control, and cross-application compatibility of custom dependency formats are outside this boundary.
