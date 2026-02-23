# Iteration Report

## Goal
Fix JSDoc typing errors in `src2/Container/Instantiate/Instantiator.mjs` for construct signature and thenable detection while preserving runtime behavior.

## Performed Actions
- Updated `Instantiator.mjs` with JSDoc-only typing improvements.
- Added required typedefs:
  - `CallableFactory`
  - `ConstructableFactory`
  - `Factory`
- Reworked factory invocation typing flow:
  - narrowed callable check,
  - cast `selected` to `Factory`,
  - used explicit branch narrowing with `Ctor` and `Fn`,
  - removed ternary `new` form.
- Reworked `#isThenable` typing:
  - retained runtime narrowing to `object | function`,
  - introduced structural cast to `{ then?: unknown }`,
  - accessed `.then` through narrowed structural object.

## Produced Artifacts
- Modified: `src2/Container/Instantiate/Instantiator.mjs`

## Validation Results
- `node --test test2/unit/Container/Instantiate/Instantiator.test.mjs` — passed.
- `npm run test:unit` — passed (`10/10`).

## Compliance Notes
- No `any` introduced.
- `// @ts-check` preserved.
- No TypeScript files introduced.
- No runtime semantics changed (sync invariant, error semantics, lifecycle/wrapper boundaries unchanged).
