# Iteration Report

## Goal
Implement instantiate stage core component `Instantiator` for `@teqfw/di` v2 with strict immutable-core responsibility boundaries, plus mirrored unit tests.

## Performed Actions
- Read applicable instruction hierarchy and normative context documents:
  - `AGENTS.md`, `ctx/AGENTS.md`, `ctx/docs/AGENTS.md`, `ctx/docs/architecture/AGENTS.md`, `ctx/docs/code/AGENTS.md`, `src2/AGENTS.md`, `ctx/agent/report/AGENTS.md`.
  - Architecture specs: `ctx/docs/architecture/linking-model.md`, `ctx/docs/architecture/depid-model.md`, `ctx/docs/architecture/invariants.md`.
  - Code specs: `ctx/docs/code/structure.md`, `ctx/docs/code/jsdoc-spec.md`, `ctx/docs/code/testing.md`, `ctx/docs/code/container.md`, `ctx/docs/code/resolver.md`, `ctx/docs/code/parser.md`, `ctx/docs/code/depid.md`, conventions files for DTO/Enum.
- Implemented `src2/Container/Instantiate/Instantiator.mjs`.
- Implemented mirrored unit test `test2/unit/Container/Instantiate/Instantiator.test.mjs` with required scenarios.
- Updated `types.d.ts` with alias `TeqFw_Di_Container_Instantiate_Instantiator`.
- Ran tests:
  - `node --test test2/unit/Container/Instantiate/Instantiator.test.mjs`
  - `npm run test:unit`

## Produced Artifacts
- `src2/Container/Instantiate/Instantiator.mjs`
  - Added class `TeqFw_Di_Container_Instantiate_Instantiator` with synchronous method `instantiate(depId, moduleNamespace, resolvedDeps)`.
  - Implemented export selection semantics:
    - `exportName === null` returns whole namespace.
    - named export must exist, otherwise throws `Error`.
  - Implemented composition semantics:
    - `'as-is'` returns selected value directly.
    - `'factory'` requires callable export; invokes with `new` for constructible callables, direct call otherwise.
    - Throws on Promise/thenable return.
    - Throws on unsupported composition.
  - Added private helpers for constructible and thenable detection.
- `test2/unit/Container/Instantiate/Instantiator.test.mjs`
  - Added branch-covering tests for:
    1. as-is returns namespace
    2. as-is returns named export
    3. factory invokes function
    4. factory invokes class with `new`
    5. missing export throws
    6. non-callable factory throws
    7. async factory throws
    8. constructor error propagation
    9. deterministic repeated calls
  - Added extra negative checks for invalid composition and invalid namespace input.
- `types.d.ts`
  - Added exported type alias:
    - `TeqFw_Di_Container_Instantiate_Instantiator`

## Validation Results
- Target test file passed.
- Full unit suite passed (`10/10`).

## Notes
- `src2/AGENTS.md` references `ctx/docs/code/lifecycle.md`, but this file is absent in the current repository state.
