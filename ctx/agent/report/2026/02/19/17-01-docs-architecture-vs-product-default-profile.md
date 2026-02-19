# Report: Separate Architecture From Default EDD Profile

Goal: Refactor documentation so that `ctx/docs/architecture/` is parser-profile agnostic and `ctx/docs/product/` contains the canonical default EDD profile specification, with consistent cross-references and no contradictions.

## Performed Actions

- Moved default-profile parser specification documents out of `ctx/docs/architecture/` into `ctx/docs/product/parser/default-profile/` and renamed `overview.md` to `grammar.md`.
- Rewrote architecture documents to remove default-profile grammar details and to define a strict abstraction boundary: architecture depends on `DepId` structure and parser properties (determinism, injectivity) but not on any specific EDD surface grammar.
- Updated product documentation to explicitly declare the canonical default profile as a product contract and to declare parser replacement as a profile change while keeping the core linking architecture invariant.
- Fixed cross-references across `ctx/docs/` to point to the new product-level default-profile documents and removed references to a non-existent `error-model.md`.
- Updated and extended Level Maps to reflect the new product parser documentation subtree.

## Produced Artifacts

- Moved/renamed:
  - `ctx/docs/product/parser/default-profile/grammar.md`
  - `ctx/docs/product/parser/default-profile/transformation.md`
  - `ctx/docs/product/parser/default-profile/validation.md`
- Added:
  - `ctx/docs/product/parser/AGENTS.md`
  - `ctx/docs/product/parser/default-profile/AGENTS.md`
- Updated:
  - `ctx/docs/architecture/edd-model.md`
  - `ctx/docs/architecture/depid-model.md`
  - `ctx/docs/architecture/linking-model.md`
  - `ctx/docs/architecture/overview.md`
  - `ctx/docs/architecture/AGENTS.md`
  - `ctx/docs/product/default-edd-profile.md`
  - `ctx/docs/product/overview.md`
  - `ctx/docs/product/AGENTS.md`
  - `ctx/docs/code/parser.md`

## Validation

- Verified `ctx/docs/architecture/` contains no default-profile tokens or grammar markers (no `$`, `$$`, `$$$`, `node_`, `npm_`, `__...`).
- Verified no remaining references to `ctx/docs/architecture/parser/*` exist in `ctx/docs/`.
