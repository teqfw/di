# Type Maps in TeqFW

Path: `ctx/docs/architecture/types-map.md`

## 1. Purpose and role

Type maps in TeqFW are an architectural documentation mechanism whose sole purpose is to bind
**logical dependency identifiers** (namespaces used by the DI container) to **concrete JavaScript
source files** in a form consumable by static analyzers and IDEs.

Type maps exist exclusively to support:

- source navigation;
- autocompletion;
- static code comprehension in IDEs (primarily VSCode).

Type maps do not participate in runtime execution and do not influence dependency resolution.

---

## 2. Architectural context

TeqFW is based on the following architectural premises:

- late binding via a DI container;
- dependency addressing by logical identifiers instead of file paths;
- absence of static imports between application modules;
- pure JavaScript (ES6+) without compilation or transpilation.

As a result:

- runtime code operates on **namespace identifiers**;
- IDEs and analyzers operate on **files and types**.

Type maps are introduced to bridge this mismatch **strictly at the static analysis level**,
without affecting runtime semantics.

---

## 3. Definition: Type Map

A **type map** is a static, declarative list of bindings of the form:

```text
Namespace identifier → JavaScript source file
```

All bindings defined in a type map are introduced into the **global type namespace**
of the project and are intended to be referenced **without imports**.

A type map:

- does not define new types in isolation;
- does not describe structure independently of implementation;
- does not introduce behavioral or lifecycle semantics.

It merely binds an architectural name to an existing implementation file.

In TeqFW, a type map is implemented as a single `types.d.ts` file published with an npm package.

---

## 4. Scope and constraints

A type map is subject to the following strict constraints:

- it is used only by static analysis tools;
- it is not a type system;
- it is not an abstraction layer;
- it is not an API contract.

Any information not required to establish a global name-to-file correspondence
does not belong in a type map.

---

## 5. Canonical construction rules

### 5.1. One package — one type map

Each npm package that exposes namespace-addressable code **must provide exactly one type map**.

By convention:

- the file name is `types.d.ts`;
- it is referenced via the `types` field in `package.json`.

---

### 5.2. Namespace as type name

Each entry in a type map corresponds to exactly one namespace identifier.

Rules:

- the type name **must exactly match** the namespace identifier;
- lifecycle suffixes (`$`, `$$`) are forbidden;
- type names must be globally unique across all packages.

Example:

```ts
TeqFw_Di_Container_Resolver;
```

---

### 5.3. Global scope requirement (mandatory)

All namespace types defined in a type map **must be declared in the global type scope**.

A type map **must** use `declare global { ... }` to introduce namespace identifiers
as globally accessible types within the project.

Local, module-scoped, or import-only type declarations are forbidden.

---

### 5.4. Exclusive mapping form (mandatory)

The **only permitted form** of a type map entry is a direct alias to a concrete JavaScript module
using `import()` inside a global declaration.

Canonical form:

```ts
declare global {
  type Ns_SubSpace_Folder_Name = import("./src/Folder/Name.js").default;
}
export {};
```

This form is mandatory and exclusive.

No other declaration forms are allowed.

The `export {}` statement is required to enforce module context
and ensure correct application of the global declaration.

---

### 5.5. Interpretation of the mapping

Each mapping entry asserts the following and nothing more:

- the referenced file exists;
- the referenced file contains the actual implementation;
- all structural information is derived from that file and its JSDoc.

The type map itself carries no structural or semantic knowledge.

---

### 5.6. Aggregation

A `types.d.ts` file may contain multiple mapping entries.

It represents the **set of architectural entities intentionally exposed
for global namespace-based addressing**.

Internal or incidental files must not be included.

---

## 6. IDE integration

VSCode uses TypeScript Language Service for both JavaScript and TypeScript projects.

When an npm package declares:

```json
{
  "types": "types.d.ts"
}
```

VSCode will:

1. load the type map automatically;
2. apply its global declarations to the project type space;
3. resolve `import()` references in each mapping;
4. derive navigation and completion from the referenced source files.

No additional configuration is required.

---

## 7. Usage from application code

Namespace identifiers are resolved as **global types**.

Example:

```js
/**
 * @param {Ns_SubSpace_Folder_Name} service
 */
export default function Controller(service) {
  service.method();
}
```

No imports or type references are required or allowed at usage sites.

The application code continues to operate purely on namespace identifiers.

---

## 8. Normative restriction

A `types.d.ts` file in TeqFW **must not contain anything except global namespace-to-file mappings**.

In particular, it must not contain:

- class declarations;
- interface declarations;
- function declarations;
- property or method signatures;
- lifecycle, scope, or container semantics;
- abstract, synthetic, or virtual type definitions.

If a declaration does not directly point to a concrete JavaScript source file
and introduce it as a global namespace type, it does not belong in a type map.

---

## 9. Evolution

This document intentionally combines rationale and construction rules
to preserve conceptual integrity.

It may be split into separate documents if and when:

- multiple categories of type maps emerge;
- public and internal mappings diverge;
- automated validation or generation tools appear.

Until then, a single document provides the clearest architectural boundary.

---

## 10. Summary

In TeqFW, namespace identifiers are **global architectural symbols**.

Type maps bind these symbols to implementation files for static analysis and IDE support,
while preserving late binding and runtime independence.

A type map is a **map**, not a model, not a contract, and not a type system.
