# Fix Issue 33

## Goal

Implement issue #33 by removing container behavior that breaks protected proxy runtime components, while preserving synchronous factory/wrapper enforcement and lifecycle semantics.

## Actions

- Created branch `fix/issue-33`.
- Read issue details with `gh issue view 33 --repo teqfw/di --json ...`.
- Replaced unsafe `.then` property probing with `instanceof Promise` checks in:
  - `src/Container/Instantiate/Instantiator.mjs`
  - `src/Container/Wrapper/Executor.mjs`
- Updated container freeze handling in `src/Container.mjs`:
  - keep freeze attempt for regular values;
  - skip freeze when proxies reject integrity operations (`Object.freeze` throws).
- Added Promise-safe return adaptation in `src/Container.mjs` so `async get()` can resolve protected proxies whose `get('then')` trap throws.
  - Added stable `WeakMap` cache to preserve singleton identity for wrapped results.
- Added regression tests for proxy-protected values:
  - `test/unit/Container/Instantiate/Instantiator.test.mjs`
  - `test/unit/Container/Wrapper/Executor.test.mjs`
  - `test/integration/40-lifecycle.integration.test.mjs`
  - `test/integration/fixture/ProtectedProxy.mjs`
- Ran full test suites:
  - `npm run test:unit`
  - `npm run test:integration`

## Artifacts

- `src/Container.mjs`
- `src/Container/Instantiate/Instantiator.mjs`
- `src/Container/Wrapper/Executor.mjs`
- `test/unit/Container/Instantiate/Instantiator.test.mjs`
- `test/unit/Container/Wrapper/Executor.test.mjs`
- `test/integration/40-lifecycle.integration.test.mjs`
- `test/integration/fixture/ProtectedProxy.mjs`
- `ctx/agent/report/2026/03/16/10-37-fix-issue-33.md`

## Result

Issue #33 behavior is fixed: protected proxy runtime components no longer fail due container `.then` probing or singleton freeze conflicts, and all unit/integration tests pass.
