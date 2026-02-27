# Iteration Report

## Goal
Remove redundant logger initialization in `src2/Container.mjs` (`initializeInfrastructure`) because logger is already created in `enableLogging()`.

## Actions
- Reviewed applicable agent rules for `src2/` and confirmed fail-fast/no-redundancy constraints.
- Inspected `src2/Container.mjs` and verified logger lifecycle:
  - default is `TeqFw_Di_Internal_Logger_Noop`;
  - real logger is created in `enableLogging()`.
- Removed duplicate conditional logger instantiation from `initializeInfrastructure`.
- Ran focused verification tests.

## Artifacts
- Updated: `src2/Container.mjs`
  - deleted redundant block:
    - `if (loggingEnabled && (logger === TeqFw_Di_Internal_Logger_Noop)) { logger = new TeqFw_Di_Internal_Logger(); }`
- Added report: `ctx/agent/report/2026/02/23/18-19-remove-redundant-logger-init.md`

## Verification
- `node --test test2/unit/Container.test.mjs` — pass
- `node --test test2/integration/00-smoke.integration.test.mjs` — pass
