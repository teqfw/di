# Type Maps in TeqFW

Path: `ctx/docs/architecture/types-map.md`

## 1. Purpose

A type map in TeqFW is an architectural mechanism intended **exclusively for the TypeScript Language Service (`tsserver`)**, controlling which JavaScript sources are visible for analysis and which part of the library’s type surface is published to consuming projects.

A type map is an editor-time visibility map for `tsserver`; it does not change runtime behavior and does not declare types manually.

---

## 2. Architectural Premises

TeqFW is based on late binding, logical dependency identifiers instead of file paths, minimal use of static imports, and JavaScript + JSDoc without TypeScript, so the static import graph does not represent the real system structure while `tsserver` builds its model strictly from files and declarations.

A type map is introduced as an adapter between these two models.

---

## 3. Definition: Type Map

A **type map** is a declarative layer, implemented as a `types.d.ts` file, that tells `tsserver` which JavaScript files belong to the library, which of them participate in type analysis, and which of them form the public type surface.

It specifies where `tsserver` must compute the type model, based on JavaScript code and JSDoc.

---

## 4. Two Roles of `types.d.ts`

The `types.d.ts` file performs two fundamentally different roles.

### 4.1. Granting `tsserver` Access to All Library Sources

Any declarations in `types.d.ts`, both global and non-global, make the referenced JavaScript sources reachable by `tsserver`, allow `tsserver` to derive structure from JSDoc, and ensure internal type-model consistency during library development.

---

### 4.2. Separating Public and Internal Type Surfaces

In TeqFW, the actual API boundary is defined by the globality of declarations in `types.d.ts`.

Non-global declarations are visible to `tsserver` only when analyzing the library itself and form the internal type surface.

Declarations inside `declare global { ... }` are exported into the type model of consuming projects and form the public type surface.

Therefore:

> The `declare global` boundary is the effective public API boundary in terms of `tsserver`.

---

## 5. Canonical Rules

### 5.1. One Package — One Type Map

Each TeqFW npm package must provide exactly one `types.d.ts` file, referenced via the `types` field in `package.json`.

---

### 5.2. Namespace as Type Name

Each entry in a type map corresponds to exactly one namespace identifier.

Requirements:

- the type name must exactly match the namespace identifier;
- lifecycle suffixes (`$`, `$$`) are forbidden;
- type names must be globally unique.

Namespace addressing and module-to-path mapping invariants are defined in `ctx/docs/architecture/namespace-addressing.md`.

---

### 5.3. Global vs Non-Global Declarations

Both declaration forms are allowed in `types.d.ts`: non-global declarations for internal library analysis and global declarations (`declare global`) for publishing the type model externally.

Using `declare global` is not a stylistic choice but the mechanism by which types are included in the `tsserver` model of consuming projects.

---

### 5.4. Mapping Form (Mandatory)

The only permitted mapping form is a type alias that references a concrete JavaScript source via `import()`.

If the file’s `default` export is a class, the published type must describe the instance, not the constructor:

```ts
declare global {
  type Ns_SubSpace_Folder_Name = InstanceType<typeof import("./src/Folder/Name.js").default>;
}
export {};
```

A direct reference to the `default` export is allowed only if the file exports a function (not a class) or an object literal:

```ts
declare global {
  type Ns_SubSpace_Folder_Name = import("./src/Folder/Name.js").default;
}
export {};
```

Any other declaration forms, including manual structure descriptions, interfaces, or wrappers, are forbidden.

---

## 6. Restrictions

The `types.d.ts` file must contain only `import()`-based references to JavaScript sources and must not include manual class or interface declarations, synthetic types, or runtime/container semantics.

---

## 7. Summary

In TeqFW, `types.d.ts` defines what `tsserver` can see; non-global declarations form the internal type surface; `declare global` publishes the type model externally; and “public” is a category of type visibility, not runtime behavior.
