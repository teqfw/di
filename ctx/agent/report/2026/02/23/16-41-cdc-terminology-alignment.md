# Iteration Report

## Goal
Find and replace usage of abbreviation `edd` with `cdc` in code to align terminology with Canonical Dependency Contract.

## Actions
- Searched `src2`, `test2`, and `types.d.ts` for `edd/EDD` occurrences.
- Replaced `EDD`/`edd` -> `CDC`/`cdc` in implementation and unit tests where used as dependency descriptor naming.
- Updated parser wording and errors in `src2/Def/Parser.mjs` from EDD to CDC.
- Updated local variable names in container graph traversal from `edd` to `cdc`.
- Updated test helpers, test case fields, and error expectations to CDC naming.
- Updated DTO field doc comment from "Original EDD string" to "Original CDC string".
- Ran full unit + integration test suite.

## Artifacts
- Updated: `src2/Def/Parser.mjs`
- Updated: `src2/Container.mjs`
- Updated: `src2/Container/Resolve/GraphResolver.mjs`
- Updated: `src2/Dto/DepId.mjs`
- Updated: `test2/unit/Def/Parser.test.mjs`
- Updated: `test2/unit/Container/Resolve/GraphResolver.test.mjs`
- Added: `ctx/agent/report/2026/02/23/16-41-cdc-terminology-alignment.md`

## Verification
Command:
`node --test "test2/unit/**/*.test.mjs" "test2/integration/**/*.test.mjs"`

Result:
- 15 tests passed
- 0 failed
