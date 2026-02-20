# JSDoc Structural Typing Specification

Path: `./ctx/docs/code/jsdoc-spec.md`
Version: `20260220`

## 1. Purpose

This document defines the structural typing discipline for the project using JSDoc as the only permitted type annotation mechanism.

It formalizes how structural contracts are expressed inside `.mjs` runtime files.

This document does not redefine:

- architectural invariants,
- runtime semantics,
- DTO rules,
- container behavior,
- resolver logic.

It governs structural typing visibility only.

## 2. Typing Model

The project operates under a single typing discipline:

- Runtime code: JavaScript (`.mjs`)
- Structural typing: JSDoc
- Static verification: `// @ts-check`
- No TypeScript source files
- No transpilation
- No parallel typing systems

JSDoc is the only structural typing layer.

## 3. Mandatory File-Level Requirements

Every `.mjs` file MUST:

- include `// @ts-check` at the top;
- contain a module-level JSDoc block describing its structural role.

Example:

```js
// @ts-check

/**
 * Resolver component responsible for deterministic module loading.
 */
```

## 4. Unit-Level Annotation Requirements

All non-trivial units MUST include JSDoc.

This includes:

- exported classes,
- exported functions,
- constructors,
- public methods,
- private methods,
- structured parameters,
- structured return values.

Each function or method MUST include:

- short description,
- `@param` for every parameter,
- `@returns` unless intentionally `void`.

Example:

```js
/**
 * Resolves a module namespace.
 *
 * @param {DepId} depId
 * @returns {Promise<object>}
 */
async resolve(depId) {}
```

No reliance on inference for non-trivial structures is permitted.

## 5. Structured Object Rules

Structured objects crossing function boundaries MUST have explicit structural contracts.

Permitted forms:

- named `@typedef`
- imported type alias from `types.d.ts`
- DTO-based structural typing

Inline complex literal typing is discouraged.

For public DTO types:

- Implementation MUST reference the existing alias from `types.d.ts`.
- Duplicate local typedefs for the same public shape are prohibited.

## 6. DTO Alignment Rule

If a structured object crosses module boundaries and represents state:

- It MUST correspond to a concrete DTO implementation.
- JSDoc MUST describe the DTO contract.
- JSDoc MUST NOT replace runtime DTO objects.

Pure typedefs MUST NOT act as cross-module runtime models.

## 7. Constructor Descriptor Typing

All constructor dependency descriptors MUST:

- use explicit `@typedef`,
- describe full structural shape,
- avoid implicit object typing.

Example:

```js
/**
 * @typedef {Object} ResolverDeps
 * @property {TeqFw_Di_Dto_Resolver_Config$DTO} config
 * @property {(specifier: string) => Promise<object>} [importFn]
 */
```

Constructors MUST reference the typedef explicitly.

## 8. Local Variable Annotation

Local variables MUST include `@type` when:

- type is non-primitive,
- type is not trivially inferable,
- type originates from external contract.

Primitive obvious locals MAY omit explicit typing.

## 9. Prohibited Practices

The following are prohibited:

- TypeScript source files
- Type-level programming
- Conditional types
- Runtime validation encoded in types
- Business rule encoding in JSDoc
- Duplicate structural models
- Parallel typing universes
- Implicit global types
- Inferred complex return shapes

## 10. Runtime Neutrality Rule

JSDoc:

- describes structure only,
- does not enforce runtime correctness,
- does not simulate validation,
- does not encode domain invariants.

Runtime enforcement belongs to implementation.

## 11. Determinism Requirement

Annotations MUST:

- be explicit,
- be stable,
- be resolvable,
- be reviewable without reading implementation logic.

Structural contracts must remain deterministic and machine-parsable.

## 12. Conformance Boundary

Absence of required JSDoc annotations constitutes non-compliance with:

- `ctx/docs/code/structure.md`
- this specification.

Structural deviation is not stylistic. It is implementation-level violation.
