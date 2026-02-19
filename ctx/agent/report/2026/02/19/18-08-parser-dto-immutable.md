# Report: Return Immutable DepId DTO From Parser

Goal: Make `TeqFw_Di_Def_Parser` return the canonical `DepId` DTO and ensure parser output is frozen.

## Performed Actions

- Updated `src2/Def/Parser.mjs`:
  - imported `src2/Dto/DepId.mjs` factory;
  - added private parser field with a reusable DTO factory instance;
  - replaced plain object return with `factory.create(parsed, {immutable: true})`.
- Updated parser unit tests in `test2/unit/Def/Parser.test.mjs`:
  - added assertion that parser result is instance of `DepId.DTO`;
  - added assertion that returned DTO and `wrappers` are frozen.

## Produced Artifacts

- Updated `src2/Def/Parser.mjs`
- Updated `test2/unit/Def/Parser.test.mjs`
- Added `ctx/agent/report/2026/02/19/18-08-parser-dto-immutable.md`

## Validation

- Ran `npm run test:unit`.
- Result: all unit tests pass.
