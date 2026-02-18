# Implementation Structure v2

Path: `./ctx/docs/code/structure.md`

## 1. Scope

The second version of the container implementation is located exclusively in `./src2/`.
The directory `./src/` is legacy and must not be modified.
Cross-imports between `src2/` and `src/` are prohibited.
All implementation source files use the `.mjs` extension.

## 2. `src2/` Structure

The allowed structure is:

```text
src2/
  Enum/
  Dto/
  Def/
  Container.mjs
  Resolver.mjs
  Lifecycle.mjs
```

Structural invariants:

1. The root of `src2/` contains no more than 10 `.mjs` files.
2. Only the directories `Enum/`, `Dto/`, and `Def/` are permitted.
3. Creation of additional directories is prohibited.
4. `Enum/`, `Dto/`, and `Def/` may contain additional files of the same architectural type.
5. Additional root-level modules represent top-level behavioral components.

## 3. Naming

All directories and files use PascalCase.
Types declared in `types.d.ts` correspond directly to ES module exports.

Examples:

- `TeqFw_Di_Container` → `Container.mjs`
- `TeqFw_Di_Resolver` → `Resolver.mjs`
- `TeqFw_Di_Lifecycle` → `Lifecycle.mjs`
- `TeqFw_Di_Def_Parser` → `Def/Parser.mjs`
- `TeqFw_Di_Dto_DepId` → `Dto/DepId.mjs`
- `TeqFw_Di_Enum_Platform` → `Enum/Platform.mjs`

## 4. Dependency Direction

Permitted static import direction:

```text
Enum → (no dependencies)

Dto → Enum

Def → Dto + Enum

Resolver → Dto + Enum
Lifecycle → Dto + Enum

Container → Def + Dto + Enum
```

The following are prohibited:

- reverse imports;
- cyclic dependencies;
- Enum importing any other layer;
- Dto importing Container, Resolver, or Lifecycle;
- Def importing Container.

Container is the highest dependency level.

## 5. Public Entry Point

The only public entry point of the package is `Container.mjs`.
Internal components are not part of the public API.

## 6. Default Parser

The default parser is located at `src2/Def/Parser.mjs`.
Container uses it by default and allows replacement through configuration.

## 7. Lifecycle and Freeze

Freeze enforcement is implemented in `Lifecycle.mjs`.
Container does not perform freeze directly.

## 8. Platform Independence

The implementation:

- uses native ESM only;
- uses the standard `import()` mechanism;
- does not use platform-specific APIs;
- does not perform platform detection.

Resolver must not depend on filesystem semantics and must not process path separators.
Module specifier interpretation is fully delegated to the standard ESM loader of the runtime environment.

Behavior must be identical in Node.js (ESM mode) and in the browser.

## 9. Test Structure

```text
test2/
  unit/
    Enum/
    Dto/
    Def/
  integration/
```

Structural invariants:

1. Each source file corresponds to exactly one unit test.
2. The unit test structure mirrors the source structure.
3. Integration tests cover the complete linking pipeline.

This document defines structural invariants of the v2 implementation and constrains all code generation within these boundaries.
