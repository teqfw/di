# ES6 Module Form — Core Package (`@teqfw/di`)

Path: `./ctx/docs/code/conventions/es6-modules.md`
Version: `20260223`

## Purpose

This document defines the normative structural form of ES6 runtime modules inside the core package `@teqfw/di`.

The package follows a functional construction model.
Classes are used only as structural containers for constructor invocation and IDE compatibility.

This document defines implementation-level engineering invariants only.

## Normative Module Form

An ES6 module inside `@teqfw/di` MUST:

- be a valid ES6 module;
- include `// @ts-check`;
- contain a module-level JSDoc block describing structural role;
- export exactly one `default` class.

Default-exported factory functions are prohibited.

Exception: modules that implement TeqFW DTO or Enum components MAY use their specialized normative form instead of class-default form.
These exceptions are governed exclusively by:

- `ctx/docs/code/conventions/teqfw/dto.md`
- `ctx/docs/code/conventions/teqfw/enum.md`

Named exports are permitted only for:

- structural constants,
- enumerations,
- helper utilities,
- typedef declarations.

Absence of a class default export constitutes structural non-conformance.
For DTO and Enum exception modules, absence of a class default export is not a violation if the module conforms to its specialized convention document.

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

The class serves only as a constructor container.

The instance API MUST be defined exclusively inside the constructor via assignments to `this`.

Example of required pattern:

```js
constructor() {
    let state = 0;

    this.method = function () {
        state += 1;
    };
}
```

No public API may be declared outside the constructor.

## Strict Prohibitions

The following are prohibited:

- `#private` fields;
- `private` or `protected` modifiers;
- prototype methods;
- methods declared outside the constructor body;
- inheritance (`extends`);
- use of `super`;
- hidden state defined at class level;
- default-exported factory functions.

Encapsulation MUST rely exclusively on lexical scoping (constructor closure).

## Constructor Rules

The constructor:

- MAY accept zero or more parameters;
- MUST explicitly document structured parameters using JSDoc;
- MUST NOT rely on implicit global state;
- MUST NOT perform environment-dependent side effects.

Constructor arguments are plain parameters and are not interpreted as dependency injection.

### Constructor Dependency Descriptor Form

When constructor input is a structured descriptor object (for example, service dependencies), constructor parameters MUST use direct object destructuring in the signature.

Required form:

```js
/**
 * @typedef {object} UserService$Deps
 * @property {Namespace_Package_Service_UserRepo$} userRepo
 * @property {Namespace_Package_Service_Logger$} logger
 */
constructor({userRepo, logger}) {
    logger.log(userRepo.save('User data'));
}
```

Rules:

- Descriptor shape MUST be documented with explicit `@typedef`.
- Constructor `@param` MUST reference that typedef.
- Destructured properties MUST be used directly in constructor closure.
- Intermediate alias variables that only duplicate destructured properties (for example `const parser = deps.parser`) SHOULD NOT be introduced.
- If additional normalization is required, destructuring with defaults is permitted in the signature.

## Encapsulation and State

Internal state MUST be implemented via constructor-local variables.

State MUST NOT be stored:

- in class-level fields;
- in `#private` members;
- in static properties.

State is accessible only through functions closing over constructor-local variables.

This guarantees:

- explicit instance shape;
- absence of hidden structural fields;
- deterministic static analyzability;
- structural transparency for tooling and LLM agents.

## Top-Level Module Rules

Top-level module code:

- MUST NOT execute business logic;
- MUST NOT perform I/O;
- MUST NOT mutate global state.

Only static declarations and pure structural constants are allowed.

All runtime behavior MUST originate from constructor execution.

## Structural Typing Discipline

Modules MUST comply with the JSDoc Structural Typing Specification.

In particular:

- `// @ts-check` is mandatory;
- structured parameters MUST use `@typedef` where necessary;
- type guards MAY be used only for union narrowing;
- assertion-style predicates are prohibited;
- domain invariants MUST NOT be encoded in JSDoc.

Structural typing remains runtime-neutral.

## Determinism Requirement

Module structure MUST ensure:

- structurally predictable instance shape;
- explicit API surface defined in constructor;
- reviewable structural contracts;
- machine-parsable static form.

Structural conventions must remain stable under static analysis.

## Conformance Boundary

Violation of any rule defined in this document constitutes an implementation-level defect.
DTO and Enum modules are evaluated by their specialized conventions and are excluded from class-default enforcement of this document.

Deviation is not stylistic and must be corrected.
