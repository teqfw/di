# Code Layout (`./ctx/docs/code/layout/`)

Path: `./ctx/docs/code/layout/AGENTS.md`
Version: `20260223`

## Purpose

The `ctx/docs/code/layout/` directory defines implementation-level layout invariants for source and testing artifacts, including structural organization and verification boundaries.

## Level Boundaries

This level contains layout and testing-structure rules only. It does not define component API contracts, generic coding conventions, architectural semantics, product meaning, or agent operating procedures.

## Level Map

- `AGENTS.md` — this document, defining the purpose, boundaries, and navigational map of the `layout/` level.
- `structure.md` — implementation structure and static dependency rules (including `src2/` invariants).
- `testing.md` — testing-level implementation invariants and verification conventions for code artifacts.

## Summary

`ctx/docs/code/layout/` provides normative structural and testing-layout rules that implementation artifacts must conform to.
