# Release Preparation 2.2.0

## Goal
Prepare a new npm package release for `@teqfw/di` with `RELEASE_TYPE=minor`: compute next version, update release metadata, update changelog, align agent interface docs, and commit the result.

## Performed Actions
- Read current package version from `package.json` (`2.1.0`).
- Computed next version using semver minor rule: `2.2.0`.
- Updated `package.json` version field to `2.2.0`.
- Added new top entry in `CHANGELOG.md` for `2.2.0` dated `2026-03-16`.
- Reviewed `ai/` documentation against runtime behavior and applied minimal corrections:
  - `ai/container.md`: aligned container state names with runtime (`notConfigured`, `operational`, `failed`).
  - `ai/dependency-id.md`: aligned lifecycle marker semantics (`$$` and `$$$` are transient).
- Created this iteration report according to reporting protocol.

## Produced Artifacts
- `package.json` (version updated to `2.2.0`)
- `CHANGELOG.md` (new `2.2.0` section)
- `ai/container.md` (state model terminology corrected)
- `ai/dependency-id.md` (lifecycle marker semantics corrected)
- `ctx/agent/report/2026/03/16/16-36-release-prepare-2.2.0.md` (iteration report)
