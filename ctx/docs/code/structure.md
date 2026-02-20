# Implementation Structure v2

Path: `./ctx/docs/code/structure.md`

## 1. Scope

The second version of the container implementation is located exclusively in `./src2/`.

The directory `./src/` is legacy and must not be modified.

Cross-imports between `src2/` and `src/` are prohibited.

All implementation source files use the `.mjs` extension.

## 2. `src2/` Root Structure

The root of `src2/` contains:

```text
src2/
  Enum/
  Dto/
  Def/
  Container.mjs
  Resolver.mjs
  Lifecycle.mjs
  ...
```

Rules:

1. `Enum/` and `Dto/` directories are mandatory.
2. All DTO modules must be placed under `Dto/`.
3. All Enum modules must be placed under `Enum/`.
4. Additional root-level modules are allowed.
5. Additional directories are allowed.
6. Grouping of source files into directories is unrestricted and may reflect namespace hierarchy or logical cohesion.

The structure must remain consistent and readable. Directory creation must serve structural clarity rather than artificial fragmentation.

## 3. Hierarchical Structure

Hierarchical directory structure inside `Enum/`, `Dto/`, and `Def/` is allowed and encouraged.

Namespace hierarchy must be reflected in directory structure.

Example:

```text
TeqFw_Di_Dto_Resolver_Config
→ src2/Dto/Resolver/Config.mjs
```

```text
TeqFw_Di_Def_Parser
→ src2/Def/Parser.mjs
```

Deeper namespace levels are mapped to nested directories:

```text
TeqFw_Di_Dto_Resolver_Config_Namespace
→ src2/Dto/Resolver/Config/Namespace.mjs
```

## 4. Naming Rules

### 4.1 File Names

1. File names use PascalCase.
2. Underscore (`_`) is strictly prohibited in file names.
3. If a logical name contains `_`, it indicates a missing directory boundary.
4. File names must represent only the final namespace segment.

Correct:

```text
Dto/Resolver/Config.mjs
Dto/Resolver/Config/Namespace.mjs
```

Incorrect:

```text
Dto/Resolver_Config.mjs
Dto/Resolver_Config_Namespace.mjs
```

### 4.2 Directory Names

1. Directory names use PascalCase.
2. Each directory corresponds to one namespace segment.
3. Directory nesting depth is not limited.

## 5. Type-to-File Mapping

Types declared in `types.d.ts` correspond directly to ES module exports.

Mapping rule:

Remove the platform prefix (`TeqFw_Di_`) and map the remaining namespace segments to directories and file name.

Examples:

```text
TeqFw_Di_Container
→ src2/Container.mjs

TeqFw_Di_Resolver
→ src2/Resolver.mjs

TeqFw_Di_Dto_DepId
→ src2/Dto/DepId.mjs

TeqFw_Di_Dto_Resolver_Config
→ src2/Dto/Resolver/Config.mjs

TeqFw_Di_Enum_Platform
→ src2/Enum/Platform.mjs
```

The final namespace segment becomes the file name.

All preceding segments become directories.

## 6. Dependency Direction

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

## 7. Public Entry Point

The only public entry point of the package is `Container.mjs`.

Internal components are not part of the public API.

## 8. Default Parser

The default parser is located under:

```text
src2/Def/Parser.mjs
```

Container uses it by default and allows replacement through configuration.

## 9. Lifecycle and Freeze

Freeze enforcement is implemented in `Lifecycle.mjs`.

Container does not perform freeze directly.

## 10. Platform Independence

The implementation:

- uses native ESM only;
- uses the standard `import()` mechanism;
- does not use platform-specific APIs;
- does not perform platform detection.

Resolver must not depend on filesystem semantics and must not process path separators.

Module specifier interpretation is fully delegated to the standard ESM loader of the runtime environment.

Behavior must be identical in Node.js (ESM mode) and in the browser.

## 11. Test Structure

```text
test2/
  unit/
    Enum/
    Dto/
    Def/
  integration/
```

Rules:

1. Unit test structure mirrors the source structure.
2. Each source module has exactly one corresponding unit test.
3. Integration tests validate the complete linking pipeline.

This document defines structural invariants of the v2 implementation and constrains all code generation within these boundaries.
