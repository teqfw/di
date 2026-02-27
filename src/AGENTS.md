# AGENTS.md — `src/`

Path: `./src/AGENTS.md`

## Scope

This file governs all implementation source code located under `./src/`.

All changes in this directory MUST comply with normative documents located in `ctx/docs/code/`.

This file defines only implementation-level obligations. It does not redefine architecture, product, or composition semantics.

## Normative References

The following documents are mandatory:

- `ctx/docs/code/structure.md`
- `ctx/docs/code/container.md`
- `ctx/docs/code/resolver.md`
- `ctx/docs/code/parser.md`
- `ctx/docs/code/depid.md`
- `ctx/docs/code/testing.md`
- `ctx/docs/code/jsdoc-spec.md`
- `ctx/docs/code/conventions/es6-modules.md`
- `ctx/docs/code/conventions/teqfw/dto.md`
- `ctx/docs/code/conventions/teqfw/enum.md`

Agent MUST read and follow them before generating or modifying code.

Deviation from these documents constitutes non-compliance.

## Structural Compliance

Directory layout, namespace mapping, file naming, dependency direction, and static import rules MUST strictly follow:

`ctx/docs/code/structure.md`

In particular:

- `Enum/` and `Dto/` directories are mandatory.
- File names MUST use PascalCase.
- Underscores in file names are prohibited.
- Namespace hierarchy MUST be reflected in directory hierarchy.
- Static dependency direction MUST follow the allowed layer graph.
- `Container.mjs` is the only public entry point.

Structural violations are execution errors.

## JSDoc Compliance

JSDoc is mandatory and governed by:

`ctx/docs/code/jsdoc-spec.md`

All implementation files MUST:

- include `// @ts-check`;
- contain a module-level JSDoc block;
- annotate all exported classes, functions, and public methods;
- annotate private methods and private fields;
- provide explicit `@typedef` for constructor dependency descriptors;
- use existing public type aliases from `types.d.ts` when available;
- avoid introducing duplicate typedefs for already declared public DTO types.

Local variables with non-trivial types MUST use `@type` annotations.

TypeScript source files are prohibited.

Absence of required JSDoc constitutes non-compliance.

## DTO and Enum Rules

All DTO and Enum implementations MUST strictly follow:

- `ctx/docs/code/conventions/teqfw/dto.md`
- `ctx/docs/code/conventions/teqfw/enum.md`

In particular:

- DTO structural classes MUST NOT participate in DI.
- DTO factories MUST expose exactly one public `create(...)` method.
- Enum modules MUST export a single flat literal object as `default`.
- No behavioral logic may be introduced into DTO or Enum modules.
- Semantic constants MUST be referenced via Enum codifiers.
- String literals MUST NOT be used where an Enum codifier exists.

## Fail-Fast Semantics (No Defensive Programming)

Implementation under `src/` follows strict fail-fast architecture.

Agents MUST assume that:

- DepId DTO instances are structurally valid.
- Resolver configuration DTO is valid.
- Enum codifiers are valid.
- Constructor dependency descriptors are correct.
- Public API callers provide semantically correct inputs.

Unless explicitly required by a code-level contract document, implementation MUST NOT:

- perform defensive runtime validation of input types,
- duplicate parser or DTO validation logic,
- introduce early-guard checks for invariants guaranteed by higher layers,
- validate constructor dependency descriptor shapes,
- add “safe” fallback branches,
- attempt graceful degradation.

This rule applies equally to internal and public methods, including `Container.get`.

If an invariant is violated, the system MUST fail at the point of use.
Explicit pre-validation for the sole purpose of producing earlier or clearer error messages is prohibited.

Redundant validation logic constitutes architectural violation.

## Testing Alignment

Unit and integration tests MUST follow:

`ctx/docs/code/testing.md`

For every testable source module, exactly one corresponding unit test MUST exist under `test/unit/`, mirroring directory structure.

Tests MUST use:

- `node:test`
- `node:assert/strict`

Isolation and determinism requirements are mandatory.

## Type Declaration Discipline

The file `types.d.ts` defines exported structural type aliases corresponding to implementation modules.

When adding or renaming an exported implementation module under `src/`, agent MUST:

- ensure a corresponding type alias exists in `types.d.ts`;
- ensure alias mapping follows namespace-to-file mapping rules.

Only types intended for global availability MAY be placed inside `declare global {}`.

All other types MUST be exported normally and imported explicitly.

Implicit global types are prohibited.

## Responsibility Boundary

Agents operating under `src/` are responsible only for:

- implementation-level correctness,
- structural compliance,
- deterministic behavior,
- strict fail-fast semantics,
- JSDoc typing discipline,
- alignment with code-level contracts.

Agents MUST NOT:

- redefine architecture-level invariants,
- weaken fail-fast guarantees,
- introduce defensive runtime validation,
- modify dependency direction rules,
- introduce new extension points not defined at code level.

## Summary

`src/` is governed by strict structural, typing, determinism, and fail-fast invariants.

Implementation must remain:

- structurally deterministic,
- layer-consistent,
- JSDoc-typed,
- DTO/Enum-disciplined,
- free of defensive redundancy,
- compliant with namespace-to-file mapping rules.

Any deviation constitutes non-compliant implementation.
