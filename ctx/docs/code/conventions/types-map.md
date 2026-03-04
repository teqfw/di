# Type Maps in TeqFW

Path: `ctx/docs/code/conventions/types-map.md`
Template Version: `20260304`

## 1. Purpose

A type map provides a static bridge between:

- architectural namespace identifiers used by the dependency container
- concrete JavaScript implementation files

Type maps exist solely to support:

- IDE navigation
- static analysis
- JSDoc type inference
- automated analysis by development agents

Type maps do not participate in runtime execution and do not influence dependency resolution.

They exist only for static tooling.

## 2. Architectural context

TeqFW architecture separates two domains.

Runtime domain:

```
namespace identifiers
```

Static analysis domain:

```
files and types
```

Runtime code resolves dependencies using namespace identifiers through the DI container.

Static tooling operates on files and types.

The type map bridges these domains without introducing runtime coupling.

## 3. Runtime namespace vs type namespace

Two independent addressing schemes exist in TeqFW.

### 3.1 CDC namespace (runtime)

CDC namespace identifiers are used by the DI container.

Example:

```
Ns_Pkg_Component
Ns_Pkg_Service
```

Properties:

- used only at runtime
- must correspond to files
- follow the Namespace → Path rule
- must not contain `$`

### 3.2 Type namespace (static)

Type aliases exist only for static analysis.

Example:

```
Ns_Pkg_Component
Ns_Pkg_Component$DTO
Ns_Pkg_Component$Options
```

Properties:

- used only in JSDoc and TypeScript tooling
- may reference named exports
- may contain `$`

The type namespace **must not be interpreted as a CDC dependency identifier**.

Although the syntax resembles dependency IDs used in DI, this is a separate addressing scheme used exclusively for type analysis.

## 4. Definition

A type map is a deterministic mapping between architectural namespace identifiers and module types.

Example:

```ts
type Ns_Component = import("./src/Component.mjs").default;
```

Each mapping references the JavaScript source file that defines the component implementation.

The type map itself does not define structure or behavior. All structural information is derived from the referenced implementation file.

## 5. One package — one type map

Every npm package that exposes namespace-addressable components MUST provide exactly one type map.

Convention:

```
types.d.ts
```

Referenced in `package.json`:

```json
{
  "types": "types.d.ts"
}
```

## 6. Global type registry

All type aliases defined in a type map MUST be declared in the global type namespace.

This is required because JSDoc annotations cannot reference module-scoped type exports.

Example:

```ts
declare global {
  type Ns_Component = import("./src/Component.mjs").default;
}

export {};
```

The `export {}` statement ensures that the declaration file is treated as a module while still augmenting the global namespace.

As a result:

- JSDoc annotations can reference types directly
- no explicit imports are required in source files
- VSCode type inference works across the entire project.

## 7. Canonical mapping rules

Different module structures require different type mappings.

### 7.1 Class component mapping

For class-based modules the namespace identifier maps to the instance type of the default-exported class.

Canonical form:

```ts
type Ns_Component = import("./src/Component.mjs").default;
```

Constructor type may be obtained using:

```
typeof Ns_Component
```

### 7.2 Enum component mapping

Enum modules export constant value objects.

In this case the namespace identifier maps to the value type of the exported object.

Canonical form:

```ts
type Ns_Enum = typeof import("./src/Enum/Name.mjs").default;
```

Example:

```ts
type TeqFw_Di_Enum_Life = typeof import("./src/Enum/Life.mjs").default;
```

### 7.3 Named export type aliases

ES modules may expose additional entities using named exports.

Type aliases may reference such exports using the following convention:

```
Namespace$ExportName
```

Example:

```ts
type Ns_Component$Config = import("./src/Component.mjs").Config;
```

Properties:

- `$` separates the module namespace from the named export
- this alias exists only in the type namespace
- it is not a CDC namespace
- it does not correspond to a DI dependency identifier

Example for DTO:

```ts
type TeqFw_Di_Dto_Resolver_Config$DTO = import("./src/Dto/Resolver/Config.mjs").DTO;
```

Any named export may be referenced using this rule.

## 8. Nested component modules

If a concept is implemented as a separate module file, it becomes a normal namespace component.

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

Such identifiers belong to the runtime namespace and therefore must not use `$`.

## 9. Namespace → file path rule

Namespace identifiers must correspond deterministically to source files.

Rule:

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

This rule allows agents to derive source paths automatically.

The type map must not contradict this rule.

## 10. Deterministic file structure

The structure of `types.d.ts` must be deterministic.

The file consists of a single global declaration block.

Example:

```ts
declare global {
  type Ns_Component = import("./src/Component.mjs").default;

  type Ns_Component$Options = import("./src/Component.mjs").Options;

  type Ns_Enum = typeof import("./src/Enum/Life.mjs").default;
}

export {};
```

Entries MUST be sorted alphabetically by type name.

This ensures stable diffs and deterministic generation.

## 11. Allowed declaration forms

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
- custom type definitions
- method signatures
- structural declarations.

## 12. Agent generation

The type map is a **generated artifact**.

Agents must generate and maintain the file automatically.

Manual edits may be overwritten.

The type map must be generated from:

```
namespace registry
+
source file structure
```

Generation algorithm:

1. read namespace identifiers from the namespace registry
2. derive source file paths using the namespace → path rule
3. verify that the file exists
4. detect module structure
5. generate the appropriate type mapping
6. generate aliases for named exports when required
7. sort entries alphabetically
8. write deterministic file structure.

## 13. Agent validation rules

Agents must validate the following invariants:

1. every namespace identifier has a corresponding type alias
2. referenced source files exist
3. namespace → path rule is satisfied
4. no duplicate type identifiers exist
5. entries are sorted deterministically
6. `$` never appears in CDC namespace identifiers.

Violation of these rules indicates architectural inconsistency.

## 14. IDE integration

When a package declares:

```
"types": "types.d.ts"
```

VSCode automatically loads the type map and:

1. resolves `import()` references
2. derives type information from source files
3. exposes type aliases globally.

No additional configuration is required.

## 15. Usage example

Application code references namespace identifiers directly.

```js
/**
 * @param {Ns_Service} service
 */
export default function run(service) {
  service.execute();
}
```

Named export usage:

```js
/**
 * @param {Ns_Component$Options} options
 */
function init(options) {}
```

Constructor usage:

```js
/** @type {typeof Ns_Service} */
const ServiceClass = ...
```

No imports are required.

## 16. Summary

Type maps bind architectural namespace identifiers to implementation modules.

They provide static analysis support while preserving runtime independence.

A type map:

- maps namespace identifiers to module types
- supports class components and enum modules
- supports aliases for any named export using `Namespace$Export`
- declares all types globally for JSDoc compatibility
- follows deterministic namespace → path rules
- is generated automatically by agents
- can be validated mechanically.

This ensures that TeqFW namespace architecture remains consistent, analyzable, and agent-compatible.
