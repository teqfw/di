# Changelog

## 1.1.3

- Added global type declarations to `types.d.ts` to match the type map architecture rules.

## 1.1.2

- Moved architecture diagrams into `ctx/img/` and updated the context map accordingly.
- Clarified type map rules to require global namespace declarations for IDE type resolution.

## 1.1.1

- Added missing published files (`CHANGELOG.md`, `teqfw.json`, `types.d.ts`) and declared `types.d.ts` in `package.json`.

## 1.1.0

- Added ADSM cognitive context documentation and reporting structure under `ctx/`.
- Added type map documentation and a `types.d.ts` namespace-to-source mapping for IDE support.
- Updated `.npmignore` to ignore `output.md` artifacts.

## 1.0.2

- Added ability to import the Replace preprocessor chunk via package subpath (`./pre/replace`).
- Updated `.npmignore` to exclude development artifacts (`ctx/`, logs, test files) and ensure clean npm package contents.
- Improved ignore patterns to prevent accidental publication of internal files.

## 1.0.1

- Prepare npm package for publication.
- Add distribution build outputs to package files and specify entry points.

## 1.0.0

- Started changelog for version 1.0.0.
- Added AGENTS.md with English-only guidelines and link to PHILOSOPHY.md.
- Switched tests from Mocha to Node's built-in runner.
- Updated package scripts and removed Mocha dependency.
- Documented breaking changes for v1.0.0: the container can no longer access itself, configuration must occur in the Composition Root, and legacy versions live in the `forerunner` branch.
