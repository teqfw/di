# Changelog

## 2.5.1 - 2026-04-12 - Documentation refresh and dependency fix

* Fixed named-only `__deps__` resolution in the container and updated the related tests.
* Rewrote the README and refreshed the `ai/` agent documentation for the current release line.
* Updated package version metadata to `2.5.1`.

## 2.5.0 - 2026-04-04 - Parser and documentation refinement

* Clarified JSDoc typing and module headers to align with TeqFW specifications.
* Allowed parser recognition of Node.js built-ins that include underscores in their names.
* Updated package version metadata to `2.5.0`.

## 2.4.0 - 2026-03-31 - Test coverage cleanup

* Removed low-value unit tests in favor of broader integration coverage.
* Moved the useful preprocess/postprocess order scenario into integration tests.
* Updated package version metadata to `2.4.0`.

## 2.3.1 - 2026-03-25 - Patch release preparation

* Updated package version metadata to `2.3.1`.
* Prepared the repository for release by including the current working tree state.

## 2.3.0 - 2026-03-25 - Release preparation update

- Updated package version metadata to `2.3.0`.
- Included the current working tree changes in the release preparation commit.

## 2.2.0 - 2026-03-16 - Agent interface alignment release

- Clarified lifecycle marker semantics in the agent interface documentation to match parser behavior (`$`, `$$`, and `$$$`).
- Updated container state model terminology in agent documentation to align with runtime state names.
- Updated package version metadata to `2.2.0`.

## 2.1.0 - 2026-03-16 - Protected proxy lifecycle handling

- Fixed container lifecycle handling for protected proxy components that reject `.then` probing or freezing.
- Clarified and documented the sync-only composition contract for factories and wrappers.
- Simplified Promise contract checks and aligned related tests with the updated runtime behavior.
- Updated package version metadata to `2.1.0`.

## 2.0.5 - 2026-03-13 - Convention alignment release

- Fixed the `Container.get` JSDoc return typing.
- Removed `jsconfig.json` from the published package metadata.
- Aligned DTO and Enum modules with the updated TeqFW convention documents.
- Updated package version metadata to `2.0.5`.

## 2.0.4 - 2026-03-10 - LLM-first project positioning

- Reframed `README.md` around TeqFW architecture, runtime linking, and LLM-agent-oriented development.
- Rewrote `PHILOSOPHY.md` into a concise statement of TeqFW principles for human and machine-oriented development.
- Updated package version metadata to `2.0.4`.

## 2.0.3 - 2026-03-07 - Package agent interface

- Added `ai/` to the published package file list.
- Updated package version metadata to `2.0.3`.

## 2.0.2 - 2026-03-05

- Replaced `tsconfig.json` with `jsconfig.json` for JavaScript type-checking configuration.
- Updated package publish list to include `jsconfig.json` and exclude legacy `teqfw.json`.
- Fixed `test:unit` and `test:integration` scripts to run all `*.test.mjs` files in nested directories.
- Updated package version metadata to `2.0.2`.

## 2.0.1 - 2026-03-04

- Regenerated `types.d.ts` according to updated type-map conventions.
- Unified package type aliases under a deterministic global declaration registry.
- Updated package version metadata to `2.0.1`.

## 2.0.0 - 2026-02-27

- Started a new changelog lineage for generation 2 of `@teqfw/di`.
- Replaced legacy v1 implementation with the new architecture.
- Promoted `src2/` to `src/` and `test2/` to `test/` as the primary code and test layout.
- Updated project configuration and type paths to the new directory structure.
