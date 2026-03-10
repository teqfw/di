# Iteration Report

## Goal
Create `ai/package-api.ts` as a machine-readable contract of the public programmatic API of the npm package `@teqfw/di`, based on analysis of all components listed in `types.d.ts`.

## Actions
1. Read the applicable project instructions and reporting rules from:
- `AGENTS.md`
- `ctx/AGENTS.md`
- `ctx/agent/AGENTS.md`
- `ctx/agent/report/AGENTS.md`
- `ai/AGENTS.md`
2. Reviewed the package API boundary in:
- `package.json`
- `types.d.ts`
- `README.md`
- `ctx/docs/product/overview.md`
- `ctx/docs/code/components/container.md`
- `ctx/docs/code/components/parser.md`
- `ctx/docs/code/components/resolver.md`
- `ctx/docs/code/components/depid.md`
- `ctx/docs/code/components/namespace-registry.md`
3. Verified actual runtime behavior in source and tests:
- `src/Container.mjs`
- `src/Config/NamespaceRegistry.mjs`
- `src/Def/Parser.mjs`
- `src/Dto/DepId.mjs`
- `src/Container/Wrapper/Executor.mjs`
- `src/Container/Resolve/GraphResolver.mjs`
- related unit and integration tests under `test/`
4. Distinguished `types.d.ts` aliases into three categories:
- public runtime entrypoints supported by `package.json#exports`
- public structural contracts useful to consumers and tools
- internal implementation aliases present only for type-map completeness
5. Added `ai/package-api.ts` with:
- canonical import entrypoints
- runtime component contracts for `Container` and `NamespaceRegistry`
- structural contracts for `DepId`, parser protocol, enum vocabularies, and module contract
- full classification of aliases declared in `types.d.ts`
- implementation notes clarifying actual runtime semantics where needed
6. Updated `ai/AGENTS.md` so `package-api.ts` is read before the prose documents in `ai/`.

## Artifacts
- Added: `ai/package-api.ts`
- Updated: `ai/AGENTS.md`
- Added: `ctx/agent/report/2026/03/08/14-23-package-api-contract.md`

## Validation
- Executed: `npm run test:unit`
- Result: 15/15 tests passed

