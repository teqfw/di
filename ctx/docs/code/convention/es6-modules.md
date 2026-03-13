# ES6 Module Form — Core Package (`@teqfw/di`)

Path: `./ctx/docs/code/convention/es6-modules.md`
Version: `20260313`

## Purpose

This document defines the normative structural form of ES6 modules used inside the core package `@teqfw/di`.

The document governs **module implementation structure**, not architectural component classification.

Component roles and types are defined separately in:

```
ctx/docs/code/convention/teqfw/component-types.md
```

This document defines only the structural invariants that make modules deterministic and analyzable by tools and development agents.

## Scope

Rules in this document apply to runtime implementation modules of the core package.

The document does **not** define:

- component architecture
- dependency container behavior
- runtime dependency resolution

Those concerns belong to higher architectural layers.

## Normative Module Form

An ES6 module inside `@teqfw/di` MUST:

- be a valid ES6 module;
- include `// @ts-check`;
- contain a module-level JSDoc block describing its structural role;
- export exactly one `default` class.

Default-exported factory functions are prohibited.

Named exports are permitted only for:

- structural constants
- helper utilities
- enum values
- typedef declarations

Absence of a class default export constitutes structural non-conformance.

## Specialized Module Exceptions

Some modules implement specialized TeqFW component forms.

Such modules are governed by their dedicated conventions:

```
ctx/docs/code/convention/teqfw/dto.md
ctx/docs/code/convention/teqfw/enum.md
```

Modules conforming to those specifications are exempt from the class-default requirement defined in this document.

## Canonical Module Example

```js
// @ts-check

/**
 * Counter implementation using constructor closure.
 */
export default class Counter {
  /**
   * Creates counter instance.
   */
  constructor() {
    let value = 0;

    this.increment = function () {
      value += 1;
    };

    this.get = function () {
      return value;
    };
  }
}
```

The example is normative in structure, not in logic.

## Functional Construction Model

`@teqfw/di` follows a functional construction discipline.

Classes are used only as constructor containers.

The instance API MUST be defined exclusively inside the constructor via assignments to `this`.

Example:

```js
constructor() {
  let state = 0;

  this.method = function () {
    state += 1;
  };
}
```

No instance methods may be declared outside the constructor.

## Encapsulation Model

Encapsulation relies exclusively on lexical scoping.

Internal state MUST be implemented through constructor-local variables.

State MUST NOT be stored in:

- class fields
- `#private` fields
- static properties

State becomes accessible only through functions defined inside the constructor.

This guarantees:

- deterministic instance structure
- explicit public API surface
- absence of hidden structural fields
- analyzability by static tooling

## Strict Structural Prohibitions

The following constructs are prohibited:

- `#private` fields
- `private` or `protected` modifiers
- prototype methods
- inheritance (`extends`)
- use of `super`
- class-level mutable state
- default-exported factory functions

Encapsulation MUST rely only on constructor closure.

## Constructor Rules

Constructors MAY accept parameters.

When structured input objects are used, they MUST be documented via JSDoc typedef.

Example:

```js
/**
 * @typedef {object} UserService$Deps
 * @property {Namespace_Package_Service_UserRepo$} userRepo
 * @property {Namespace_Package_Service_Logger$} logger
 */

/**
 * @param {UserService$Deps} deps
 */
constructor({userRepo, logger}) {
  logger.log(userRepo.save('User data'));
}
```

Rules:

- descriptor shape MUST be documented with `@typedef`
- constructor parameters MUST reference that typedef
- destructured properties MUST be used directly in constructor logic

Intermediate alias variables that duplicate destructured properties SHOULD NOT be introduced.

## Top-Level Module Rules

Top-level module code MUST remain purely declarative.

The module body MUST NOT:

- execute business logic
- perform I/O
- mutate global state

Allowed top-level constructs:

- imports
- class declarations
- constants
- typedefs

All runtime behavior MUST originate from constructor execution.

## Structural Typing Discipline

Modules MUST comply with the JSDoc structural typing model.

Requirements:

- `// @ts-check` is mandatory
- structured parameters MUST use `@typedef`
- typedefs MUST describe structural contracts only

JSDoc annotations must remain runtime-neutral.

Domain invariants MUST NOT be encoded in JSDoc types.

## Deterministic Structure Requirement

Module structure MUST guarantee:

- deterministic instance shape
- explicit API definition
- machine-readable structural form
- compatibility with static analysis

The module structure must remain stable under automated inspection.

## Conformance Boundary

Violation of any rule defined in this document constitutes an implementation defect.

DTO and Enum modules are evaluated according to their own conventions and are excluded from the class-default enforcement defined here.

Deviation from these rules must be corrected.
