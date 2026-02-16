# Iteration Report: Canonical Identity Terminology Harmonization

## Goal
Harmonize canonical-identity terminology across `ctx/docs/**` so all canonical identity references explicitly mean structural canonical representation (`DepId`), with no implication of canonical string EDD identity.

## Performed Actions
- Executed a corpus sweep for canonical terminology (`canonical`, `canonicalization`, `canonical identity`, `canonical identifier`, `canonical representation`) across `ctx/docs/*.md` excluding `output.md`.
- Updated architecture-level terminology in place:
  - `ctx/docs/architecture/edd-model.md`: replaced unqualified canonical identity phrasing with structural canonical `DepId` phrasing; clarified structural canonicalization wording; retained explicit prohibition of canonical string EDD entity.
  - `ctx/docs/architecture/linking-model.md`: replaced "canonical internal representation" with "structural canonical representation `DepId`".
  - `ctx/docs/architecture/invariants.md`: replaced unqualified canonical identity/representation wording with structural canonical `DepId` wording.
  - `ctx/docs/architecture/overview.md`: replaced unqualified canonical terminology with structural canonical `DepId` terminology and updated section title accordingly.
  - `ctx/docs/architecture/AGENTS.md`: aligned level-level canonical identity terminology with structural canonical identity (`DepId`).
- Updated product and constraint terminology in place:
  - `ctx/docs/product/overview.md`: aligned parser output wording to structural canonical representation (`DepId`).
  - `ctx/docs/product/principles.md`: aligned parser-output and identity-model wording to structural canonical `DepId` terminology.
  - `ctx/docs/product/scope.md`: aligned responsibility and extensibility wording to structural canonical `DepId` representations/identity semantics.
  - `ctx/docs/constraints/overview.md`: aligned extension constraint wording to structural canonical `DepId` identity semantics.
- Verified residual canonical references and confirmed no remaining unqualified canonical-identity wording in governed docs.

## Produced Artifacts
- `ctx/docs/architecture/AGENTS.md`
- `ctx/docs/architecture/edd-model.md`
- `ctx/docs/architecture/invariants.md`
- `ctx/docs/architecture/linking-model.md`
- `ctx/docs/architecture/overview.md`
- `ctx/docs/constraints/overview.md`
- `ctx/docs/product/overview.md`
- `ctx/docs/product/principles.md`
- `ctx/docs/product/scope.md`
- `ctx/agent/report/2026/02/16/13-35-canonical-identity-terminology-harmonization.md`

## Result
Canonical identity terminology is now consistently structural and explicitly bound to `DepId` across the documentation corpus in scope. No document in the governed set implies a canonical string representation of EDD or string-based identity semantics.
