# Report: Align Default Parser With Enum DTO Values

Goal: Update `src2/Def/Parser.mjs` so parser output uses canonical enum values from `src2/Enum/*` for DTO fields.

## Performed Actions

- Updated parser implementation to import and use enum constants:
  - `TeqFw_Di_Enum_Platform`
  - `TeqFw_Di_Enum_Life`
  - `TeqFw_Di_Enum_Composition`
- Replaced string literals in parser output with enum values:
  - `platform`: `SRC` / `NODE` / `NPM`
  - `life`: `SINGLETON` / `INSTANCE` / `null`
  - `composition`: `AS_IS` / `FACTORY`
- Preserved parser fail-fast behavior and deterministic segmentation.
- Kept semantic equivalence behavior for omitted export in lifecycle-based factory cases (`default`).
- Updated parser unit tests to assert enum values instead of textual labels.
- Fixed remaining expectations in implicit equivalence assertions (`right` branch) to use enum values consistently.

## Produced Artifacts

- Updated `src2/Def/Parser.mjs`
- Updated `test2/unit/Def/Parser.test.mjs`
- Added `ctx/agent/report/2026/02/19/18-06-parser-enum-alignment.md`

## Validation

- Ran `npm run test:unit`.
- Result: all unit tests pass.
