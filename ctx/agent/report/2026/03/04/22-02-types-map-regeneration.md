# Iteration Report

## Goal
Regenerate `types.d.ts` according to the latest revision of `ctx/docs/code/conventions/types-map.md`.

## Actions
1. Re-read the updated type-map convention.
2. Rebuilt `types.d.ts` to match the new deterministic format:
- single `declare global { ... }` block;
- global-only type declarations;
- alphabetical ordering of aliases.
3. Applied canonical mapping forms:
- class components: `import("...").default`;
- enum components: `typeof import("...").default`;
- named exports: `import("...").Export`.
4. Preserved compatibility aliases currently referenced by JSDoc in source/tests.

## Artifacts
- Updated: `types.d.ts`
- Report: `ctx/agent/report/2026/03/04/22-02-types-map-regeneration.md`

## Validation
- Executed: `node --test $(find test/unit -type f -name '*.test.mjs' | sort)`
- Result: 15/15 tests passed.
- Attempted: `npx tsc -p tsconfig.json`
- Result: failed due to network resolution (`EAI_AGAIN` for `registry.npmjs.org`) in current environment.
