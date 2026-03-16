# Iteration Report

## Goal
Fix GitHub issue #35 by preventing identity collisions between default and named exports from the same ES module in container graph/build/singleton/lifecycle behavior, add regression tests, and align cognitive-context docs.

## Actions
- Reviewed issue details via `gh issue view 35 --repo teqfw/di --json ...`.
- Read applicable instruction/context chain: root `AGENTS.md`, `src/AGENTS.md`, `ctx/AGENTS.md`, `ctx/docs/AGENTS.md`, `ctx/docs/code/AGENTS.md`, `ctx/docs/code/components/AGENTS.md`, `ctx/agent/AGENTS.md`, and `ctx/agent/report/AGENTS.md`.
- Updated `src/Container.mjs` keying used by build graph lookup and in-memory build cache from module-only keying to full structural identity keying (`platform`, `moduleName`, `exportName`, `composition`, `life`, `wrappers`).
- Updated `src/Container/Resolve/GraphResolver.mjs` node-key semantics to use full structural identity, eliminating collisions for distinct exports from one module.
- Added/adjusted tests:
  - `test/unit/Container/Resolve/GraphResolver.test.mjs`: switched graph key assertions to structural keys; added regression test ensuring `default` and `Factory` exports from same module are different graph nodes.
  - `test/unit/Container/Lifecycle/Registry.test.mjs`: added explicit regression test ensuring singleton cache separation by `exportName` for same module.
  - `test/integration/40-lifecycle.integration.test.mjs`: added end-to-end regression test for `Fx_SharedExports$` vs `Fx_SharedExports__Factory$`.
  - `test/integration/fixture/SharedExports.mjs`: fixture module exporting both `default` and named `Factory`.
- Updated cognitive-context documentation:
  - `ctx/docs/code/components/container.md`: explicitly states that graph/build/mock/singleton keys MUST include full structural identity and that `Ns_Module$` and `Ns_Module__Factory$` must never collide.
- Executed full test suite:
  - `npm run test:unit`
  - `npm run test:integration`

## Artifacts
- Modified: `src/Container.mjs`
- Modified: `src/Container/Resolve/GraphResolver.mjs`
- Modified: `test/unit/Container/Resolve/GraphResolver.test.mjs`
- Modified: `test/unit/Container/Lifecycle/Registry.test.mjs`
- Modified: `test/integration/40-lifecycle.integration.test.mjs`
- Added: `test/integration/fixture/SharedExports.mjs`
- Modified: `ctx/docs/code/components/container.md`
- Added: `ctx/agent/report/2026/03/16/15-32-fix-issue-35-export-identity.md`

## Outcome
Issue #35 is fixed: dependencies that differ by export name no longer collide across graph/build/singleton identity paths, regression coverage is in place, docs explicitly define export-aware cache key requirements, and all tests pass.
