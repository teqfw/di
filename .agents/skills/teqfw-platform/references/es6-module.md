# ES Module Structure Rules

## Source of truth

Read `ctx/docs/code/layout/structure.md` before changing source layout, imports, or module boundaries.

## Module system and layout

Use native ESM. Source files under `src/` use the `.mjs` extension. The product's token-based dependency wiring does not replace ESM module loading.

Keep module locations aligned with the source layout and Module Token mapping. Preserve the direction of the declared source-layer dependencies and do not introduce reverse imports or cycles.

Keep Node.js package-backed composition utilities under `src/Node/Registry/`. Isomorphic runtime code must not import them. Browser consumers provide prepared namespace mappings through `Container.addNamespaceRoot()`.

Use the canonical Node.js composition imports `@teqfw/di/node/registry/package` and `@teqfw/di/node/registry/namespace`. Treat `src/Config/NamespaceRegistry.mjs` only as a deprecated compatibility entry point.

## Component implementation

Follow the component contract in the applicable `ctx/docs/code/components/` document. Do not impose a blanket rule about prototype methods or constructor-local functions; the current package uses both classes and constructor-defined closures where their component contracts require them.
