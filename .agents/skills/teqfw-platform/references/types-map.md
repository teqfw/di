# Static Type Map Rules

## Source of truth

Read `ctx/docs/code/layout/jsconfig.md`, `ctx/docs/code/layout/structure.md`, and the current `types.d.ts` before changing static aliases.

## Type map

Maintain one root `types.d.ts` file. It declares global aliases for the package's JavaScript modules and ends with `export {}`. Keep it included in `jsconfig.json` and referenced through the `types` field in `package.json`.

Map aliases to the implementation symbols used by the package. Preserve existing aliases and their compatibility meaning, including aliases that use `$DTO` or `$Factory` where already established. Do not reinterpret a static alias as a runtime Dependency Specifier.

Use existing public DTO aliases for public DTO structural types when available. Add a new alias only when the implementation exposes a stable type that needs cross-module static reference.

## Boundaries

`types.d.ts` supports static analysis only. It does not change module loading, Dependency Specifier interpretation, lifecycle selection, wrapper application, or runtime linking.

Keep the map synchronized with exported implementation symbols and package publication fields.
