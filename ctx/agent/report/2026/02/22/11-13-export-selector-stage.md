# Iteration Report

## Goal
Implement instantiate-stage internal module `ExportSelector` with strict export-selection-only responsibility and add mirrored unit tests with full branch coverage.

## Performed Actions
1. Read applicable governance and normative documents: root/context AGENTS, `src2/AGENTS.md`, code contracts, linking model, testing and JSDoc specs.
2. Added `src2/Container/Instantiate/ExportSelector.mjs`.
3. Implemented class `TeqFw_Di_Container_Instantiate_ExportSelector` with one public method `select(namespace, depId)`.
4. Enforced required failure conditions:
   - non-object namespace,
   - `depId.exportName === null`,
   - missing export in namespace.
5. Added mirrored unit test `test2/unit/Container/Instantiate/ExportSelector.test.mjs`.
6. Covered required scenarios: default export, named export, missing export, invalid namespace, null export name, deterministic repeated calls.
7. Ran tests and coverage checks.

## Produced Artifacts
- `src2/Container/Instantiate/ExportSelector.mjs`
- `test2/unit/Container/Instantiate/ExportSelector.test.mjs`
- Coverage result for new module: 100% lines / 100% branches / 100% functions.

## Verification
- `node --test test2/unit/Container/Instantiate/ExportSelector.test.mjs` — passed.
- `npm run test:unit` — passed (all unit tests).
- `node --test --experimental-test-coverage test2/unit/Container/Instantiate/ExportSelector.test.mjs` — passed with 100% branch coverage for `ExportSelector.mjs`.
