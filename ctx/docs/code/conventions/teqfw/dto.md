# DTO Creation Rules (TeqFW)

Path: `./ctx/docs/code/conventions/teqfw/dto.md`

## Purpose

This document defines the engineering invariants for implementing DTO modules in TeqFW. It specifies structural form, factory contract, immutability strategy, DI boundary, and testing obligations. This document regulates implementation rules only and does not redefine architectural semantics.

## Definition

A DTO in TeqFW is a structural runtime object representing state only. It defines structural shape and contains no behavior. It does not guarantee semantic correctness and is created exclusively by its factory.

A DTO is not a Domain Entity, Value Object, ORM model, Domain model, Validation object, or behavior container.

## Module Structure

Each DTO module MUST export exactly two elements:

```js
export default class Factory {}
export class DTO {}
```

The `default` export is the factory.
The named `DTO` export is the structural class.

The `DTO` class MUST NOT participate in DI.
Only the factory participates in DI.
DTO factories MUST be registered as singletons (`Ns_Dto_Component$`).
Instance lifecycle (`$$`) MUST NOT be used for DTO factories.

No additional exports are permitted.

## Factory Contract

DTO instances:

- MUST be created only by their factory.
- MUST be returned even if input is `undefined`.
- MUST always have a complete structural shape.

The factory:

- accepts an arbitrary JavaScript object or `undefined`,
- MUST NOT throw,
- MUST NOT signal failure,
- MUST always return a structurally valid DTO.

The factory performs structural normalization only.

## Structural Normalization

Factory responsibilities include:

- creating expected primitive fields,
- creating expected arrays (empty if absent),
- creating nested DTOs via their own factories,
- applying structural coercion if explicitly defined,
- assigning `undefined` when coercion is not applied.

The factory MUST NOT:

- validate business rules,
- enforce domain invariants,
- perform semantic validation,
- implement business logic,
- mutate nested DTOs created by other factories.

Normalization is strictly structural.

## Composition Rules

If a DTO contains nested DTOs:

- the parent factory MUST invoke the nested factory,
- each factory operates strictly at its own structural level,
- hierarchical structural normalization is mandatory.

Factories MUST NOT bypass nested factories.

## Immutability Rules

DTO instances MAY operate in mutable or immutable mode.

In immutable mode:

- the factory MUST apply shallow `Object.freeze()` to the DTO,
- nested structures created at the same structural level belong to the factory’s freeze responsibility,
- structural isolation is the responsibility of the factory.

The DTO:

- MUST NOT track mutations,
- MUST NOT enforce invariants after creation.

Mutation responsibility lies outside the DTO.

## Structural Class Rules

The `DTO` class:

- MUST NOT define methods,
- MUST NOT contain logic,
- MUST NOT depend on services,
- MUST NOT perform validation,
- MUST NOT contain behavior,
- MUST NOT implement serialization,
- MUST NOT define equality or cloning logic.

The class serves as a structural declaration only.

## Dependency Injection Boundary

Only factories may declare dependencies.

The structural DTO class MUST NOT participate in DI.

Container configuration and lifecycle management are outside DTO scope.

## Testing Requirements

Tests MUST verify factory behavior:

- complete structural shape,
- correct creation modes,
- correct nested factory invocation,
- safe degradation of invalid input.

The `DTO` class MUST NOT be tested independently of the factory.

## Core Principle

TeqFW enforces strict separation:

- DTO = structure and state.
- Handlers = logic without state.

DTO is structurally deterministic and semantically neutral.
