# Iteration Report — LLM-First Declarative Linking Architecture

## Goal

Refactor product-level documentation in `ctx/docs/product/` to reposition `@teqfw/di` as an LLM-first deterministic linking architecture with static, machine-reconstructible dependency declarations, explicit human review boundaries, and a normative module-level dependency descriptor model without reflection-based extraction.

## Actions Performed

- Rewrote product overview, principles, and scope to make LLM-first static-declaration positioning explicit and to define non-reflective module-level dependency descriptors as normative.
- Updated product-level navigation and consistency rules to include LLM-first positioning and the descriptor-based declaration boundary.
- Rewrote default-profile parser documentation to emphasize deterministic, statically reconstructible surface grammar and mapping rules, and to remove ambiguity and internal contradictions in the default-profile specification set.

## Artifacts Produced

Updated documents:

- `ctx/docs/product/AGENTS.md`
- `ctx/docs/product/default-edd-profile.md`
- `ctx/docs/product/overview.md`
- `ctx/docs/product/principles.md`
- `ctx/docs/product/scope.md`
- `ctx/docs/product/parser/AGENTS.md`
- `ctx/docs/product/parser/default-profile/AGENTS.md`
- `ctx/docs/product/parser/default-profile/grammar.md`
- `ctx/docs/product/parser/default-profile/transformation.md`
- `ctx/docs/product/parser/default-profile/validation.md`
