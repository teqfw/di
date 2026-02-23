# Iteration Report: Code Docs Restructure

Path: `./ctx/agent/report/2026/02/23/15-42-code-docs-restructure.md`

## Goal

Restructure `ctx/docs/code/` into `components/`, `conventions/`, and `layout/`; relocate specified documents; update all internal references and `AGENTS.md` maps within `ctx/docs/code/`; preserve normative content.

## Performed Actions

1. Created new directories:
- `ctx/docs/code/components/`
- `ctx/docs/code/layout/`

2. Relocated component contracts:
- `ctx/docs/code/container.md` -> `ctx/docs/code/components/container.md`
- `ctx/docs/code/parser.md` -> `ctx/docs/code/components/parser.md`
- `ctx/docs/code/resolver.md` -> `ctx/docs/code/components/resolver.md`
- `ctx/docs/code/depid.md` -> `ctx/docs/code/components/depid.md`

3. Relocated structural documents:
- `ctx/docs/code/structure.md` -> `ctx/docs/code/layout/structure.md`
- `ctx/docs/code/testing.md` -> `ctx/docs/code/layout/testing.md`

4. Relocated JSDoc specification into conventions (default action):
- `ctx/docs/code/jsdoc-spec.md` -> `ctx/docs/code/conventions/jsdoc-spec.md`

5. Updated moved-document `Path:` headers to match new filesystem locations.

6. Rewrote `ctx/docs/code/overview.md` to describe three internal subdomains: `components/`, `conventions/`, `layout/`.

7. Updated `ctx/docs/code/AGENTS.md` Level Map for the new structure.

8. Added new local AGENTS files:
- `ctx/docs/code/components/AGENTS.md`
- `ctx/docs/code/layout/AGENTS.md`

9. Updated `ctx/docs/code/conventions/AGENTS.md` Level Map to include `jsdoc-spec.md`.

10. Rewrote internal cross-references inside `ctx/docs/code/**` from legacy flat paths to new `components/`, `layout/`, and `conventions/` locations.

## Produced Artifacts

- Updated files:
  - `ctx/docs/code/AGENTS.md`
  - `ctx/docs/code/overview.md`
  - `ctx/docs/code/conventions/AGENTS.md`
  - `ctx/docs/code/components/container.md`
  - `ctx/docs/code/components/parser.md`
  - `ctx/docs/code/components/resolver.md`
  - `ctx/docs/code/components/depid.md`
  - `ctx/docs/code/layout/structure.md`
  - `ctx/docs/code/layout/testing.md`
  - `ctx/docs/code/conventions/jsdoc-spec.md`

- Added files:
  - `ctx/docs/code/components/AGENTS.md`
  - `ctx/docs/code/layout/AGENTS.md`

- Removed old flat-path files:
  - `ctx/docs/code/container.md`
  - `ctx/docs/code/parser.md`
  - `ctx/docs/code/resolver.md`
  - `ctx/docs/code/depid.md`
  - `ctx/docs/code/structure.md`
  - `ctx/docs/code/testing.md`
  - `ctx/docs/code/jsdoc-spec.md`

## Verification

- Verified no remaining internal references to old flat paths under `ctx/docs/code/**`.
- Verified moved documents contain updated `Path:` headers.
- Verified `AGENTS.md` files under `ctx/docs/code/` reflect the new directory structure and boundaries.
- Verified `ctx/docs/code/output.md` remained untouched and ignored as non-context.
