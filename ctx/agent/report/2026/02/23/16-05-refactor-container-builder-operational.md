# Iteration Report

## Goal
Refactor `src2/Container.mjs` and related tests to comply with updated container contract: lazy resolver initialization, builder-only namespace roots, explicit test mode and mock registry, strict state transitions, and immutable configuration snapshot at first `get()`.

## Performed Actions
- Read and applied normative contracts from:
  - `ctx/docs/code/components/container.md`
  - `ctx/docs/code/components/resolver.md`
  - `ctx/docs/code/components/parser.md`
  - `ctx/docs/code/layout/structure.md`
  - `ctx/docs/code/layout/testing.md`
- Refactored `src2/Container.mjs`:
  - removed eager resolver and graph resolver construction from constructor;
  - added builder-stage namespace accumulation via `addNamespaceRoot(prefix, target, defaultExt)`;
  - added lazy infrastructure initialization in first `get()` with immutable resolver config snapshot;
  - added `enableTestMode()` and builder-stage `register(cdc, mock)`;
  - implemented mock canonical keying by structural identity excluding `origin`;
  - inserted mock lookup after preprocess and before resolve;
  - ensured mock path bypasses resolver/instantiation/lifecycle and still freezes return value;
  - enforced strict builder-state checks for all configuration methods.
- Updated unit tests in `test2/unit/Container.test.mjs`:
  - added coverage for new public builder methods;
  - added namespace root accumulation and lock-after-first-get behavior;
  - added test mode enforcement and register guard;
  - added mock bypass and freeze verification;
  - added preprocess-before-mock-lookup behavior;
  - validated failed-state lock semantics.
- Updated integration tests in `test2/integration/Container.integration.test.mjs`:
  - added container-driven namespace root configuration and teq resolution;
  - validated dependency graph resolution and freeze behavior;
  - validated test mode mock bypass behavior.
- Executed tests:
  - `npm run test:unit`;
  - `node --test "test2/integration/**/*.test.mjs"`.

## Produced Artifacts
- Updated: `src2/Container.mjs`
- Updated: `test2/unit/Container.test.mjs`
- Updated: `test2/integration/Container.integration.test.mjs`
- Added report: `ctx/agent/report/2026/02/23/16-05-refactor-container-builder-operational.md`

## Result
All unit and integration tests passed after refactoring. Container now follows the specified builder-to-operational transition model with lazy resolver construction, immutable configuration snapshot, namespace root accumulation API, and explicit test-mode mock isolation.
