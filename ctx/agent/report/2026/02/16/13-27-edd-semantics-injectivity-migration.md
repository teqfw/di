# Iteration Report: EDD Semantics and Injectivity Migration

## Goal
Align `ctx/docs/` documentation with updated architectural optics: ASCII `IdentifierName` EDD surface syntax, structural identity via `DepId`, parser-internal deterministic normalization, semantic injectivity, permitted deterministic syntactic sugar without semantic aliasing, and default profile immutability within a library version.

## Performed Actions
- Updated `ctx/docs/architecture/edd-model.md`:
  - Reframed parser injectivity from raw-string injectivity to semantic injectivity.
  - Added explicit prohibition of `.`, `(`, `)`, and `:` in EDD.
  - Clarified that deterministic syntactic sugar is allowed when profile-defined.
  - Clarified that `DepId` is the only canonical identity representation.
  - Added explicit statement that normalization is internal and no canonical string EDD is introduced.
  - Added default profile immutability and breaking-change rule for default grammar changes.
- Updated `ctx/docs/architecture/invariants.md`:
  - Replaced raw EDD injectivity statement with semantic-interpretation injectivity statement.
- Updated `ctx/docs/constraints/overview.md`:
  - Replaced implicit aliasing wording with semantic aliasing wording.
  - Replaced raw EDD distinctness wording with semantic-interpretation distinctness wording.
  - Added clarification permitting deterministic syntactic sugar that preserves semantic injectivity.
- Updated `ctx/docs/architecture/overview.md`:
  - Added explicit forbidden EDD symbols (`.`, `(`, `)`, `:`).
  - Removed canonical-string implication by clarifying parser-internal normalization.
  - Added explicit statement that architectural identity is exclusively structural `DepId`.
- Updated `ctx/docs/product/overview.md`:
  - Clarified parser-defined deterministic syntactic sugar boundary.
  - Clarified that identity is structural `DepId`, not raw EDD string equality.
  - Added default profile immutability and default grammar breaking-change statement.
- Ran consistency sweep across `ctx/docs/**` for legacy raw-string injectivity/alias wording and canonical-string implications.

## Produced Artifacts
- `ctx/docs/architecture/edd-model.md`
- `ctx/docs/architecture/invariants.md`
- `ctx/docs/constraints/overview.md`
- `ctx/docs/architecture/overview.md`
- `ctx/docs/product/overview.md`
- `ctx/agent/report/2026/02/16/13-27-edd-semantics-injectivity-migration.md`

## Result
Documentation now consistently expresses structural identity via `DepId`, parser-internal deterministic normalization, semantic injectivity, constrained syntactic sugar, and default profile immutability with grammar-change breaking semantics, without introducing any new architectural layers or modifying immutable core linking semantics.
