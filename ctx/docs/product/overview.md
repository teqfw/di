# Object Container for ES6-Module-Based Applications

Path: `./ctx/docs/product/overview.md`

## Purpose

`@teqfw/di` is an object container for building applications based on ES6 modules. The container implements disciplined late binding of dependencies as an alternative to rigid coupling introduced by static imports. It is designed to operate identically in browser and Node.js environments without changing the development model.

The container is an instrument of architectural discipline.

## Problem Domain

Modern JavaScript applications often rely on static imports, which increase coupling, fix dependency graphs at authoring time, complicate architectural evolution, and reinforce differences between frontend and backend execution models. Static linking embeds structural decisions directly into source files and limits controlled substitution of implementations.

`@teqfw/di` addresses this through declarative dependencies and controlled object composition.

## Architectural Position

The container is based on the following principles:

- exclusive reliance on ES6 modules;
- no direct support for CommonJS or alternative module systems;
- integration of non-ESM code through explicit adapters and wrappers;
- no transpilation assumptions: native JavaScript is a design choice;
- identical execution semantics in browser and Node.js environments;
- immutability of created objects.

These principles define both scope and limits of the system.

## Value

The primary value of the container is architectural discipline. It provides controlled dependency management, explicit linking semantics, predictability and manageability, testability and isolation, immutability-based safety, and transparent behavior.

## Positioning

`@teqfw/di` is a standalone infrastructure product focused on object linking and dependency resolution. It can be used independently or as a foundation for higher-level architectural styles without embedding domain semantics.

## Responsibility Boundary

The responsibility of the container is limited to object creation and dependency resolution through disciplined late binding. Application lifecycle phases, execution policies, and domain behavior are outside this boundary.
