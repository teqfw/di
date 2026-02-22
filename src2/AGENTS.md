# AGENTS.md — `src2/`

Path: `./src2/AGENTS.md`

## Scope

This file governs all implementation source code located under `./src2/`.

All changes in this directory MUST comply with normative documents located in `ctx/docs/code/`.

This file defines only implementation-level obligations. It does not redefine architecture, product, or composition semantics.

## Normative References

The following documents are mandatory:

- `ctx/docs/code/structure.md`
- `ctx/docs/code/container.md`
- `ctx/docs/code/resolver.md`
- `ctx/docs/code/parser.md`
- `ctx/docs/code/lifecycle.md`
- `ctx/docs/code/depid.md`
- `ctx/docs/code/testing.md`
- `ctx/docs/code/jsdoc-spec.md`
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

## Testing Alignment

Unit and integration tests MUST follow:

`ctx/docs/code/testing.md`

For every testable source module, exactly one corresponding unit test MUST exist under `test2/unit/`, mirroring directory structure.

Tests MUST use the normative stack:

- `node:test`
- `node:assert/strict`

Isolation and determinism requirements are mandatory.

## Type Declaration Discipline

The file `types.d.ts` defines exported structural type aliases corresponding to implementation modules.

When adding or renaming an exported implementation module under `src2/`, agent MUST:

- ensure a corresponding type alias exists in `types.d.ts`;
- ensure alias mapping follows `ctx/docs/code/structure.md` namespace-to-file mapping rules.

Only types intended for global availability across the entire project MAY be placed inside `declare global {}`.

All other types MUST be exported normally from `types.d.ts` and imported explicitly where needed.

Automatic registration of every new type in `declare global {}` is prohibited.

Introducing implicit global types is prohibited.

## Responsibility Boundary

Agents operating under `src2/` are responsible only for:

- implementation-level correctness,
- structural compliance,
- deterministic behavior,
- JSDoc typing discipline,
- alignment with code-level contracts.

Agents MUST NOT:

- redefine architecture-level invariants,
- weaken fail-fast guarantees,
- modify dependency direction rules,
- introduce new extension points not defined at code level.

## Summary

`src2/` is governed by strict structural, typing, and testing invariants defined at the code level.

Implementation must remain:

- structurally deterministic,
- layer-consistent,
- JSDoc-typed,
- DTO/Enum-disciplined,
- free of implicit globals,
- compliant with namespace-to-file mapping rules.

Any deviation from these invariants constitutes non-compliant implementation.
