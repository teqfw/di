# Iteration Report

## Goal
Verify whether `types.d.ts` complies with `ctx/docs/code/conventions/types-map.md` and align code with the documented type-map conventions.

## Actions
1. Read context constraints from `AGENTS.md` hierarchy and conventions document `ctx/docs/code/conventions/types-map.md`.
2. Compared documented invariants with current `types.d.ts`.
3. Detected mismatches:
- non-canonical mapping form (`InstanceType<typeof import(...).default>` instead of `import(...).default`);
- extra DTO-related aliases not allowed by the convention;
- missing deterministic two-section structure markers;
- broader global declaration scope than public API requirement.
4. Rewrote `types.d.ts` into deterministic two-section layout:
- `INTERNAL TYPE BINDINGS` with sorted exported namespace mappings;
- `PUBLIC GLOBAL API` with global mappings only for public package API.
5. Validated runtime stability by executing unit tests directly over files.

## Artifacts
- Updated: `types.d.ts`
- Created report: `ctx/agent/report/2026/03/04/20-38-types-map-alignment.md`

## Validation
- `npm run test:unit` fails due to existing script misconfiguration (`node --test test/unit` points to directory and fails module resolution).
- Executed fallback validation:
  - `node --test $(find test/unit -type f -name '*.test.mjs' | sort)`
  - Result: 15/15 tests passed.
