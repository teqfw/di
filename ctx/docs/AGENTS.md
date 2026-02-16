# Project Documentation (`./ctx/docs/`)

Path: `./ctx/docs/AGENTS.md`
Version: `20260215`

## Purpose

The `ctx/docs/` directory contains the declarative description of the project structured according to ADSM levels and defines the meaning, constraints, structural form, and engineering invariants of the system without including organizational instructions for the agent.

## Level Model

Documentation at the `docs/` level is organized in accordance with the ADSM levels:

- `product/` — system meaning and domain invariants;
- `constraints/` — mandatory design boundaries and prohibitions;
- `architecture/` — structural form of the system and its boundaries;
- `composition/` — execution model and scenario dynamics;
- `environment/` — execution conditions and infrastructural prerequisites;
- `code/` — engineering invariants of implementation and code organization conventions.

Each subdirectory defines a distinct type of knowledge and does not duplicate statements established at other levels.

## Level Boundaries

`ctx/docs/` describes the system as a design object: its purpose, constraints, structural form, execution dynamics, and engineering rules. Instructions governing agent behavior, reporting modes, and organizational procedures are excluded from this level and belong exclusively to the `ctx/agent/` branch.

Relationships between subdirectories are defined declaratively through references to documents within `ctx/docs/` without procedural descriptions and without role overlap.

## Document Requirements

Documents at the `docs/` level must be written in a declarative style and define the invariants, boundaries, and definitions of the corresponding ADSM level. Repetition of statements established at other levels is not permitted. Text within paragraphs must be written without manual line breaks and without using section separators such as `---`.

Documentation must comply with the eight ADSM quality criteria: declarativity, completeness, consistency, coherence, density, compactness, non-redundancy, and absence of the obvious.

The size of an individual document must not exceed 5,000 tokens.

## Summary

`ctx/docs/AGENTS.md` defines the structure and boundaries of project documentation in accordance with ADSM levels and ensures consistent distribution of meaning, constraints, structural form, execution dynamics, and engineering invariants within the `docs/` branch.
