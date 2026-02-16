# Iteration Report: Composition Container Multiplicity Wording

## Goal
Refine `ctx/docs/composition/overview.md` so container multiplicity is expressed as execution-model guidance rather than architectural prohibition.

## Performed Actions
- Updated `ctx/docs/composition/overview.md` in the `Runtime Service Model` section.
- Added declarative wording that a single container per runtime is recommended for predictable configuration and deterministic behavior.
- Added explicit clarification that multiple containers in a single process are not prohibited by architecture.
- Added explicit per-instance scope statement: architectural invariants (determinism, parser injectivity, structural identity via `DepId`) apply per container instance when configuration and parser profile are consistent for the evaluated instance.
- Kept architecture documents unchanged and preserved composition-layer scope.

## Produced Artifacts
- `ctx/docs/composition/overview.md`
- `ctx/agent/report/2026/02/16/15-27-composition-container-multiplicity-wording.md`

## Result
Composition-level wording now treats single-container usage as a recommendation, not an architectural restriction, while remaining consistent with architecture-level invariants and per-instance guarantee boundaries.
