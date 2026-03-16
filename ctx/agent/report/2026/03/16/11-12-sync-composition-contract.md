# Sync Composition Contract Clarification

## Goal

Fix and simplify the project contract around object composition: keep factory and wrapper execution strictly synchronous, document this explicitly in context docs, and keep fail-fast error behavior for Promise returns.

## Actions

- Updated architecture contract in `ctx/docs/architecture/linking-model.md`:
  - factory composition now explicitly forbids `Promise` returns;
  - generic thenable probing via `.then` access is explicitly prohibited.
- Updated implementation-level container contract in `ctx/docs/code/components/container.md`:
  - added a dedicated "Synchronous Composition Boundary" section;
  - fixed rules for factory/wrapper sync behavior and fail-fast handling;
  - documented nominal async detection using `instanceof Promise` only.
- Simplified runtime code:
  - `src/Container/Instantiate/Instantiator.mjs`: removed helper-based thenable probing and left direct `result instanceof Promise` fail-fast check;
  - `src/Container/Wrapper/Executor.mjs`: removed helper-based thenable probing and left direct `current instanceof Promise` fail-fast check.
- Aligned error wording and tests with the updated contract (`non-Promise`):
  - `test/integration/50-wrappers.integration.test.mjs`
  - `test/unit/Container/Wrapper/Executor.test.mjs`
- Executed full test suites:
  - `npm run test:unit`
  - `npm run test:integration`

## Artifacts

- `ctx/docs/architecture/linking-model.md`
- `ctx/docs/code/components/container.md`
- `src/Container/Instantiate/Instantiator.mjs`
- `src/Container/Wrapper/Executor.mjs`
- `test/integration/50-wrappers.integration.test.mjs`
- `test/unit/Container/Wrapper/Executor.test.mjs`
- `ctx/agent/report/2026/03/16/11-12-sync-composition-contract.md`

## Result

The sync-only composition decision is now explicit in context documentation and represented in simplified fail-fast implementation: Promise-returning factory/wrapper paths are treated as immediate contract errors, with all tests passing.
