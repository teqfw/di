# DTO and Enum Convention Alignment

## Goal

Bring the implementation under `src/Dto` and `src/Enum` into compliance with the updated specifications in `ctx/docs/code/convention`, verify the affected code with tests, and prepare a commit title without creating a commit.

## Actions

- Read the governing context for `src/`, including the DTO and Enum conventions in `ctx/docs/code/convention/teqfw/dto.md` and `ctx/docs/code/convention/teqfw/enum.md`.
- Converted DTO modules to the specified publication form: DTO class as the `default` export and factory as the named `Factory` export.
- Updated DTO consumers in runtime code and unit tests to use named factory imports.
- Removed the optional `options` parameter from DTO factory `create(...)` methods and made DTO freezing unconditional.
- Normalized Enum modules to export `Object.freeze(...)` directly from the default export.
- Adjusted `types.d.ts` aliases to reflect the new DTO export model and added factory instance aliases.
- Ran unit tests with `npm run test:unit`.

## Artifacts

- Updated DTO modules:
  - `src/Dto/DepId.mjs`
  - `src/Dto/Resolver/Config.mjs`
  - `src/Dto/Resolver/Config/Namespace.mjs`
- Updated Enum modules:
  - `src/Enum/Composition.mjs`
  - `src/Enum/Life.mjs`
  - `src/Enum/Platform.mjs`
- Updated runtime consumers:
  - `src/Def/Parser.mjs`
  - `src/Container.mjs`
- Updated tests:
  - `test/unit/Container.test.mjs`
  - `test/unit/Container/Resolver.test.mjs`
  - `test/unit/Def/Parser.test.mjs`
  - `test/unit/Dto/DepId.test.mjs`
  - `test/unit/Dto/Resolver/Config.test.mjs`
  - `test/unit/Dto/Resolver/Config/Namespace.test.mjs`
- Updated typings:
  - `types.d.ts`

## Result

The DTO and Enum implementation forms now match the current convention documents. DTO factories now return immutable objects unconditionally. Unit test suite passed successfully: 15 tests, 15 passed, 0 failed.
