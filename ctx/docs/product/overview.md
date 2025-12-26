# Product Overview: @teqfw/di

Path: `ctx/docs/product/overview.md`

## Product Purpose

`@teqfw/di` is an infrastructure library for building modular JavaScript applications in which system composition, component binding, and implementation substitution are defined **declaratively through text**, rather than through implicit mechanisms, code analysis, or compile-time reflection.

The product is intended for projects that require structural predictability, architectural transparency, and reproducible results over long-term code evolution.

## Core Idea

At the core of the product lies the principle that a **dependency identifier is the primary carrier of architectural meaning**.  
Component binding is performed not through types, decorators, or compile-time conventions, but through the interpretation of textual identifiers with a formalized semantics.

The container acts as an interpreter of this semantics and mechanically applies the fixed binding rules, without analyzing the problem domain or making architectural decisions.

## Dependency Declaration Model

In `@teqfw/di`, dependencies are **declared structurally in the constructor (or factory) signature**, not registered, requested, or described separately.

A component declares its dependencies by using a **single object parameter** whose property names are **dependency identifiers**.  
When creating an object, the container analyzes the constructor (or factory) signature, extracts the object destructuring pattern, and resolves each declared identifier recursively before invoking the constructor.

The created object has no access to the container and cannot request dependencies at runtime.  
This model enforces explicit constructor-level dependency declaration and **excludes service-locator semantics by design**.

## Role in Projects

`@teqfw/di` serves as a **composition core**, providing:

- a unified and reproducible mechanism for module binding;
- explicit control over dependency boundaries;
- the ability to substitute implementations without modifying consuming code;
- alignment between architectural decisions and project documentation.

The product does not impose an application architecture and does not define application structure. Instead, it provides a stable mechanism within which such decisions can be explicitly fixed and evolve consistently.

## Application Scope

The product is oriented toward:

- browser and Node.js applications using ES modules;
- libraries and services with a long lifecycle;
- systems where documentation is treated as the source of truth;
- projects that involve collaboration between humans and automated agents without loss of architectural control.

`@teqfw/di` can be used both as part of the TeqFW platform and as a standalone library, provided its core invariants are respected.

## Product Boundaries

`@teqfw/di` deliberately **does not** address the following concerns:

- it does not analyze source code or automatically build dependency graphs;
- it does not rely on type information, decorators, or compile-time metadata;
- it does not manage the application lifecycle beyond composition;
- it does not contain business logic or application-level components;
- it does not attempt to optimize or “simplify” architectural decisions through implicit behavior.

All architectural meanings and binding rules must be expressed explicitly.

## Stable Product Properties

The product exhibits the following stable properties derived from its architectural principles:

- **Text-centricity** — architecture is expressed through textual identifiers with formalized semantics.
- **Declarativity** — container behavior is determined by fixed rules rather than procedures.
- **Predictability** — identical identifier contexts produce identical binding results.
- **Semantic extensibility** — identifier interpretation logic can be extended without modifying the core.
- **Absence of magic** — the container performs no hidden actions and makes no decisions on behalf of the developer.
- **Result immutability** — created objects are not expected to be structurally modified by the container after creation.

## Positioning

`@teqfw/di` is not a universal DI framework and not a development automation tool.  
It is an engineering mechanism for cases where architectural discipline, explicit decisions, and documentation consistency are more important than reducing code volume or providing out-of-the-box convenience.

The product is aimed at developers who treat architecture as part of the product and are prepared to fix it explicitly.
