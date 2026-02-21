# Report — Reposition Product as LLM-First Declarative Method

Date: 2026-02-21

## Goal

Reposition product-level documentation under `ctx/docs/product/` to describe `@teqfw/di` as an LLM-first declarative method for structuring JavaScript modules around explicit Canonical Dependency Contracts (CDC) and deterministic late binding, with the library as the enforcing reference implementation, and with internal linking mechanics treated as an implementation detail.

## Actions Performed

- Reframed product identity from “container” to “method” and made LLM-first a structural premise (agents author structure, humans review semantics) in `overview.md` and `principles.md`.
- Removed pipeline-stage and procedural linking descriptions from product-level documents and replaced them with guarantee-oriented statements about determinism, immutability, and isomorphic execution.
- Added an explicit “Method, Not Framework” section to clarify discipline, contract surface, and responsibility boundaries at the product level.

## Artifacts Produced

- Modified files:
  - `ctx/docs/product/AGENTS.md`
  - `ctx/docs/product/overview.md`
  - `ctx/docs/product/principles.md`
  - `ctx/docs/product/scope.md`

## Verification

- Confirmed no pipeline stage ordering or procedural linking descriptions remain in the modified product documents; the only remaining mention of “linking-pipeline stages” is a boundary statement in `ctx/docs/product/default-cdc-profile.md`, which was intentionally preserved.
