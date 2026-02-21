# Report — Product-Level Tension Removal and Terminology Stabilization

## Goal

Eliminate product-level tensions in `ctx/docs/product/` by stabilizing method-first framing, removing parser configurability language, and unifying the immutability guarantee wording under the canonical term **immutable linking semantics**, while keeping the corpus LLM-first and free of architecture/pipeline sequencing.

## Actions Performed

- Reframed product identity as a *method* and positioned `@teqfw/di` consistently as the *reference implementation*.
- Removed product-level language implying parser replacement, configurable parsers, or alternative CDC grammars.
- Unified all product-level mentions of immutability-of-linking guarantee to **immutable linking semantics**.
- Removed pipeline/stage/sequencing wording from product documents.

## Modified Files

- `ctx/docs/product/AGENTS.md`
- `ctx/docs/product/default-cdc-profile.md`
- `ctx/docs/product/overview.md`
- `ctx/docs/product/principles.md`
- `ctx/docs/product/scope.md`

## Confirmations (Acceptance Criteria)

- Parser configurability mentions removed at product level: **confirmed** (no “configurable parser(s)”, “parser replacement”, or “alternative CDC grammars” remain).
- Terminology unified: **confirmed** (“immutable linking semantics” is the only product-level term for the immutability-of-linking guarantee).
- No stage/pipeline sequencing at product level: **confirmed** (no pipeline/stage/phase wording remains in `ctx/docs/product/`).
- Reference implementation framing: **confirmed** (`@teqfw/di` is described consistently as the reference implementation of the method).

## Final Canonical Product Positioning (≤ 40 words)

The product is the `@teqfw/di` method: an LLM-first discipline for deterministic late binding via explicit CDC under the Default CDC Profile and immutable linking semantics. The npm package `@teqfw/di` is the reference implementation enforcing these guarantees.

