# DTO Components in TeqFW

Path: `./ctx/docs/code/convention/teqfw/dto.md`
Document Version: `20260313`

## Purpose

This document defines structural conventions for DTO components in TeqFW and describes how transient data structures are implemented and published through ES modules.

The document regulates implementation form only and does not redefine architectural semantics defined in `component-types.md`.

## Architectural Role

In the TeqFW component model, a DTO is a specialization of a **Transient Data Component**.

Component hierarchy:

```
Component
└─ Data Component
   └─ Transient Data Component
      └─ DTO
```

Transient Data Components represent structured runtime data with multiple possible instances.

A DTO represents a **JSON-serializable data structure** used for transferring structured data between components or system boundaries.

DTOs contain no behavior and participate in the system only as data structures.

## Component Characteristics

A DTO component has the following properties:

- represents structured runtime data
- contains no executable behavior
- declares no dependencies
- may have multiple runtime instances
- becomes immutable after factory construction

DTO objects represent structure only and do not implement domain logic.

DTO fields may reference values defined by Enum components.

## Factory Relationship

DTO instances are created by a **Factory**, which is a Handler Component.

Relationship:

```
Factory → creates → DTO
```

Factories centralize DTO construction and may perform structural normalization of input data or coordinate nested DTO creation.

The DTO structure remains independent from the factory.

The Factory exported from the module is also a Handler Component and may be addressed through the namespace system.

Factories may declare dependencies using the standard `__deps__` descriptor.

## Module Publication

DTOs are typically published together with their factory from the same ES module.

The component address refers to the component rather than the ES module itself. The ES module only provides the implementation of the component.

Module structure:

```
ES module
├─ Data Component (default export)
└─ Factory (named export)
```

Example:

```javascript
export default class Ns_Pkg_Dto_Config {
  /** @type {string|undefined} */
  name;

  /** @type {number|undefined} */
  version;
}

export class Factory {
  constructor() {
    this.create = function (data = {}) {
      const dto = new Ns_Pkg_Dto_Config();

      dto.name = data.name;
      dto.version = data.version;

      return Object.freeze(dto);
    };
  }
}
```

In this structure:

- the `default` export represents the **DTO data component**
- `Factory` represents the **handler component responsible for DTO creation**

## Structural Rules

The DTO class MUST satisfy the following constraints.

The DTO class:

- MUST define structural fields only
- MUST NOT define executable methods
- MUST NOT contain business logic
- MUST NOT declare dependencies

DTO structures SHOULD remain compatible with JSON serialization.

## Nested DTO Composition

DTOs may contain nested DTO structures.

Factories coordinate the construction of nested DTO instances by delegating creation to the corresponding DTO factories.

Example structure:

```
User
└─ Address
```

Creation flow:

```
UserFactory → AddressFactory → Address DTO
```

Factories coordinate composition while DTO structures remain independent.

## Immutability

DTO instances SHOULD be immutable after construction.

Factories typically enforce immutability using:

```
Object.freeze(dto);
```

Immutability prevents accidental mutation of transferred data and improves runtime predictability.

## Namespace Convention

DTO components are commonly placed under the `Dto` namespace segment.

Example namespace:

```
TeqFw_Di_Dto_Config
```

The namespace identifier addresses the DTO component. The factory is accessed through the module export.

## Type Mapping

In `types.d.ts`, DTO types are derived from the default export of the module.

Example:

```
type Ns_Pkg_Dto_Config =
  import("./src/Dto/Config.mjs").default;
```

Factory instance types are mapped separately.

Example:

```
type Ns_Pkg_Dto_Config$Factory =
  InstanceType<typeof import("./src/Dto/Config.mjs").Factory>;
```

This separation preserves the architectural distinction between data components and handler components.

## Summary

A DTO in TeqFW is a specialization of a **Transient Data Component** representing structured runtime data.

DTO components:

- represent structured JSON-compatible data
- contain no behavior or dependencies
- may have multiple runtime instances
- are created by factory handler components
- are published as the default export of an ES module
- may be accompanied by a factory exported from the same module
- are mapped to static types through the TeqFW type mapping system.
