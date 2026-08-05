# Type Alias Scheme

## Purpose

This reference explains how to annotate JavaScript values in JSDoc when using the TeqFW type map. It defines the alias naming for classes, instances, functions, and objects so that consumer code, implementation modules, and cross-package token contracts use one stable vocabulary resolved through LSP.

## One Alias Per Export

Every module token has a bare alias that is its consumer-side type. In type position a class name is already its instance type, so the bare alias never means "the class itself".

| Export | Alias in `types.d.ts` | Alias holds | JSDoc usage |
| --- | --- | --- | --- |
| Class, default | `NS = import("...").default` | instance type | `{NS}` |
| Class, named | `NS__Export = import("...").Export` | instance type of that export | `{NS__Export}` |
| Function | `NS = typeof import("...").fn` | callable signature | `{NS}`, calls are checked |
| Object / enum | `NS = typeof import("...").default` | object type | `{NS}` |
| Structural shape | `NS = Readonly<{...}>` | shape | `{NS}` |

## Class and Instance

The class itself is a value, so it needs its own alias. The derived alias uses the `__Class` suffix.

```ts
type Vendor_Package_Module = import(".../Module.mjs").default;   // instance
type Vendor_Package_Module__Class = typeof import(".../Module.mjs").default; // the class
```

```js
/** @param {Vendor_Package_Module} inst */          // an instance
function useInstance(inst) {}

/** @param {Vendor_Package_Module__Class} Ctor */  // the class, new-able
function useClass(Ctor) {
    const inst = new Ctor(deps);
}
```

Only classes need a second alias. Functions and objects do not have the class/instance duality.

A package publishes `NS__Class` for every class importable through its entry points (for example the container or the Node.js registries), because consumer JSDoc cannot reference module paths. Internal classes are not published and are reached through value imports and structural factory types.

## Tokens as Interfaces

A module token that can be substituted in the container preprocessor is an interface, not a source file. Declare it structurally in `types.d.ts` without module paths; any implementation that matches the shape is assignable, and substitution changes the resolved module without changing the token type.

```ts
declare global {
    type Vendor_Package_Module = {
        name: string;
        run(deps: object): unknown;
    };
    type Vendor_Package_Module__Class = new (deps: object) => Vendor_Package_Module;
}
```

```js
/** @implements {Vendor_Package_Module} */
export default class Impl { ... }
```

## Rules of Thumb

- `{NS}` is the instance, object, or callable you hold after resolution.
- `{NS__Class}` is the constructable; reach for it only when you call `new` yourself. It is published for classes importable through package entry points.
- `{NS__Export}` selects a named export of the module.
- Do not use `$`, `$$`, or `$$$` in static type references: they are runtime lifecycle markers.
- Do not write `typeof NS` in JSDoc: the alias is not a value (TS2693). Use `NS__Class` instead.
- Do not use `import("...")` in JSDoc type identifiers; the type map is the only bridge between packages.
