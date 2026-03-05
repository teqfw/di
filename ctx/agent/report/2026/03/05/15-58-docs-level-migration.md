# Iteration Report

## Goal
Migrate `ctx/docs/` from the legacy 6-level documentation layout to the new 4-level model defined by `ctx/docs/AGENTS.md`: `product -> architecture -> environment -> code`. Merge the former composition knowledge into the architecture level and redistribute constraints into `product/constraints.md` and `architecture/constraints.md`.

## Migration Plan
- Make the directory structure match the new level model.
- Move composition-level meaning into the architecture level.
  - Source: `ctx/docs/composition/overview.md`.
  - Target: `ctx/docs/architecture/execution-model.md`.
- Split constraints by level.
  - Source: `ctx/docs/constraints/overview.md`.
  - Targets: `ctx/docs/product/constraints.md` and `ctx/docs/architecture/constraints.md`.
- Update navigational anchors and cross-references.
  - Update `ctx/docs/architecture/AGENTS.md` and `ctx/docs/product/AGENTS.md` Level Maps.
  - Update code-level references to point to the new architecture/product constraint and execution-model documents.
- Remove obsolete legacy directories after references are updated.
  - Remove `ctx/docs/composition/` and `ctx/docs/constraints/`.
- For every changed document, verify ADSM documentation quality criteria.

## Actions Performed
- Created architecture-level execution model document and removed the composition level directory.
- Split constraints into product-level and architecture-level constraint documents and removed the legacy constraints directory.
- Updated Level Maps at architecture and product levels to include new documents.
- Updated code-level normative references and overview texts to match the new level model.
- Updated environment-level assumptions to avoid contradicting the architecture-level execution model.

## Artifacts
Created:
- `ctx/docs/architecture/constraints.md`
- `ctx/docs/architecture/execution-model.md`
- `ctx/docs/product/constraints.md`

Updated:
- `ctx/docs/architecture/AGENTS.md`
- `ctx/docs/architecture/overview.md`
- `ctx/docs/code/AGENTS.md`
- `ctx/docs/code/components/container.md`
- `ctx/docs/code/components/resolver.md`
- `ctx/docs/code/layout/testing.md`
- `ctx/docs/code/layout/testing/integration.md`
- `ctx/docs/code/overview.md`
- `ctx/docs/environment/overview.md`
- `ctx/docs/product/AGENTS.md`

Removed:
- `ctx/docs/composition/overview.md`
- `ctx/docs/constraints/overview.md`
- Directories `ctx/docs/composition/` and `ctx/docs/constraints/`

## Quality Check (ADSM, 8 Criteria)
Verified for each changed/created document: declarativity, internal consistency, completeness within level boundary, coherence, density, compactness, non-redundancy, and absence of the obvious.

Documents reviewed:
- `ctx/docs/architecture/constraints.md`: constraints phrased as prohibitions and stability envelope; request-local graph is permitted only as internal transient state.
- `ctx/docs/architecture/execution-model.md`: former composition content restated as architecture execution invariants; no procedural workflows.
- `ctx/docs/product/constraints.md`: product identity constraints separated from architecture mechanics; default-profile stability framed as constraints.
- `ctx/docs/environment/overview.md`: execution-environment assumptions aligned to avoid contradicting architecture execution model.
- `ctx/docs/code/AGENTS.md`, `ctx/docs/code/overview.md`, `ctx/docs/code/layout/testing.md`, `ctx/docs/code/layout/testing/integration.md`: removed references to removed levels, kept scope boundaries explicit and compact.
- `ctx/docs/code/components/container.md`, `ctx/docs/code/components/resolver.md`: normative references updated without restating higher-level invariants.
- `ctx/docs/architecture/AGENTS.md`, `ctx/docs/product/AGENTS.md`: Level Maps updated to match actual structure.
- `ctx/docs/architecture/overview.md`: wording adjusted to avoid referencing the removed composition level as a documentation branch.

## Validation
- Unit tests: `node --test $(find test/unit -type f -name "*.test.mjs" | sort)` (pass)
- Integration tests: `node --test $(find test/integration -type f -name "*.test.mjs" | sort)` (pass)
