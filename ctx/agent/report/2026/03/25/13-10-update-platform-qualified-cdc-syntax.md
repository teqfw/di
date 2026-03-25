# Iteration Report

Path: `./ctx/agent/report/2026/03/25/13-10-update-platform-qualified-cdc-syntax.md`
Version: `20260325`

## Goal

Update the Default CDC Profile implementation to accept the platform-qualified `node:` and `npm:` syntax, support scoped npm package specifiers, preserve `teq` canonical identity semantics, and align tests with the new profile rules.

## Performed Actions

Updated `src/Def/Parser.mjs` to parse `node:` and `npm:` prefixes, treat explicit `teq:` as invalid, accept scoped npm package names, preserve `__deps__` as the structural surface, and keep explicit `$$$` distinct from lifecycle omission. Added a `test` script to `package.json` so the required validation command works locally.

Rewrote `test/unit/Def/Parser.test.mjs` to cover the new accepted and rejected CDC forms, including `node:` and `npm:` examples, wrapper ordering, lifecycle variants, and equivalence between omitted default export and explicit `__default`.

Ran `npm install` and `npm test` successfully.

## Produced Artifacts

- `package.json`
- `src/Def/Parser.mjs`
- `test/unit/Def/Parser.test.mjs`
- `ctx/agent/report/2026/03/25/13-10-update-platform-qualified-cdc-syntax.md`

## Results

The implementation and test suite passed. The repository is ready for commit and push.
