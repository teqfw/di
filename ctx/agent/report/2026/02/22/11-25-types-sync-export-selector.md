# Iteration Report

## Goal
Register `TeqFw_Di_Container_Instantiate_ExportSelector` in `types.d.ts` and add a local invariant in `src2/AGENTS.md` to require `types.d.ts` synchronization for new exported `src2` modules.

## Performed Actions
1. Updated `types.d.ts` with root type alias:
   - `TeqFw_Di_Container_Instantiate_ExportSelector` -> `src2/Container/Instantiate/ExportSelector.mjs`
2. Updated `types.d.ts` with matching alias in `declare global`.
3. Updated `src2/AGENTS.md` by adding `Type Registry Synchronization` section.
4. Added explicit compliance rule:
   - when adding/renaming exported modules under `src2/`, update `types.d.ts` in same iteration;
   - update both root alias block and `declare global` block.
5. Executed unit test suite.

## Produced Artifacts
- `types.d.ts` (updated)
- `src2/AGENTS.md` (updated)

## Verification
- `npm run test:unit` — passed (9/9).
