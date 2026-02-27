# Iteration Report

## Goal
Move new NamespaceRegistry tests from `test2/` to canonical `test/`, and update documentation in `ctx/docs/` so normative references use `src`/`test` instead of obsolete `src2`/`test2`.

## Actions
- Moved unit test file from `test2/unit/Config/NamespaceRegistry.test.mjs` to `test/unit/Config/NamespaceRegistry.test.mjs`.
- Moved integration test file from `test2/integration/NamespaceRegistry.integration.test.mjs` to `test/integration/70-namespace-registry.integration.test.mjs`.
- Removed now-empty `test2/` directory tree.
- Updated code-level documentation to remove obsolete `src2`/`test2` references and align to current repository layout:
  - `ctx/docs/code/layout/structure.md`
  - `ctx/docs/code/layout/testing/unit.md`
  - `ctx/docs/code/layout/testing/integration.md`
  - `ctx/docs/code/layout/AGENTS.md`
  - `ctx/docs/code/layout/logging.md`
  - `ctx/docs/code/components/depid.md`
  - `ctx/docs/code/overview.md`
- Kept archival files under `ctx/agent/report/**` unchanged because report-level invariants define reports as archival records that must not be edited after creation.

## Validation
- Ran `npm run test:unit`.
- Ran `npm run test:integration`.
- Both suites passed, including moved NamespaceRegistry tests.
- Verified no remaining `src2`/`test2` mentions under `ctx/docs/`.

## Artifacts
- `test/unit/Config/NamespaceRegistry.test.mjs`
- `test/integration/70-namespace-registry.integration.test.mjs`
- `ctx/docs/code/layout/structure.md`
- `ctx/docs/code/layout/testing/unit.md`
- `ctx/docs/code/layout/testing/integration.md`
- `ctx/docs/code/layout/AGENTS.md`
- `ctx/docs/code/layout/logging.md`
- `ctx/docs/code/components/depid.md`
- `ctx/docs/code/overview.md`
- `ctx/agent/report/2026/02/27/19-07-src-test-doc-alignment.md`
