# Type Maps in TeqFW

Path: `ctx/docs/code/convention/teqfw/types-map.md`
Template Version: `20260313`

## 1. Purpose

A type map provides a static bridge between architectural namespace identifiers used by the dependency container and concrete JavaScript implementation modules.

Type maps exist solely for static tooling and support:

- IDE navigation
- static analysis
- JSDoc type inference
- automated analysis by development agents

Type maps do not participate in runtime execution and do not influence dependency resolution.

## 2. Addressing Domains

TeqFW architecture operates across three independent addressing domains.

### Runtime namespace

Runtime namespace identifiers address components resolved by the dependency container.

Example:

```
TeqFw_Di_Resolver
TeqFw_Di_Service_Logger
TeqFw_Di_Enum_Life
```

Properties:

- identifies components
- used by dependency injection
- used only at runtime
- must not contain `$`

### Module address space

Module addresses identify ES modules in the filesystem.

Example:

```
./src/Resolver.mjs
./src/Service/Logger.mjs
./src/Enum/Life.mjs
```

Properties:

- represents file system paths
- used by the JavaScript module loader
- independent from runtime namespace identifiers

### Type namespace

Type identifiers exist only for static analysis.

Example:

```
TeqFw_Di_Resolver
TeqFw_Di_Resolver$Config
TeqFw_Di_Enum_Life
```

Properties:

- used only by IDE tooling and tsserver
- may reference named exports
- may contain `$`
- must not be interpreted as CDC dependency identifiers

## 3. Namespace Separation

Two independent identifier systems exist.

Runtime namespace identifiers represent components used by the dependency container.

Type namespace identifiers represent type aliases used for static analysis.

Although the identifiers may appear similar, these namespaces serve different purposes and must not be conflated.

Only runtime namespace identifiers participate in dependency resolution.

## 4. Symbolic Component Addressing

TeqFW uses symbolic addressing for runtime components.

Runtime namespace identifiers do not represent module names or file paths.
They represent abstract component identities resolved by the dependency container.

Example:

```
TeqFw_Di_Service_Logger
```

This identifier does not directly reference a file.
Instead it identifies a component that the container resolves using deterministic namespace mapping rules.

Resolution process:

```
symbolic component identifier
        ↓
namespace → path transformation
        ↓
module file
        ↓
component instance
```

This separation ensures that:

- component identifiers remain stable even if file structure changes
- dependency identifiers remain architectural concepts
- runtime resolution remains independent from module loader semantics

TeqFW therefore distinguishes three independent layers:

- symbolic component addressing (runtime namespace)
- module addressing (filesystem paths)
- type addressing (static analysis)

Only symbolic identifiers participate in dependency resolution.

## 5. Type Map Definition

A type map is a deterministic mapping between architectural namespace identifiers and module types.

Example:

```ts
type Ns_Component = import("./src/Component.mjs").default;
```

Each mapping references the JavaScript module implementing the component.

The type map does not define behavior or structure. Structural information is derived from the referenced implementation module.

## 6. Type Map File

Each npm package exposing namespace-addressable components contains exactly one type map file.

Convention:

```
types.d.ts
```

The file must be referenced in `package.json`.

```
{
  "types": "types.d.ts"
}
```

## 7. Global Type Registry

All type aliases defined in the type map are declared in the global type namespace.

This is required because JSDoc annotations cannot reference module-scoped type exports.

Example:

```ts
declare global {
  type Ns_Component = import("./src/Component.mjs").default;
}
```

### Module invariant

The `types.d.ts` file must end with:

```ts
export {};
```

This ensures:

- the declaration file is treated as a module
- global namespace augmentation remains stable
- IDE type resolution functions correctly

## 8. Namespace Mapping Rules

Namespace identifiers correspond deterministically to source modules.

### 8.1 Namespace → File Path

Namespace identifiers map to file paths using the rule:

```
Namespace prefix removed
Underscore "_" → directory separator "/"
```

Example:

```
Ns_Module_Service
→
src/Module/Service.mjs
```

The type map must not contradict this rule.

### 8.2 Class Component Mapping

For class-based modules the namespace identifier maps to the instance type of the default export.

```ts
type Ns_Component = import("./src/Component.mjs").default;
```

Constructor type may be obtained using:

```
typeof Ns_Component
```

### 8.3 Enum Component Mapping

Enum modules export constant value objects.

The namespace identifier maps to the value type of the exported object.

```ts
type Ns_Enum = typeof import("./src/Enum/Name.mjs").default;
```

### 8.4 Named Export Aliases

Named exports may be referenced using the convention:

```
Namespace$ExportName
```

Example:

```ts
type Ns_Component$Config = import("./src/Component.mjs").Config;
```

Properties:

- `$` separates module namespace from export name
- the alias exists only in the type namespace
- it is not a CDC dependency identifier

### 8.5 Nested Module Mapping

If a concept is implemented as a separate module file it becomes a normal namespace component.

Example file:

```
src/Dto/Resolver/Config/DTO.mjs
```

Namespace:

```
TeqFw_Di_Dto_Resolver_Config_DTO
```

Mapping:

```ts
type TeqFw_Di_Dto_Resolver_Config_DTO = import("./src/Dto/Resolver/Config/DTO.mjs").default;
```

Such identifiers belong to the runtime namespace and therefore must not contain `$`.

## 9. Deterministic File Structure

The `types.d.ts` file has a deterministic structure.

The file contains a single global declaration block.

Example:

```ts
declare global {
  type Ns_Component = import("./src/Component.mjs").default;

  type Ns_Component$Options = import("./src/Component.mjs").Options;

  type Ns_Enum = typeof import("./src/Enum/Life.mjs").default;
}

export {};
```

Entries must be sorted alphabetically by type identifier.

## 10. Allowed Declaration Forms

Only the following declaration forms are allowed.

Class component mapping

```
type Ns_Component =
  import("./src/...").default;
```

Enum value mapping

```
type Ns_Enum =
  typeof import("./src/...").default;
```

Named export alias

```
type Ns_Component$Export =
  import("./src/...").Export;
```

Type maps must not contain:

- interfaces
- structural type definitions
- method signatures
- custom type declarations

## 11. Generation Rules

The type map is a generated artifact.

Agents generate the file from:

```
namespace registry
+
source file structure
```

Generation algorithm:

1. read namespace identifiers from the namespace registry
2. derive source file paths using the namespace → path rule
3. verify that source files exist
4. detect module structure
5. generate the appropriate type mapping
6. generate aliases for named exports when required
7. sort entries alphabetically
8. produce deterministic file structure

Manual edits may be overwritten by generators.

## 12. Generation Invariants

The generated file must satisfy the following invariants:

- every namespace identifier has a corresponding type alias
- referenced source files exist
- namespace → path rule holds
- no duplicate type identifiers exist
- entries are sorted alphabetically
- `$` never appears in CDC namespace identifiers
- the file ends with `export {}`

## 13. IDE Integration

When a package declares:

```
"types": "types.d.ts"
```

VSCode automatically loads the type map and:

- resolves `import()` references
- derives type information from implementation modules
- exposes type aliases globally

## 14. Summary

Type maps bind architectural namespace identifiers to implementation modules while remaining independent from runtime dependency resolution.

A type map:

- maps namespace identifiers to module types
- supports class components and enum modules
- supports named export aliases using `Namespace$Export`
- declares all types globally for JSDoc compatibility
- follows deterministic namespace → file path rules
- maintains strict separation between runtime and type namespaces
- is generated automatically
- ends with `export {}`

The structure is deterministic and can be validated mechanically.
