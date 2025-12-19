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

- runtime code operates on **namespaces**;
- IDEs and analyzers operate on **files**.

Type maps are introduced to bridge this mismatch **strictly at the static analysis level**,
without affecting runtime semantics.

---

## 3. Definition: Type Map

A **type map** is a static, declarative list of bindings of the form:

```text
Namespace identifier → JavaScript source file
```

A type map:

- does not define new types;
- does not describe structure independently of implementation;
- does not introduce behavioral or lifecycle semantics.

It merely points from an architectural name to an existing implementation.

In TeqFW, a type map is implemented as a single `types.d.ts` file published with an npm package.

---

## 4. Scope and constraints

A type map is subject to the following strict constraints:

- it is used only by static analysis tools;
- it is not a type system;
- it is not an abstraction layer;
- it is not an API contract.

Any information not required to establish a name-to-file correspondence does not belong in a type map.

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
Ns_SubSpace_Folder_Name;
```

---

### 5.3. Exclusive mapping form (mandatory)

The **only permitted form** of a type map entry is a direct alias to a concrete JavaScript module
using `import()`.

Canonical form:

```ts
export type Ns_SubSpace_Folder_Name = import("./src/Folder/Name.js").default;
```

This form is mandatory and exclusive.

No other declaration forms are allowed.

---

### 5.4. Interpretation of the mapping

Each mapping entry asserts the following and nothing more:

- the referenced file exists;
- the referenced file contains the actual implementation;
- all structural information is derived from that file and its JSDoc.

The type map itself carries no structural knowledge.

---

### 5.5. Aggregation

A `types.d.ts` file may contain multiple mapping entries.

It represents the **set of architectural entities intentionally exposed for namespace-based addressing**.

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
2. merge its entries into the project-wide type space;
3. resolve `import()` references in each mapping;
4. derive navigation and completion from the referenced source files.

No additional configuration is required.

---

## 7. Usage from application code

Type maps are consumed implicitly by the IDE.

Example:

```js
/**
 * @param {Ns_SubSpace_Folder_Name} service
 */
export default function Controller(service) {
  service.method();
}
```

The application code continues to operate on namespace identifiers.
No static imports are introduced.

---

## 8. Normative restriction

A `types.d.ts` file in TeqFW **must not contain anything except namespace-to-file mappings**.

In particular, it must not contain:

- class declarations;
- interface declarations;
- function declarations;
- property or method signatures;
- lifecycle, scope, or container semantics;
- abstract or synthetic type definitions.

If a declaration does not directly point to a concrete JavaScript source file, it does not belong
in a type map.

---

## 9. Evolution

This document intentionally combines rationale and construction rules to preserve conceptual
integrity.

It may be split into separate documents if and when:

- multiple categories of type maps emerge;
- public and internal mappings diverge;
- automated validation or generation tools appear.

Until then, a single document provides the clearest architectural boundary.

---

## 10. Summary

In TeqFW, a type map is a strict architectural construct that:

- binds namespace identifiers to implementation files;
- preserves late binding;
- enables IDE-assisted development;
- introduces no additional semantics beyond file location.

A type map is a **map**, not a model, not a contract, and not a type system.
