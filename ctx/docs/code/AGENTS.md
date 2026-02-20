# Code Documentation (`./ctx/docs/code/`)

Path: `./ctx/docs/code/AGENTS.md`
Version: `20260220`

## Purpose

The `ctx/docs/code/` directory defines engineering and implementation-level invariants of the project, including code structure rules and component contracts, without redefining architecture, constraints, composition, environment, or product meaning.

## Level Boundaries

This level contains only normative rules and contracts for implementation and source organization. Operational agent procedures belong to `ctx/agent/`, and non-code-level invariants belong to other ADSM documentation branches.

## Level Map

- `conventions/` — engineering conventions and normative code patterns used across the project and in specific frameworks.
- `AGENTS.md` — this document, defining the purpose, boundaries, and navigational map of the `code/` level.
- `container.md` — container implementation contract.
- `depid.md` — canonical dependency identity (`DepId`) implementation-level invariants and rules.
- `jsdoc-spec.md` — structural typing and annotation invariants for implementation.
- `overview.md` — compact overview of the code level scope and its governed invariants.
- `parser.md` — parser implementation contract.
- `resolver.md` — resolver implementation contract.
- `structure.md` — implementation structure and static dependency rules (including `src2/` invariants).
- `testing.md` — testing-level implementation invariants and verification conventions for code artifacts.

## Summary

`ctx/docs/code/` provides the authoritative, implementation-focused invariants and contracts that all project source artifacts must comply with.
