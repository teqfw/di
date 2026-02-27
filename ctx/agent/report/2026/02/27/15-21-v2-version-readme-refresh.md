# Iteration Report

## Goal

Bump package version to `2.0.0` and rewrite `README.md` to match the v2 contract based on `ctx` documentation, with emphasis on `__deps__` declarations and Default CDC Profile grammar.

## Performed Actions

1. Read normative context for product and CDC profile:
- `ctx/docs/product/overview.md`
- `ctx/docs/product/principles.md`
- `ctx/docs/product/scope.md`
- `ctx/docs/product/default-cdc-profile.md`
- `ctx/docs/architecture/cdc-profile/default/grammar.md`
- `ctx/docs/architecture/cdc-profile/default/transformation.md`
- `ctx/docs/architecture/cdc-profile/default/validation.md`
- `ctx/docs/code/components/container.md`

2. Verified runtime behavior and API in implementation and tests:
- `src/Container.mjs`
- `src/Def/Parser.mjs`
- `src/Container/Resolve/GraphResolver.mjs`
- `src/Container/Resolver.mjs`
- integration fixtures and tests under `test/integration/`

3. Updated package version:
- `package.json`: `version` set to `2.0.0`
- `package-lock.json`: top-level and root package version set to `2.0.0`

4. Rewrote `README.md` from scratch to describe:
- v2 line positioning;
- quick start with `__deps__`;
- container configuration through composition root;
- CDC grammar summary and examples;
- public API and builder/operational stage behavior;
- wrappers and test-mode mocks;
- references to normative `ctx` docs.

5. Ran verification tests:
- `npm run test:unit`
- `npm run test:integration`

## Produced Artifacts

- Updated: `package.json`
- Updated: `package-lock.json`
- Updated: `README.md`

## Verification Notes

- Unit tests passed: 14/14.
- Integration tests passed: 8/8.
- `npm` script output now reports package version `2.0.0`.
