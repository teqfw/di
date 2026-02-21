# Report — EDD → CDC Transition (Product Docs)

Date: 2026-02-21

## Goal

Replace product-level terminology “External Dependency Declaration (EDD)” with the canonical term “Canonical Dependency Contract (CDC)” across `ctx/docs/product/`, while preserving determinism/injectivity guarantees and enforcing the boundary:

- CDC — string-level canonical linking contract
- `DepId` — structural canonical identity object

## Actions Performed

- Updated all product-level documents in `ctx/docs/product/` to use CDC terminology, including “CDC string”, “CDC profile”, and “default CDC profile”.
- Reframed `overview.md` product positioning around CDC (identity/export/composition/lifecycle/wrappers) and removed “external” framing from dependency contracts.
- Enforced the parser boundary contract in documentation as `parse(cdc: string) → DepId` and clarified CDC vs `DepId` where identity/compatibility is described.
- Renamed the default profile positioning document from `default-edd-profile.md` to `default-cdc-profile.md` and updated all references and level maps accordingly.

## Artifacts Produced

- Modified files under `ctx/docs/product/`:
  - `ctx/docs/product/AGENTS.md`
  - `ctx/docs/product/default-cdc-profile.md` (renamed from `default-edd-profile.md`)
  - `ctx/docs/product/overview.md`
  - `ctx/docs/product/principles.md`
  - `ctx/docs/product/scope.md`
  - `ctx/docs/product/parser/AGENTS.md`
  - `ctx/docs/product/parser/default-profile/AGENTS.md`
  - `ctx/docs/product/parser/default-profile/grammar.md`
  - `ctx/docs/product/parser/default-profile/transformation.md`
  - `ctx/docs/product/parser/default-profile/validation.md`

## Verification

- Confirmed no residual occurrences of “EDD” remain under `ctx/docs/product/`.

