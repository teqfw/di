# Report — Rename Lifecycle `instance` to `transient`

## Goal

Replace lifecycle terminology `instance` with `transient` across `ctx/docs/`, `src2/`, and `test2/` while preserving existing linking semantics, parser behavior, composition rules, and CDC structure.

## Actions Performed

- Scanned `ctx/docs/` for lifecycle-specific occurrences of `instance` and updated only lifecycle terminology.
- Updated lifecycle enum key in `src2/Enum/Life.mjs` from `INSTANCE` to `TRANSIENT` while keeping canonical value `'I'` unchanged.
- Updated parser lifecycle mapping/comparisons in `src2/Def/Parser.mjs` from `Life.INSTANCE` to `Life.TRANSIENT` without changing branch semantics.
- Updated unit tests in `test2/unit/Enum/Life.test.mjs` and `test2/unit/Def/Parser.test.mjs` to use `TRANSIENT`.
- Verified no lifecycle `instance` references remain in `ctx/docs`, `src2`, and `test2`.
- Executed unit tests to confirm behavioral stability.

## Modified Files

- `ctx/docs/code/conventions/teqfw/enum.md`
- `ctx/docs/code/depid.md`
- `src2/Enum/Life.mjs`
- `src2/Def/Parser.mjs`
- `test2/unit/Enum/Life.test.mjs`
- `test2/unit/Def/Parser.test.mjs`

## Verification

- Lifecycle pair in code enum: `SINGLETON`, `TRANSIENT`.
- No lifecycle references to `instance` remain in documentation/code/tests scope.
- `npm run test:unit` passed: 8/8 tests.

## Result

Lifecycle terminology is now consistently `singleton`/`transient` across documentation, implementation, and tests, with unchanged runtime semantics.
