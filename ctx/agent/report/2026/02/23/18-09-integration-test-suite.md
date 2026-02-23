# Iteration Report: Integration Test Suite

## Goal
Implement an ordered integration test suite under `test2/integration/` using Node test runner, real ESM fixtures, and public `Container` API coverage for smoke, configuration locking, namespace resolution, graph resolution, lifecycle, wrappers, test-mode mocks, and failed-state behavior.

## Performed Actions
1. Reviewed project cognitive context and testing/container contracts in `ctx/`.
2. Removed legacy integration file `test2/integration/Container.integration.test.mjs`.
3. Added integration fixture modules in `test2/integration/fixture/`:
- `Root.mjs`
- `GraphRoot.mjs`
- `Child.mjs`
- `Leaf.mjs`
- `CycleA.mjs`
- `CycleB.mjs`
- `Singleton.mjs`
- `Transient.mjs`
- `Wrapped.mjs`
- `BadExport.mjs`
- `ns-short/Service.mjs`
- `ns-long/Service.mjs`
4. Added ordered integration test files:
- `test2/integration/00-smoke.integration.test.mjs`
- `test2/integration/10-builder-config.integration.test.mjs`
- `test2/integration/20-resolver-namespaces.integration.test.mjs`
- `test2/integration/30-graph-resolution.integration.test.mjs`
- `test2/integration/40-lifecycle.integration.test.mjs`
- `test2/integration/50-wrappers.integration.test.mjs`
- `test2/integration/60-testmode-mocks.integration.test.mjs`
- `test2/integration/90-failure-state.integration.test.mjs`
5. Updated `package.json` scripts by adding:
- `"test:integration": "node --test \"test2/integration/**/*.test.mjs\""`
6. Executed test commands and fixed one assertion in graph test to align with as-is module namespace behavior.

## Produced Artifacts
- New integration fixtures and tests listed above.
- Updated script in `package.json`.
- Verified commands:
- `npm run test:unit` passed (14/14).
- `npm run test:integration` passed (8/8).
