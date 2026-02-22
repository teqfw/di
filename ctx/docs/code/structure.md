# Implementation Structure v2

Path: `./ctx/docs/code/structure.md`

## 1. Scope

Version 2 of the implementation is located exclusively in `./src2/`.

The directory `./src/` is legacy and MUST NOT be modified.

Cross-imports between `src2/` and `src/` are prohibited.

All implementation source files MUST use the `.mjs` extension.

This document defines structural invariants only. It does not redefine architectural, product, or runtime semantics.

## 2. Root Layout of `src2/`

The root of `src2/` contains structural layers and primary orchestration modules.

Mandatory directories:

```text
src2/
  Enum/
  Dto/
  Def/
```

Rules:

1. `Enum/` is mandatory and contains only Enum modules.
2. `Dto/` is mandatory and contains only DTO modules.
3. `Def/` contains profile-specific components (e.g., Default CDC parser).
4. Additional root-level modules are permitted.
5. Additional directories are permitted.
6. Directory creation MUST serve structural clarity and namespace mapping.
7. Artificial fragmentation is prohibited.

## 3. Root Module and Same-Named Directory Rule

If a root-level module defines a primary component, its internal implementation fragments MUST be placed in a directory with the same name at the same level.

Structure:

```text
Component.mjs
Component/
  PartA.mjs
  PartB.mjs
```

Rules:

1. The root file represents the public or orchestration boundary.
2. The same-named directory contains internal structural parts.
3. The directory MUST NOT contain a file with the same name as the root module.
4. The following structure is prohibited:

```text
Component/Component.mjs
```

This rule applies to components such as:

```text
Container.mjs
Resolver.mjs
Lifecycle.mjs
```

This convention eliminates namespace duplication and preserves visual hierarchy.

## 4. Namespace-to-Directory Mapping

Namespace hierarchy MUST be reflected directly in directory structure.

Mapping rule:

Remove the platform prefix (`TeqFw_Di_`) and map remaining namespace segments to directories and file name.

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

TeqFw_Di_Dto_Resolver_Config_Namespace
→ src2/Dto/Resolver/Config/Namespace.mjs

TeqFw_Di_Def_Parser
→ src2/Def/Parser.mjs
```

Each namespace segment corresponds to one directory level.

The final namespace segment becomes the file name.

## 5. Naming Rules

### 5.1 File Names

1. File names use PascalCase.
2. Underscore (`_`) is prohibited in file names.
3. Presence of `_` indicates a missing directory boundary.
4. File names represent only the final namespace segment.

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

### 5.2 Directory Names

1. Directory names use PascalCase.
2. Each directory represents exactly one namespace segment.
3. Directory nesting depth is unrestricted.

## 6. Dependency Direction

Permitted static import direction:

```text
Enum → (no dependencies)

Dto → Enum

Def → Dto + Enum

Resolver → Dto + Enum
Lifecycle → Dto + Enum

Container → Def + Dto + Enum + Resolver + Lifecycle
```

Rules:

1. Reverse imports are prohibited.
2. Cyclic dependencies are prohibited.
3. `Enum` MUST NOT import any other layer.
4. `Dto` MUST NOT import `Container`, `Resolver`, or `Lifecycle`.
5. `Def` MUST NOT import `Container`.
6. `Container` is the highest dependency level.

Violation of these rules constitutes structural non-compliance.

## 7. Public Entry Point

The only public entry point of the package is:

```text
src2/Container.mjs
```

All other modules are internal implementation components.

Internal module refactoring is permitted provided externally observable behavior remains unchanged.

## 8. JSDoc Requirement

JSDoc is mandatory for the entire implementation.

Rules:

1. Every exported class, factory, function, or object MUST include a top-level JSDoc block describing structural role and contract.
2. All public methods MUST include `@param` and `@returns`.
3. Constructor dependency descriptors MUST use explicit `@typedef`.
4. Public DTO structural types MUST reference existing aliases from `types.d.ts` when available.
5. Duplicate structural typedefs for existing public DTO types are prohibited.
6. Private methods and private fields MUST include structural JSDoc.
7. Local variables MUST include `@type` when their type is non-trivial.

TypeScript source files are prohibited.

JSDoc is the only permitted structural typing mechanism.

Absence of required JSDoc constitutes structural non-compliance.

Detailed typing discipline is defined in `ctx/docs/code/jsdoc-spec.md`.

## 9. Default Parser Location

The default CDC profile parser is located at:

```text
src2/Def/Parser.mjs
```

Container uses it by default and MAY allow replacement according to container contract.

## 10. Lifecycle Boundary

Freeze enforcement is implemented in:

```text
src2/Lifecycle.mjs
```

Container MUST NOT perform freeze directly.

## 11. Platform Neutrality

The implementation:

- uses native ESM only,
- uses standard dynamic `import()`,
- does not perform platform detection,
- does not inspect filesystem semantics.

Resolver MUST NOT normalize path separators.

Module specifier interpretation is delegated entirely to the runtime ESM loader.

Behavior MUST remain identical across Node.js (ESM mode) and browser environments.

## 12. Test Structure

Unit tests are located in:

```text
test2/unit/
```

Structure MUST mirror `src2/`.

Each testable source module MUST have exactly one corresponding unit test file.

Integration tests validate the complete linking pipeline.

Testing rules are defined in `ctx/docs/code/testing.md`.

This document defines structural invariants of the v2 implementation. All source artifacts under `src2/` MUST conform to these rules simultaneously.
