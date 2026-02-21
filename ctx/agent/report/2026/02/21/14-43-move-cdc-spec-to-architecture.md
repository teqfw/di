# Report — Move CDC Specification to Architecture Level

Date: 2026-02-21

## Goal

Move formal Default CDC Profile specification (grammar, transformation, validation) out of product documentation into architecture documentation, eliminate EDD terminology in favor of CDC across all documentation levels, and keep product documentation lightweight and audience-oriented while positioning `@teqfw/di` as a foundational base of Tequila Framework (TeqFW).

## Actions Performed

- Moved Default CDC Profile specification from `ctx/docs/product/` to `ctx/docs/architecture/cdc-profile/default/` and added architecture-level navigational `AGENTS.md` files for the new subtrees.
- Renamed the architecture model from EDD to CDC by replacing `edd-model.md` with `cdc-model.md` and aligned all architecture, constraints, and code-level documents with CDC terminology and references.
- Simplified product-level CDC references to point to the product positioning document and architecture-level formal specification, and removed the product-level `parser/` subtree to keep `ctx/docs/product/` compact.
- Added explicit TeqFW positioning in product overview and product-level purpose text to reflect `@teqfw/di` as a base layer for an agent-oriented isomorphic application platform.

## Artifacts Produced

- Added files:
  - `ctx/docs/architecture/cdc-profile/AGENTS.md`
  - `ctx/docs/architecture/cdc-profile/default/AGENTS.md`
- Moved files:
  - `ctx/docs/architecture/cdc-profile/default/grammar.md`
  - `ctx/docs/architecture/cdc-profile/default/transformation.md`
  - `ctx/docs/architecture/cdc-profile/default/validation.md`
  - `ctx/docs/architecture/cdc-model.md`
- Removed files:
  - `ctx/docs/product/parser/AGENTS.md`
  - `ctx/docs/product/parser/default-profile/AGENTS.md`
- Modified files:
  - `ctx/docs/architecture/AGENTS.md`
  - `ctx/docs/architecture/depid-model.md`
  - `ctx/docs/architecture/invariants.md`
  - `ctx/docs/architecture/linking-model.md`
  - `ctx/docs/architecture/overview.md`
  - `ctx/docs/constraints/overview.md`
  - `ctx/docs/code/container.md`
  - `ctx/docs/code/depid.md`
  - `ctx/docs/code/parser.md`
  - `ctx/docs/code/resolver.md`
  - `ctx/docs/product/AGENTS.md`
  - `ctx/docs/product/default-cdc-profile.md`
  - `ctx/docs/product/overview.md`
  - `ctx/docs/product/scope.md`

## Verification

- Confirmed no occurrences of EDD remain under `ctx/docs/`.
- Confirmed product docs no longer contain Default CDC Profile grammar details and reference the architecture-level specification subtree instead.
