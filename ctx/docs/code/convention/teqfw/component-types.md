# Component Types in TeqFW

Path: `./ctx/docs/code/convention/teqfw/component-types.md`
Template Version: `20260312`

## 1. Purpose

This document defines the architectural component types used in applications built on the TeqFW platform and specifies how these components are published through ES modules.

TeqFW classifies **software components**, not **ES modules**.
An ES module is only a **publication unit** used to expose one or more components to the dependency container.

The goal of this document is to establish a deterministic and minimal model of component types that is clear for both developers and LLM agents.

## 2. Component Model

In TeqFW, a component is an addressable architectural unit identified by a namespace identifier.

Conceptual chain:

```
Namespace identifier
        ↓
     component
        ↓
  implementation
        ↓
   ES module publication
```

The dependency container resolves namespace identifiers, loads the corresponding ES module, and exposes its exports as injectable components.

It is important to distinguish components from modules:

```
Component ≠ ES module
```

A single ES module may publish one or more related components.

## 3. Component Categories

TeqFW distinguishes two fundamental categories of components.

```
Component
├─ Handler Component
└─ Data Component
```

### 3.1 Handler Component

A Handler Component encapsulates application behavior.

Characteristics:

- contains executable logic
- usually exists as a singleton
- may have dependencies
- created by the dependency container

Examples of handler components may include services, handlers, dispatchers, repositories, or other logic processors. These names are semantic and do not represent distinct architectural types.

### 3.2 Data Component

A Data Component encapsulates data structure or values.

Characteristics:

- contains no behavior
- usually immutable
- represents structured data or constant values

Data Components are used to transfer or store data processed by Handler Components.

## 4. Data Component Types

Data Components are divided by lifecycle into two categories.

```
Data Component
├─ Static Data Component
└─ Transient Data Component
```

### 4.1 Static Data Component

Static Data Components represent immutable shared values.

Characteristics:

- single shared instance
- immutable
- injected by the container
- not created by factories

Typical forms include:

- Enum components
- Constants components
- Defaults components

Examples:

```javascript
export default Object.freeze({
  ACTIVE: "active",
  DISABLED: "disabled",
});
```

or

```javascript
export default class App_Defaults {
  VALUE = "example";
  constructor() {
    Object.freeze(this);
  }
}
```

Static Data Components provide shared codifiers and configuration values used across the application.

### 4.2 Transient Data Component

Transient Data Components represent structured runtime data.

Characteristics:

- multiple instances may exist
- immutable after creation
- contain no behavior
- created by factories

Examples include domain data structures such as:

```
User
Address
Order
```

#### DTO

A DTO is a specialization of Transient Data Component.

Definition:

```
DTO is a JSON-serializable Transient Data Component
intended for transfer between environments.
```

DTOs are used when data must be transmitted between processes, services, or external systems.

## 5. Handler Component Types

Handler Components encapsulate executable logic.

The only structural specialization defined at the architectural level is the Factory.

```
Handler Component
└─ Factory
```

### 5.1 Factory

A Factory is a Handler Component responsible for creating Transient Data Components.

Characteristics:

- singleton
- may depend on other factories
- performs composition of data structures

Relationship:

```
Factory → creates → Transient Data Component
```

Factories centralize object creation logic and ensure that data components remain free of dependencies.

## 6. Factory and Data Component Pair

Transient Data Components are typically paired with a Factory responsible for their creation.

Because of the strong coupling between a data structure and its creation logic, both components may be published from the same ES module.

Example structure:

```
ES module
├─ Data Component
└─ Factory (Handler Component)
```

Example:

```javascript
export const __deps__ = Object.freeze({
  Factory: Object.freeze({
    addressFactory: "App_Address__Factory$",
  }),
});

export default class App_User {
  /** @type {string} */
  name;
  /** @type {App_Address} */
  address;
}

export class Factory {
  constructor({ addressFactory }) {
    this.create = function ({ name, address }) {
      const res = new App_User();
      res.name = name;
      res.address = addressFactory.create(address);
      return Object.freeze(res);
    };
  }
}
```

In this pattern:

- `App_User` is a Transient Data Component
- `Factory` is a Handler Component

## 7. ES Module Publication Patterns

ES modules act as publication units for components.

Typical patterns include the following.

### 7.1 Handler Component Module

A module exposing a single Handler Component.

```
ES module
└─ Handler Component
```

Example:

```javascript
export const __deps__ = Object.freeze({...});

export default class App_Service {
  constructor(deps) { ... }
}
```

### 7.2 Static Data Component Module

A module exposing a Static Data Component.

```
ES module
└─ Static Data Component
```

Example:

```javascript
export default Object.freeze({
  SINGLETON: "S",
  TRANSIENT: "T",
});
```

### 7.3 Data Component + Factory Module

A module exposing a Transient Data Component and its Factory.

```
ES module
├─ Data Component
└─ Factory
```

This is the typical pattern for domain data structures.

## 8. Object Creation Rule

Object creation in TeqFW is restricted to two locations.

```
new operator is allowed only in:
1. Object Container
2. Factory components
```

### Object Container

The dependency container creates Handler Components and Static Data Components when resolving dependencies.

### Factories

Factories create Transient Data Components.

### Other Components

All other components must obtain objects through:

- dependency injection
- factory methods

Direct use of `new` outside containers and factories is prohibited.

This rule ensures deterministic object lifecycle management and enforces separation between behavior and data.

## 9. Dependency Rules

The dependency graph follows these rules:

```
Data Components must not have dependencies.
Factories may depend on other factories.
Handler Components may depend on any components.
```

This structure keeps dependency relationships predictable and simplifies reasoning about component composition.

## 10. Summary Model

The component model of TeqFW can be summarized as follows.

```
Component
├─ Handler Component
│     └─ Factory
│
└─ Data Component
      ├─ Static Data Component
      │     ├─ Enum
      │     ├─ Constants
      │     └─ Defaults
      │
      └─ Transient Data Component
            └─ DTO
```

Operational flow:

```
Static Data Components
        ↓
Handler Components
        ↓
Factories
        ↓
Transient Data Components
```

This model reflects the core architectural principle of TeqFW: separation of **behavior** and **data**, centralized object creation, and deterministic dependency resolution through the container.
