# Iteration Report

## Goal
Ensure logging in `Container` becomes active immediately from `enableLogging()` during Builder phase, not only during `get()`.

## Performed Actions
- Updated `src2/Container.mjs`:
  - added builder logging helper using internal logger (`logBuilder`);
  - switched builder-stage diagnostics from direct `console.debug` calls to internal logger usage;
  - changed `enableLogging()` to instantiate logger immediately and bind it to parser (if supported);
  - made `enableLogging()` idempotent (`return` when already enabled);
  - updated `setParser()` to propagate logger to replaced parser when logging is already enabled;
  - changed `initializeInfrastructure()` to keep the existing logger instance (create only if needed), preserving single logger ownership and activation point semantics.
- Ran lint and full `test2` suite.

## Produced Artifacts
- `src2/Container.mjs`

## Verification
- `npm run -s eslint` passed.
- `node --test "test2/unit/**/*.test.mjs" "test2/integration/**/*.test.mjs"` passed (15/15).
