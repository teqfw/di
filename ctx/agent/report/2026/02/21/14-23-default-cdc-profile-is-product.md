# Report — Default CDC Profile Is the Product Boundary

Date: 2026-02-21

## Goal

Clarify product positioning so that `@teqfw/di` supports exactly one CDC interpretation at product level (the Default CDC Profile), while preserving the technical ability to replace the parser as an out-of-product, non-compliant variant.

## Actions Performed

- Updated product documents to define Default CDC Profile as the single supported CDC interpretation and the basis for product guarantees and compatibility claims.
- Reframed parser replacement and alternative CDC grammars as technically possible but explicitly outside the product boundary.

## Artifacts Produced

- Modified files:
  - `ctx/docs/product/AGENTS.md`
  - `ctx/docs/product/default-cdc-profile.md`
  - `ctx/docs/product/overview.md`
  - `ctx/docs/product/principles.md`
  - `ctx/docs/product/scope.md`

## Verification

- Confirmed product docs no longer state that alternative CDC profiles are part of the supported product model.
