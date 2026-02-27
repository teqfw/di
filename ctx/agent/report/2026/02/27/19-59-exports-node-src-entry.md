# Iteration Report

## Goal
Optimize `package.json` exports for `@teqfw/di`, remove redundant/invalid entries, and ensure Node resolves the package root to `./src/Container.mjs` instead of `dist` bundles.

## Actions
- Read applicable agent instructions and reporting requirements.
- Updated `package.json` `exports`:
  - Set `.` to Node-oriented source entry (`import` and `default` -> `./src/Container.mjs`).
  - Added `browser` condition for root export (`import` -> `./dist/esm.js`, `require` -> `./dist/umd.js`).
  - Kept explicit source subpath exports for `./src/Container.mjs` and `./src/Config/NamespaceRegistry.mjs`.
  - Removed obsolete `./pre/replace` export because target file does not exist in repository.
- Verified export resolution and availability with Node commands.

## Artifacts
- Modified: `package.json`
- Created: `ctx/agent/report/2026/02/27/19-59-exports-node-src-entry.md`

## Verification
- `node --input-type=module -e "console.log(await import.meta.resolve('@teqfw/di'))"`
  - Result: `file:///home/alex/work/teqfw/di/src/Container.mjs`
- `node --input-type=module -e "await import('@teqfw/di'); console.log('OK:@teqfw/di')"`
  - Result: success
- `node --input-type=module -e "await import('@teqfw/di/src/Container.mjs'); console.log('OK:@teqfw/di/src/Container.mjs')"`
  - Result: success
- `node --input-type=module -e "await import('@teqfw/di/src/Config/NamespaceRegistry.mjs'); console.log('OK:@teqfw/di/src/Config/NamespaceRegistry.mjs')"`
  - Result: success
- `node --conditions=browser --input-type=module -e "console.log(await import.meta.resolve('@teqfw/di'))"`
  - Result: `file:///home/alex/work/teqfw/di/dist/esm.js`
