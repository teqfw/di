# JSDoc Rules

## Source of truth

Read `ctx/docs/code/layout/structure.md` and the applicable component contract before changing annotations.

## Required annotations

Use JSDoc as the package's structural typing mechanism. Add a top-level JSDoc block for every exported class, factory, function, or object. Document public methods with `@param` and `@returns`. Document private methods, private fields, and non-trivial local variables structurally.

Define constructor dependency descriptors with explicit local `@typedef` declarations. Reuse an existing `types.d.ts` alias for a public DTO structural type instead of creating a duplicate typedef for that DTO.

Use static aliases according to their existing meaning. `$DTO` and `$Factory` in established aliases are allowed; they are static type names, not lifecycle or wrapper selectors.

Do not add TypeScript source files. Keep JSDoc aligned with the module's actual public contract and implementation behavior.
