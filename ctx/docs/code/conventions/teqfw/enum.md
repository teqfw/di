# Enum Creation Rules (TeqFW)

Path: `./ctx/docs/code/conventions/teqfw/enum.md`

## Purpose

This document defines the engineering invariants for creating Enum modules in TeqFW. It specifies structural requirements, export rules, namespace constraints, and testing obligations. This document regulates implementation form only and does not redefine architectural semantics.

## Definition

An Enum in TeqFW is a flat literal object representing a closed set of primitive constants. An Enum is a structural element of the Core Architecture and contains no logic or behavior.

## Module Structure

Each Enum:

- MUST be located in a dedicated ES module.
- MUST declare a named constant.
- MUST export that constant as the single `default` export.
- MUST NOT contain additional exports.

Required structural form:

```js
const Ns_Area_Enum_Type = {
  KEY: "value",
};

export default Ns_Area_Enum_Type;
```

## Structural Rules

An Enum:

- MUST be flat.

- MUST contain only primitive values:
  - `string`
  - `number`
  - `boolean`

- MAY mix primitive types.

- MUST NOT contain:
  - nested objects
  - computed values
  - functions
  - classes
  - `Symbol`
  - TypeScript `enum`

- MUST NOT define a factory.

- MUST NOT be extended downstream.

- Represents a closed set of values.

## Semantic Key Rule

When an Enum encodes architecture-defined semantic sets, keys MUST use descriptive uppercase identifiers.

Values MAY use compact canonical literals required by structural identity.

Example (recommended pattern):

```js
const Composition = {
  AS_IS: "A",
  FACTORY: "F",
};

const Life = {
  SINGLETON: "S",
  INSTANCE: "I",
};
```

In this pattern:

- The key (`AS_IS`) expresses architectural meaning.
- The value (`"A"`) expresses canonical identity encoding.
- The mapping MUST be one-to-one.
- No additional states may be introduced.

Enum keys serve readability and semantic clarity. Enum values serve structural identity and serialization stability.

## Behavioral Boundary

An Enum:

- Is NOT a Domain Entity.
- Is NOT a Value Object.
- Is NOT a Service.
- Is NOT a Strategy.
- Is NOT a Factory.
- Contains no invariants or validation.
- Does not manage DI.
- Does not influence resolver behavior.
- Does not contain execution semantics.

An Enum guarantees only structural fixation of allowed values.

## Dependency Injection

- Only the `default` export participates in DI.
- When resolved through the container, the object is frozen via `Object.freeze()`.
- Enum does not influence wiring or lifecycle.
- Immutability is enforced by the container.

## Namespace Rules

- The identifier MUST contain the segment `Enum`.
- The namespace MUST comply with TeqFW DI naming rules.
- Namespace is deterministically derived from the dependency identifier.

## Type Declaration

In `types.d.ts`, the type MUST be extracted as:

```ts
type Ns_Area_Enum_Type = typeof import("path/to/module").default;
```

The type corresponds exactly to the exported object.

## Testing Requirements

Tests MUST verify:

- that the object is flat,
- that no nested structures are present,
- that only primitive values are defined,
- that no additional exports exist,
- that key-to-value mapping is one-to-one.

Module-level freeze verification is not required.

## Summary

An Enum in TeqFW is a strictly structural, behavior-free, namespace-disciplined, closed set of primitive constants.

When used to encode architectural semantic sets, descriptive keys ensure clarity, while compact canonical values ensure structural identity stability and deterministic behavior.
