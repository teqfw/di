# Code Layout (`./ctx/docs/code/layout/`)

Path: `./ctx/docs/code/layout/AGENTS.md`
Version: `20260227`

## Purpose

The `ctx/docs/code/layout/` directory defines implementation-level layout invariants for source and testing artifacts, including structural organization and verification boundaries.

## Level Boundaries

This level contains layout and testing-structure rules only. It does not define component API contracts, generic coding conventions, architectural semantics, product meaning, or agent operating procedures.

## Level Map

- `testing/` — layered testing contracts for implementation-level verification (`unit` and `integration`).
- `AGENTS.md` — this document, defining the purpose, boundaries, and navigational map of the `layout/` level.
- `logging.md` — logging-level implementation layout invariants and verification boundaries.
- `structure.md` — implementation structure and static dependency rules (including `src2/` invariants).
- `testing.md` — overview of normative testing layers and their responsibility boundaries.

## Summary

`ctx/docs/code/layout/` provides normative structural and testing-layout rules that implementation artifacts must conform to.
