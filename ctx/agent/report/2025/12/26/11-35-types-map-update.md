# Report: types-map-update

## Summary of Changes
- Rebuilt `types.d.ts` to map every JS source via direct `import()` aliases.
- Split internal vs public type surface using non-global aliases and `declare global`.
- Switched class mappings to `InstanceType<typeof import(...).default>`; kept function/object mappings direct.

## Work Details
- Reviewed `ctx/docs/architecture/types-map.md` rules to align mapping forms and API boundary.
- Classified `src/` modules into internal implementation vs public API and exported entrypoints.
- Updated `types.d.ts` to include all source files with rule-compliant aliases.

## Results
- `types.d.ts` now exposes a public type surface through `declare global` and keeps internal types non-global.
- `tsserver` can reach all library sources through direct JS file references.
