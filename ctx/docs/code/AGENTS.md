# Code Documentation (`./ctx/docs/code/`)

Path: `./ctx/docs/code/AGENTS.md`
Version: `20260305`

## Purpose

The `ctx/docs/code/` directory defines engineering and implementation-level invariants of the project, including component contracts, code conventions, and implementation layout rules, without redefining product meaning, architectural form, architectural execution model, or environment assumptions.

In this documentation branch, constraints are expressed at the product and architecture levels, and the execution model is part of architecture. The code level must not redefine those invariants.

## Level Boundaries

This level contains only normative rules and contracts for implementation and source organization. Operational agent procedures belong to `ctx/agent/`, and non-code-level invariants belong to other ADSM documentation branches.

## Level Map

- `components/` — implementation-level contracts for core components and their public and behavioral boundaries.
- `conventions/` — engineering conventions and normative code patterns used across the project and in specific frameworks.
- `layout/` — implementation structure and testing layout invariants for source and verification artifacts.
- `AGENTS.md` — this document, defining the purpose, boundaries, and navigational map of the `code/` level.
- `overview.md` — compact overview of the code level scope and its governed invariants.

## Summary

`ctx/docs/code/` provides the authoritative, implementation-focused invariants and contracts that all project source artifacts must comply with.
