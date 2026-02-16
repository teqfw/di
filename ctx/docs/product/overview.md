# Object Container for ES6-Module-Based Applications

Path: `./ctx/docs/product/overview.md`

## Purpose

`@teqfw/di` is an object container for building applications based on ES modules. The container implements deterministic runtime linking and disciplined late binding of dependencies as an alternative to structural coupling introduced by static imports. It is designed to operate identically in browser and Node.js environments without altering the development model.

The container enforces architectural discipline through explicit dependency declaration and controlled object composition.

## Dependency Declaration Model

Dependencies in applications using the container are declared explicitly as External Dependency Declarations (EDD).

An EDD is a string-level public contract of an application and must conform to the ASCII ECMAScript `IdentifierName` grammar. Dependency resolution is based on EDD values and does not rely on static imports.

Each runtime instance uses a configured parser that transforms EDD into an internal canonical representation. The parser defines the encoding scheme of dependency declarations for a given application.

The product distribution provides a default EDD profile and a corresponding default parser. This profile defines the standard dependency encoding scheme and is expected to be used by the majority of applications. Applications may replace the default parser to adopt alternative encoding schemes while preserving the same core linking architecture.

Compatibility between applications at the level of dependency declarations is defined by shared parser profile.

## Problem Domain

Modern JavaScript applications often rely on static imports, which increase coupling, fix dependency graphs at authoring time, complicate architectural evolution, and reinforce differences between frontend and backend execution models. Static linking embeds structural decisions directly into source files and limits controlled substitution of implementations.

`@teqfw/di` addresses this through declarative dependency identifiers, configurable parsing, and deterministic runtime object composition.

## Architectural Position

The container is based on the following principles:

- exclusive reliance on ES modules;
- no direct support for CommonJS or alternative module systems;
- integration of non-ESM code through explicit adapters and wrappers;
- no transpilation assumptions: native JavaScript is a design choice;
- identical execution semantics in browser and Node.js environments;
- immutability of created objects;
- deterministic resolution given identical configuration and dependency declarations.

These principles define both scope and limits of the system.

## Value

The primary value of the container is architectural discipline. It provides controlled dependency management, explicit linking semantics, deterministic behavior, predictability and manageability, testability and isolation, immutability-based safety, and transparent resolution mechanics.

## Positioning

`@teqfw/di` is a standalone infrastructure product focused on object linking and dependency resolution. It can be used independently or as a foundation for higher-level architectural styles without embedding domain semantics.

The container defines a stable core linking architecture while allowing versioned evolution of dependency declaration formats through configurable parsers.

## Responsibility Boundary

The responsibility of the container is limited to object creation and dependency resolution through deterministic runtime linking and disciplined late binding.

Application lifecycle phases, execution policies, domain behavior, and cross-application compatibility of custom dependency formats are outside this boundary.
