# Iteration Report

## Goal

Refactor the testing documentation in `ctx/docs/code/layout/` into a layered normative structure with separate unit and integration contracts, while preserving existing unit-testing semantics and aligning documentation structure with current project layout.

## Performed Actions

1. Read governing context rules from:
- `AGENTS.md`
- `ctx/AGENTS.md`
- `ctx/docs/AGENTS.md`
- `ctx/docs/code/AGENTS.md`
- `ctx/docs/code/layout/AGENTS.md`

2. Audited current testing contract and structural references:
- `ctx/docs/code/layout/testing.md`
- `ctx/docs/code/layout/structure.md`
- `ctx/docs/code/components/container.md`
- `test2/integration/` directory contents

3. Replaced `ctx/docs/code/layout/testing.md` with an overview-layer document that:
- declares two normative layers (unit and integration),
- defines responsibility boundaries,
- references `testing/unit.md` and `testing/integration.md`,
- avoids duplicating detailed layer rules.

4. Added `ctx/docs/code/layout/testing/unit.md` and moved the previous unit-testing contract content there with semantic preservation of unit invariants.

5. Added `ctx/docs/code/layout/testing/integration.md` defining normative integration scope, placement, side-effect boundaries, structural model, and relationship to unit testing.

6. Updated `ctx/docs/code/layout/AGENTS.md` Level Map to include the new `testing/` directory and restored map consistency with actual files (`logging.md`), then updated `Version` to `20260227` due to invariant changes.

## Produced Artifacts

- Updated: `ctx/docs/code/layout/testing.md`
- Added: `ctx/docs/code/layout/testing/unit.md`
- Added: `ctx/docs/code/layout/testing/integration.md`
- Updated: `ctx/docs/code/layout/AGENTS.md`

## Verification Notes

- Unit and integration contracts are separated into distinct files.
- Overview document contains layer model and references, not detailed rule duplication.
- Directory references match existing structure:
  - `test2/unit/`
  - `test2/integration/`
- Existing structural reference from `ctx/docs/code/layout/structure.md` to `ctx/docs/code/layout/testing.md` remains valid.
- No source code or test code changes were made.
