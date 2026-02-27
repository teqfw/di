# Iteration Report

## Goal
Align `ctx/docs/` semantics so wrappers are defined only as container-level postprocess plugins activated by CDC markers and remove any interpretation that wrappers are module-level exports.

## Actions
- Updated `ctx/docs/architecture/cdc-profile/default/grammar.md` in the `Wrapper Notes` section with normative statements that wrapper identifiers are outside module namespace, MUST NOT be resolved as module exports, and are handled exclusively by container postprocess configuration.
- Added explicit clarification in grammar that CDC wrapper markers activate container-registered postprocess logic and that instantiated modules are wrapper-agnostic.
- Updated `ctx/docs/architecture/cdc-profile/default/transformation.md` with explicit pipeline alignment (`parse → preprocess → resolve → instantiate → postprocess → lifecycle → freeze`) and clarified wrapper handling at postprocess via `container.addPostprocess`.
- Added `Wrapper Handling` subsection in transformation defining declarative marker semantics, configuration-driven behavior, CDC-order application, deterministic execution, and fail-fast requirement when wrapper markers are unhandled.
- Updated `ctx/docs/code/components/container.md` to formalize `addPostprocess(fn)` as the wrapper implementation mechanism, define metadata-based conditional handling via `DepId`, and clarify that wrapper capability is configuration-enabled rather than parser syntax behavior.
- Added `Wrapper Semantics` subsection in container contract specifying postprocess-stage interpretation, prohibition of automatic wrapper resolution from module exports, and immutability after first `get`.
- Performed corpus consistency scan across `ctx/docs/` for wording that could imply wrapper resolution from module namespace or module exports.

## Artifacts
- `ctx/docs/architecture/cdc-profile/default/grammar.md`
- `ctx/docs/architecture/cdc-profile/default/transformation.md`
- `ctx/docs/code/components/container.md`
- `ctx/agent/report/2026/02/27/16-54-wrapper-semantics-doc-alignment.md`
