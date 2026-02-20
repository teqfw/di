# Implementation Structure v2

Path: `./ctx/docs/code/structure.md`

## 1. Scope

Version 2 of the container implementation is located exclusively in `./src2/`.

The directory `./src/` is legacy and MUST NOT be modified.

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
2. All DTO modules MUST be placed under `Dto/`.
3. All Enum modules MUST be placed under `Enum/`.
4. Additional root-level modules are permitted.
5. Additional directories are permitted.
6. Directory creation MUST serve structural clarity.

Artificial fragmentation is prohibited.

## 3. Hierarchical Structure

Hierarchical structure inside `Enum/`, `Dto/`, and `Def/` is permitted and encouraged.

Namespace hierarchy MUST be reflected in directory structure.

Examples:

```text
TeqFw_Di_Dto_Resolver_Config
→ src2/Dto/Resolver/Config.mjs

TeqFw_Di_Def_Parser
→ src2/Def/Parser.mjs

TeqFw_Di_Dto_Resolver_Config_Namespace
→ src2/Dto/Resolver/Config/Namespace.mjs
```

Each namespace segment corresponds to one directory level.

## 4. Naming Rules

### 4.1 File Names

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

### 4.2 Directory Names

1. Directory names use PascalCase.
2. Each directory represents one namespace segment.
3. Directory nesting depth is unrestricted.

## 5. Type-to-File Mapping

Types declared in `types.d.ts` correspond directly to ES module exports.

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

- reverse imports,
- cyclic dependencies,
- Enum importing any other layer,
- Dto importing Container, Resolver, or Lifecycle,
- Def importing Container.

Container is the highest dependency level.

## 7. Public Entry Point

The only public entry point of the package is `Container.mjs`.

All other modules are internal implementation components.

Changing internal module signatures is permitted unless it affects externally observable behavior.

## 8. JSDoc Annotation Requirement

JSDoc is mandatory for the entire `@teqfw/di` implementation.

The following rules are normative:

1. Every exported class, factory, function, or object MUST include a top-level JSDoc block describing its structural role and contract.
2. All public methods of exported classes MUST include JSDoc with:
   - parameter types,
   - return type,
   - semantic description.

3. All public properties of exported objects MUST be documented using JSDoc.
4. Constructor dependency descriptors MUST be defined using explicit JSDoc `@typedef`.
5. Public DTO structural shapes referenced in implementation MUST have explicit JSDoc typing.
6. Internal private methods and private fields of classes MUST include JSDoc annotations that describe structural role and, for methods, parameter and return types.
7. If a required public DTO type alias already exists in `types.d.ts`, implementation JSDoc MUST use that alias and MUST NOT introduce a duplicate local replacement typedef for the same public shape.
8. Local variables declared with `const`, `let`, or `var` MUST include JSDoc `@type` annotations when their type is non-primitive or not trivially inferable from the expression; obvious primitive locals may omit explicit annotation.

TypeScript is prohibited.
JSDoc is the only permitted type annotation mechanism.

Absence of required JSDoc constitutes non-compliance with package structure rules.

## 9. Default Parser

The default parser is located at:

```text
src2/Def/Parser.mjs
```

Container uses it by default and allows replacement via configuration.

## 10. Lifecycle and Freeze

Freeze enforcement is implemented in `Lifecycle.mjs`.

Container does not perform freeze directly.

## 11. Platform Independence

The implementation:

- uses native ESM only,
- uses standard `import()` mechanism,
- does not use platform-specific APIs,
- does not perform platform detection.

Resolver MUST NOT depend on filesystem semantics and MUST NOT process path separators.

Module specifier interpretation is delegated entirely to the runtime ESM loader.

Behavior MUST be identical in Node.js (ESM mode) and in the browser.

## 12. Test Structure

```text
test2/
  unit/
    Enum/
    Dto/
    Def/
  integration/
```

Rules:

1. Unit test structure mirrors source structure.
2. Each source module MUST have exactly one corresponding unit test.
3. Integration tests validate the complete linking pipeline.

This document defines structural invariants of the v2 implementation and constrains all code generation within these boundaries.
