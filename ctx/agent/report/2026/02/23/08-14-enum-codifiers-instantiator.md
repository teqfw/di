# Iteration Report

## Goal
Replace string composition constants in `src2/Container/Instantiate/Instantiator.mjs` with enum codifiers from `src2/Enum`, and formalize a rule in `src2/AGENTS.md` to prohibit string literals when enum codifiers exist.

## Actions
- Read applicable agent/context rules from `AGENTS.md`, `ctx/AGENTS.md`, and `src2/AGENTS.md`.
- Inspected `src2/Enum/Composition.mjs` and confirmed canonical composition codifiers: `AS_IS` and `FACTORY`.
- Updated `src2/Container/Instantiate/Instantiator.mjs`:
- Added import of `TeqFw_Di_Enum_Composition`.
- Replaced string comparisons for composition mode with enum codifier checks.
- Updated `src2/AGENTS.md` in the DTO and Enum rules section:
- Added mandatory rule to use enum codifiers from `src2/Enum` for semantic constants.
- Added prohibition on string literals where enum codifiers are available.
- Performed targeted verification with ripgrep to ensure replacements are applied.

## Produced Artifacts
- Modified: `src2/Container/Instantiate/Instantiator.mjs`
- Modified: `src2/AGENTS.md`
- Created report: `ctx/agent/report/2026/02/23/08-14-enum-codifiers-instantiator.md`
