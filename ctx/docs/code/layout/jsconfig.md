# jsconfig — Project Type Analysis Layout

Path: `ctx/docs/code/layout/jsconfig.md`
Template Version: `20260306`

## 1. Purpose

This document defines the canonical structure of the `jsconfig.json` file used in TeqFW projects.

The configuration is used by IDE tooling and TypeScript language services (`tsserver`) for static analysis of JavaScript sources.

The configuration does not compile code and does not produce artifacts.

This document belongs to the **code/layout** level of ADSM documentation and defines the canonical layout of `jsconfig.json`.

## 2. Source of Truth

The `jsconfig.json` file is a generated artifact.

The authoritative definition of its structure is located in this document:

`ctx/docs/code/layout/jsconfig.md`

If a discrepancy appears between `jsconfig.json` and this document, the structure defined here takes precedence.

## 3. Analysis Model

In TeqFW projects `jsconfig.json` defines the configuration used by `tsserver` to analyze JavaScript sources.

The configuration enables:

- JSDoc-based type checking of JavaScript
- validation of module imports
- IDE navigation and symbol resolution
- validation of Node.js built-in module references

All production code remains standard ECMAScript modules.

## 4. JavaScript Type Checking

JavaScript type analysis is enabled by the following options:

```
checkJs: true
noEmit: true
```

`checkJs` enables type checking of `.js` and `.mjs` files using JSDoc annotations.

`noEmit` disables generation of output files.

## 5. Module System

TeqFW projects use the Node.js ECMAScript module model.

The module configuration is defined as:

```
module: nodenext
moduleResolution: nodenext
target: ESNext
```

## 6. Project Root

The project root is defined as:

```
baseUrl: "."
```

## 7. Node.js Type Definitions

Node.js built-in modules used in TeqFW projects include:

```
node:http
node:fs
node:path
node:stream
node:test
```

Type analysis of these modules requires the following development dependency:

```
@types/node
```

The version of `@types/node` corresponds to the Node.js runtime used by the project.

## 8. Type Map

Every TeqFW project contains the file:

```
types.d.ts
```

This file defines the namespace type mapping used by IDE tooling.

The file is included in the project analysis scope.

## 9. Source Scope

The analysis scope includes the following project sources:

```
src
test
types.d.ts
```

- `src` — production source code
- `test` — unit and integration tests
- `types.d.ts` — namespace type map

## 10. Compiler Constraints

The configuration includes the following constraints:

```
skipLibCheck: true
forceConsistentCasingInFileNames: true
```

`skipLibCheck` disables type checking of external declaration files.

`forceConsistentCasingInFileNames` enforces consistent file name casing across the project.

## 11. Canonical jsconfig.json Structure

The canonical configuration structure is:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "checkJs": true,
    "forceConsistentCasingInFileNames": true,
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "noEmit": true,
    "skipLibCheck": true,
    "target": "ESNext"
  },
  "include": ["src", "test", "types.d.ts"]
}
```
