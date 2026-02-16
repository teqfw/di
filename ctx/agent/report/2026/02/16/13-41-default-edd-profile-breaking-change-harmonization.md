# Iteration Report: Default EDD Profile Breaking-Change Harmonization

## Goal
Harmonize breaking-change terminology for the default EDD profile between architecture and product documentation, with explicit structural `DepId` semantics.

## Performed Actions
- Updated `ctx/docs/architecture/edd-model.md`:
  - Refined breaking-change wording to explicitly define breaking change as semantic EDD interpretation change that alters resulting structural canonical `DepId`.
  - Added explicit non-breaking condition for cosmetic or surface grammar expansions that preserve semantic interpretation, preserve structural canonical `DepId`, and do not introduce semantic aliasing.
- Updated `ctx/docs/product/overview.md`:
  - Replaced ambiguous grammar-only breaking wording with the same semantic structural-`DepId` criterion used in architecture.
  - Added matching explicit non-breaking condition for cosmetic/surface grammar expansions under preserved semantics and no semantic aliasing.
- Verified alignment of both documents for breaking/non-breaking criteria and terminology.

## Produced Artifacts
- `ctx/docs/architecture/edd-model.md`
- `ctx/docs/product/overview.md`
- `ctx/agent/report/2026/02/16/13-41-default-edd-profile-breaking-change-harmonization.md`

## Result
Breaking-change semantics for the default EDD profile are now aligned and unambiguous across architecture and product docs: breaking change is semantic and structural (`DepId`-altering), while cosmetic/surface grammar expansions that preserve semantic interpretation and `DepId` without semantic aliasing are explicitly non-breaking.
