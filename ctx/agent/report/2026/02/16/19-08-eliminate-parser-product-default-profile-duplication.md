# Eliminate Parser/Product Default EDD Profile Duplication

## Goal

Remove redundant duplication between architecture-level default-profile parser documentation and product-level default-profile positioning while preserving semantics and ADSM level separation.

## Actions

1. Refactored `ctx/docs/architecture/edd-model.md` to remove product-level normativity/stability/breaking-change policy statements from the "Default Parser Profile" section.
2. Added explicit cross-references in `ctx/docs/architecture/edd-model.md` to canonical architecture parser-spec documents and to product-level policy source.
3. Expanded `ctx/docs/product/default-edd-profile.md` as the canonical product-level source for default-profile normativity, expected usage, compatibility guarantee boundary, and breaking-change stability policy without reintroducing grammar or transformation mechanics.
4. Updated `ctx/docs/product/AGENTS.md` Level Map to include `default-edd-profile.md` so the map matches actual directory contents.

## Artifacts

Updated files:

- `ctx/docs/architecture/edd-model.md`
- `ctx/docs/product/default-edd-profile.md`
- `ctx/docs/product/AGENTS.md`

Created report:

- `ctx/agent/report/2026/02/16/19-08-eliminate-parser-product-default-profile-duplication.md`
