# Documentation Consistency Alignment (Architecture ↔ Composition ↔ Code ↔ Environment)

Goal: Eliminate cross-level contradictions and semantic tensions across `ctx/docs/` while preserving the deterministic runtime linking model and avoiding duplication across ADSM levels.

Performed actions:
- Updated architecture linking pipeline semantics so `resolve` returns `ModuleNamespace` and `instantiate` performs export selection, export existence verification, and factory invocation.
- Removed architectural attribution of export verification to the resolver and aligned parser/resolver boundary statements with instantiation-owned export logic.
- Clarified the resolver totality invariant by defining the configured resolver domain and separating domain violations from loader/environment failures.
- Unified container lifecycle state model to three states (`NotConfigured`, `Operational`, `Failed`) across composition and code documentation and removed the intermediate `Configured` state.
- Clarified environment-level module caching semantics by separating runtime-canonical module namespace identity from resolver-level caching as a non-observable optimization.
- Disambiguated prohibited lazy graph resolution from permitted dynamic `import()` and reinforced the graphless on-demand linking model.
- Made the architectural parser error model strictly throw-based and aligned the parser overview contract accordingly.
- Clarified that freeze is a mandatory core stage whose implementation may reside in lifecycle enforcement while preserving stage ordering.
- Ran a cross-document audit search for the targeted contradictions and confirmed removal of `ExportDescriptor`, the 4-state container model, and non-throw parser error semantics.

Produced artifacts:
- Updated `ctx/docs/architecture/linking-model.md`.
- Updated `ctx/docs/architecture/overview.md`.
- Updated `ctx/docs/architecture/invariants.md`.
- Updated `ctx/docs/architecture/parser/overview.md`.
- Updated `ctx/docs/architecture/parser/error-model.md`.
- Updated `ctx/docs/composition/overview.md`.
- Updated `ctx/docs/environment/overview.md`.
- Updated `ctx/docs/constraints/overview.md`.
- Updated `ctx/docs/code/container.md`.
- Updated `ctx/docs/code/resolver.md`.

