# 08-22-types-map-no-compile

## Summary of Changes
- Rephrased the type map description to emphasize editor-time `tsserver` visibility, removing compile-time wording.
- Removed compile-time reflection wording from the product overview to align with the no-compilation rule.
- Verified the `ctx/` corpus for compilation/transpilation references and updated the only matches.

## Work Details
- Updated `ctx/docs/architecture/types-map.md` to describe the type map as an editor-time `tsserver` visibility mechanism.
- Adjusted `ctx/docs/product/overview.md` to avoid compile-time terminology.
- Searched `ctx/` for compile/transpile wording and corrected the identified occurrences.

## Results
- Documentation no longer suggests compilation or transpilation while preserving the intended LSP/`tsserver` purpose.
- No automated tests were run because the changes were documentation-only.
