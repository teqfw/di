# 07-15-adsm-docs-fix

## Summary of Changes
- Updated architecture documentation to align namespace addressing with deterministic module-to-path mapping and clarified architectural boundaries.
- Compacted type map and product overview prose while preserving normative references and intent.
- Linked related documents to the namespace addressing mapping invariants.

## Work Details
- Adjusted `ctx/docs/architecture/namespace-addressing.md` to state deterministic mapping, longest-match root selection, and refactor constraints, and kept the canonical DSL assumption.
- Updated `ctx/docs/architecture/AGENTS.md` to align boundaries with model invariants and corrected the level map to include all architecture docs.
- Added references to `ctx/docs/architecture/namespace-addressing.md` from `ctx/docs/architecture/dependency-language.md` and `ctx/docs/architecture/types-map.md`.
- Compacted `ctx/docs/architecture/types-map.md` to reduce repeated negations while keeping rules intact.
- Compacted `ctx/docs/product/overview.md` to remove duplicated normative statements and link to authoritative documents.

## Results
- Architecture and product documentation now reflect deterministic mapping invariants and cleaner authority boundaries without changing model semantics.
- No automated tests were run because the work was documentation-only.
