# JSDoc Structural Typing Specification

Path: `./ctx/docs/code/conventions/jsdoc-spec.md`
Version: 20260223

## 1. Purpose

This document defines the structural typing discipline for JavaScript projects that use JSDoc as the only permitted type annotation mechanism.

It specifies how structural contracts are expressed inside runtime `.js` / `.mjs` files under `// @ts-check`.

This document governs structural typing only.
It does not define runtime semantics, architectural invariants, validation rules, or domain behavior.

## 2. Typing Model

The typing model consists of:

- Runtime language: JavaScript.
- Structural typing layer: JSDoc.
- Static verification engine: TypeScript (`tsserver`) via `// @ts-check`.
- No TypeScript source files.
- No transpilation.
- No parallel typing systems.

JSDoc annotations form the only structural typing layer.

## 3. File-Level Requirements

Each runtime file MUST:

- include `// @ts-check` at the top;
- contain a module-level JSDoc block describing its structural role.

Example:

```js
// @ts-check

/**
 * Component responsible for deterministic module loading.
 */
```

## 4. Unit-Level Annotation Requirements

All non-trivial exported or externally visible units MUST include JSDoc.

This includes:

- exported classes,
- exported functions,
- constructors,
- public methods,
- private methods with non-trivial contracts,
- structured parameters,
- structured return values.

Each function or method MUST include:

- short description,
- `@param` for every parameter,
- `@returns` unless intentionally `void`.

Reliance on inference for non-trivial structured types is prohibited.

## 5. Structured Object Contracts

Structured objects crossing module boundaries MUST have explicit structural contracts.

Permitted forms:

- named `@typedef`,
- imported type alias from a central declaration file,
- concrete DTO types.

Inline complex literal typing SHOULD be avoided for cross-module contracts.

Public structural shapes MUST NOT be duplicated across modules.

## 6. DTO Alignment Rule

If a structured object represents persistent or cross-boundary state:

- it MUST correspond to a concrete runtime DTO implementation;
- JSDoc MUST reference the DTO type;
- JSDoc MUST NOT act as a substitute for runtime DTO objects.

Pure typedefs MUST NOT replace runtime state models.

## 7. Constructor Dependency Typing

Constructor dependency descriptors MUST:

- use explicit `@typedef`,
- describe the full structural shape,
- avoid implicit object typing.

Constructors MUST reference the declared typedef explicitly.

## 8. Local Variable Annotation

Local variables MUST include `@type` when:

- the type is non-primitive,
- the type is not trivially inferable,
- the type originates from an external contract.

Primitive and trivially inferable locals MAY omit explicit typing.

## 9. Type Guards and Narrowing

TypeScript-compatible type predicates inside JSDoc are permitted.

Allowed form:

```js
@returns {value is SomeType}
```

Type predicates MAY be used only to:

- narrow union types,
- reflect runtime structural checks,
- support deterministic control-flow narrowing.

Type predicates MUST NOT:

- encode business rules,
- enforce architectural invariants,
- replace discriminated structural modeling when a deterministic discriminant exists.

Assertion-style predicates (`asserts value is Type`) are prohibited.

## 10. Prohibited Practices

The following are prohibited:

- TypeScript source files.
- Type-level programming (conditional types, mapped types, generics in `.ts`).
- Encoding domain invariants in types.
- Duplicating structural models.
- Parallel typing systems.
- Implicit global types.
- Implicit complex return shapes without annotation.

## 11. Runtime Neutrality Rule

JSDoc:

- describes structure only,
- does not perform runtime validation,
- does not enforce domain correctness,
- does not encode business semantics.

All enforcement belongs to runtime implementation.

## 12. Determinism Requirement

Structural annotations MUST be:

- explicit,
- stable,
- resolvable without executing code,
- reviewable independently of implementation details.

Structural contracts must remain deterministic and machine-parsable.

## 13. Conformance Boundary

Absence of required structural annotations constitutes a specification violation.

Deviation is an implementation-level defect, not a stylistic choice.
