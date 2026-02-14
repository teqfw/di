# Object Container for ES6-Based Web Applications

Path: `./ctx/docs/product/overview.md`

## Purpose

`@teqfw/di` is an object container intended for building web applications on top of ES6 modules. The container implements disciplined late binding of dependencies as an alternative to rigid coupling introduced by static imports. It is designed to function identically in browser and Node.js environments without altering the development model.

The container is an instrument of architectural discipline.

## Problem Domain

Modern JavaScript applications commonly rely on static imports, which increase module coupling, fix dependency graphs at authoring time, complicate architectural evolution, and reinforce differences between frontend and backend execution models. Static linking embeds structural decisions directly into source files and limits controlled substitution of implementations.

`@teqfw/di` addresses this problem by introducing declarative dependency resolution and controlled object composition.

## Architectural Position

The container is based on the following deliberate principles:

- Exclusive reliance on ES6 modules.
- Absence of direct support for CommonJS or alternative module systems.
- Possibility of integrating non-ESM code through explicit adapters and wrappers.
- No transpilation assumptions; usage of native JavaScript is a philosophical design choice rather than a technical limitation.
- Identical execution semantics in browser and Node.js environments.
- Immutability of created objects.

These principles define both the scope and the limits of the system.

## Value

The primary value of the container is architectural discipline. It enables controlled dependency management, enforces explicit linking semantics, and supports predictable system behavior across execution environments. The container improves testability and isolation by decoupling modules from direct imports and enhances safety and determinism through immutability of instantiated objects. Its minimalism reduces hidden behavior and preserves transparency of architectural decisions.

## Positioning

`@teqfw/di` is a standalone infrastructure product. It is not a framework, not a runtime platform, and not a domain layer. It may be used independently or serve as a foundation for higher-level architectural styles. The container does not impose domain semantics and does not embed application logic.

## Responsibility Boundary

The responsibility of the container is limited to creation of objects and resolution of dependencies through disciplined late binding. It does not manage application lifecycle phases, execution policies, or domain behavior. Its responsibility ends at controlled object linking.
