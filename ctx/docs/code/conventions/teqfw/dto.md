# DTO Creation Rules (TeqFW)

Path: `./ctx/docs/code/conventions/teqfw/dto.md`
Version: `20260219`

## Purpose

This document defines engineering invariants for implementing DTO modules in TeqFW. It specifies structural form, namespace discipline, factory contract, immutability model, DI boundary, and testing obligations. Architectural semantics are defined at higher ADSM levels and are not restated here.

---

## 1. Definition

A TeqFW DTO is a structural runtime object representing state only.

A DTO:

- defines structural shape only
- contains no behavior
- guarantees no semantic correctness
- is created exclusively by its factory

Architectural separation:

```
DTO = structure + state
Handlers = logic without state
```

DTO is structurally deterministic and semantically neutral.

---

## 2. Module Structure

Each DTO module MUST export exactly two elements:

```js
export default class Ns_Pkg_Dto_Config {}
export class DTO {}
```

Rules:

- `default` export — factory class
- named `DTO` export — structural class
- no additional exports are permitted

The structural `DTO` class:

- MUST NOT participate in DI
- MUST NOT declare dependencies
- MUST NOT contain behavior

DTO factories:

- MUST be registered as singleton (`Ns_Pkg_Dto_Config$`)
- MUST NOT use per-resolution lifecycle (`$$`)

---

## 3. Namespace Discipline

The ES module namespace MUST match the factory class name.

Example:

```js
export default class Ns_Pkg_Dto_Config {}
```

Then:

- `Ns_Pkg_Dto_Config` — factory class
- `Ns_Pkg_Dto_Config$` — singleton factory resolved via DI
- `Ns_Pkg_Dto_Config$DTO` — structural instance type

Injection occurs strictly via the factory namespace identifier.
Structural class is never injected.

---

## 4. Factory Contract

Every DTO factory MUST expose exactly one public method:

```ts
create(data?: unknown, options?: TeqDtoCreateOptions): TDto;
```

Where:

```ts
export interface TeqDtoCreateOptions {
  mode?: "cutting" | "relaxed";
  immutable?: boolean;
}
```

Factory invariants:

- MUST always return a DTO
- MUST NOT throw
- MUST NOT signal failure
- MUST NOT expose additional public APIs
- MUST NOT extend the factory interface

DTO instances:

- MUST be created only by their factory
- MUST always have a complete structural shape
- MUST be returned even if input is `undefined`

---

## 5. Structural Normalization

Factory performs structural normalization only.

It MUST:

- create expected primitive fields
- create expected arrays (empty if absent)
- create nested DTOs via their factories
- apply structural coercion only if explicitly defined
- assign `undefined` when coercion is not applied

It MUST NOT:

- validate business rules
- enforce domain invariants
- implement business logic
- perform semantic validation
- bypass nested DTO factories
- mutate nested DTOs created by other factories

Normalization is strictly structural.

---

## 6. Nested DTO Composition

If a DTO contains nested DTOs:

- parent factory MUST invoke nested factory
- each factory operates strictly within its structural boundary
- hierarchical normalization is mandatory

Factories MUST NOT mutate DTOs created by other factories.

---

## 7. Immutability Model

DTO instances MAY operate in mutable or immutable mode.

In immutable mode:

- factory MUST apply shallow `Object.freeze()`
- freeze applies only at the factory’s structural level
- nested structures created at that level belong to the factory’s freeze responsibility

DTO instances:

- MUST NOT track mutations
- MUST NOT enforce invariants after creation

Mutation responsibility lies entirely outside DTO.

---

## 8. Structural Class Constraints

The `DTO` class:

- MUST NOT define methods
- MUST NOT contain logic
- MUST NOT perform validation
- MUST NOT implement serialization
- MUST NOT define equality or cloning logic

The class serves exclusively as structural declaration.

---

## 9. Dependency Injection Boundary

Only DTO factories may declare dependencies.

The structural `DTO` class:

- MUST NOT participate in DI
- MUST NOT depend on services

Container configuration and lifecycle management are outside DTO scope.

---

## 10. Type Declaration Rules

Factory type:

```ts
type Ns_Pkg_Dto_Config = typeof import("./Config.mjs").default;
```

Factory instance type:

```ts
type Ns_Pkg_Dto_Config$ = InstanceType<typeof import("./Config.mjs").default>;
```

DTO instance type:

```ts
type Ns_Pkg_Dto_Config$DTO = InstanceType<typeof import("./Config.mjs").DTO>;
```

`$DTO` MUST NOT participate in DI.

---

## 11. Testing Requirements

Tests MUST verify:

- complete structural shape
- correct creation modes
- correct nested factory invocation
- safe degradation of invalid input

Structural class MUST NOT be tested independently.

---

## 12. Exclusion Boundary

A TeqFW DTO is NOT:

- Domain Entity
- Value Object
- Aggregate
- ORM model
- Domain model
- Validation object
- Service
- Behavior container

DTO is strictly a factory-created structural data model with DI participation limited exclusively to the factory.
