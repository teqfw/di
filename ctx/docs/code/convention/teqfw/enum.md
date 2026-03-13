# Enum Components in TeqFW

Path: `./ctx/docs/code/convention/teqfw/enum.md`
Document Version: `20260313`

## Purpose

This document defines the structural conventions for Enum components in TeqFW. It specifies how closed sets of primitive constants are represented and published through ES modules.

The document regulates implementation form only and does not redefine architectural semantics already defined in `component-types.md`.

## Architectural Role

In the TeqFW component model, an Enum is a specialization of a **Static Data Component**.

Component hierarchy:

```
Component
└─ Data Component
   └─ Static Data Component
      └─ Enum
```

Static Data Components represent immutable shared values used across the application.

An Enum therefore represents a **closed set of primitive constants** that encode a finite semantic set.

Enums contain no behavior and participate in the system only as data providers.

## Component Characteristics

An Enum component has the following properties:

- immutable value set
- shared immutable value
- no executable behavior
- no dependencies
- container-injectable

The Enum object represents a structural definition of allowed values rather than logic.

## Module Publication

Each Enum component MUST be published from a dedicated ES module.

The component address refers to the component, not to the ES module itself. The ES module only provides the implementation of the component.

The module:

- MUST export a single constant object
- MUST expose that object as the `default` export
- MUST NOT export additional entities

Required structural form:

```javascript
const Ns_Area_Enum_Type = {
  KEY: "value",
};

export default Object.freeze(Ns_Area_Enum_Type);
```

This pattern ensures:

- stable literal types for IDE tooling
- runtime immutability of the exported object
- minimal ES module surface

Example:

```javascript
const TeqFw_Di_Enum_Life = {
  SINGLETON: "S",
  TRANSIENT: "T",
};

export default Object.freeze(TeqFw_Di_Enum_Life);
```

## Structural Rules

An Enum object MUST follow these constraints.

The object MUST be flat.

The object MUST contain only primitive values:

- `string`
- `number`
- `boolean`

The object MUST NOT contain:

- nested objects
- functions
- classes
- computed values
- symbols

The mapping between keys and values MUST be one-to-one.

Enum values represent canonical identity and must remain stable.

## Semantic Keys

Enum keys SHOULD use descriptive uppercase identifiers expressing the architectural meaning of the value.

Enum values MAY use compact canonical encodings when structural identity is important.

Example:

```javascript
const Composition = {
  AS_IS: "A",
  FACTORY: "F",
};

export default Object.freeze(Composition);
```

In this pattern:

- the key expresses semantic meaning
- the value expresses canonical identity

## Dependency Injection

Enum components participate in dependency injection through their `default` export.

The container resolves the component as a shared immutable object.

Enums do not participate in lifecycle management and do not influence dependency resolution.

## Namespace Convention

Enum components are conventionally placed under the `Enum` namespace segment.

Example namespace:

```
TeqFw_Di_Enum_Life
```

The namespace identifier addresses the Enum component, while the module provides its implementation.

## Type Mapping

In `types.d.ts`, the type of an Enum component MUST be derived from the value type of the exported object.

Example:

```ts
type Ns_Area_Enum_Type = typeof import("./src/Enum/Type.mjs").default;
```

This mapping ensures that the static type corresponds exactly to the exported object structure.

## Summary

An Enum in TeqFW is a specialization of a Static Data Component representing a closed set of primitive constants.

Enum components:

- provide immutable structural values
- contain no behavior or dependencies
- are published as a single default-exported object
- use descriptive semantic keys
- expose stable canonical values
- participate in dependency injection as shared immutable data
- are mapped to static types through the TeqFW type map system
