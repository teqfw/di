# Report — Change Lifecycle TRANSIENT Code from `I` to `T`

## Goal

Update `TeqFw_Di_Enum_Life` so lifecycle `TRANSIENT` uses canonical literal `T` instead of `I`, and keep code, tests, and code-level documentation consistent.

## Actions Performed

- Updated `src2/Enum/Life.mjs`: `TRANSIENT: 'I'` -> `TRANSIENT: 'T'`.
- Updated lifecycle enum unit test expectation in `test2/unit/Enum/Life.test.mjs`.
- Updated code-level documentation in `ctx/docs/code/depid.md` (`'S' | 'T' | null`, `S | T`, and summary literal set).
- Updated enum convention example in `ctx/docs/code/conventions/teqfw/enum.md` (`TRANSIENT: "T"`).
- Verified there are no remaining targeted `TRANSIENT: 'I'` / `S | I` lifecycle references in `src2`, `test2`, and `ctx/docs/code`.
- Ran unit tests.

## Modified Files

- `src2/Enum/Life.mjs`
- `test2/unit/Enum/Life.test.mjs`
- `ctx/docs/code/depid.md`
- `ctx/docs/code/conventions/teqfw/enum.md`

## Verification

- `npm run test:unit` passed: 8/8.
- Lifecycle enum now defines `SINGLETON: 'S'`, `TRANSIENT: 'T'`.

## Result

Canonical lifecycle encoding for transient mode is now `T`, and implementation/tests/documentation are aligned.
