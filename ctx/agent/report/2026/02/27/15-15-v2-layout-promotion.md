# Iteration Report

## Goal

Replace legacy v1 layout with v2 layout by removing `src`/`test`, promoting `src2`/`test2` to canonical directories, and restart `CHANGELOG.md` from the new stage.

## Performed Actions

1. Read governing rules from:
- `AGENTS.md`
- `ctx/AGENTS.md`
- `ctx/agent/AGENTS.md`
- `ctx/agent/report/AGENTS.md`
- `src2/AGENTS.md`

2. Replaced the directory layout:
- removed legacy `src/` and `test/`;
- moved `src2/` to `src/`;
- moved `test2/` to `test/`.

3. Updated path references from old layout to canonical layout:
- replaced `src2` -> `src`;
- replaced `test2` -> `test`;
- updated `package.json`, `tsconfig.json`, `types.d.ts`, and moved test sources.

4. Fixed `package.json` file list duplication introduced during path replacement.

5. Replaced `CHANGELOG.md` content with a new v2 lineage starting at `2.0.0 - 2026-02-27`.

## Produced Artifacts

- Updated: `CHANGELOG.md`
- Updated: `package.json`
- Updated: `tsconfig.json`
- Updated: `types.d.ts`
- Added (moved): `src/**` (former `src2/**`)
- Added (moved): `test/**` (former `test2/**`)
- Removed: legacy v1 `src/**` and `test/**`

## Verification Notes

- `npm run test:unit` passed (14/14).
- `npm run test:integration` passed (8/8).
- No `src2`/`test2` references remain outside `ctx/`.
