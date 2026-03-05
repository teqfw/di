# Project Documentation (`./ctx/docs/`)

Path: `./ctx/docs/AGENTS.md`
Template Version: `20260305`

## Purpose

The `ctx/docs/` directory contains the declarative description of the system organized by ADSM documentation levels. These documents define system meaning, architectural form, operational environment, and engineering implementation rules.

Documentation at this level describes the system as a design object. Organizational instructions, execution procedures, and agent operational rules are excluded and belong to `ctx/agent/`.

## Level Map

- `architecture/` — structural form of the system, architectural entities, boundaries, and interaction model.
- `code/` — engineering invariants governing how architecture is expressed in source code.
- `environment/` — runtime environment and infrastructural prerequisites required for system operation.
- `product/` — system meaning, domain entities, and product-level invariants.
- `AGENTS.md` — documentation structure and level boundaries of `ctx/docs/`.

## Level Order

Documentation levels form a strict dependency order:

```
product
↓
architecture
↓
environment
↓
code
```

Lower levels may refine but must not redefine statements established at higher levels.

## Documentation Rules

Documents in `ctx/docs/` must:

- be declarative and define invariants, boundaries, or definitions of their level;
- avoid duplication of statements defined at other levels;
- contain no agent instructions or procedural workflows;
- use paragraphs without manual line breaks;
- avoid section separators such as `---`.

Documentation must satisfy the eight ADSM quality criteria: declarativity, completeness, consistency, coherence, density, compactness, non-redundancy, and absence of the obvious.

Individual documents must not exceed 5,000 tokens.

## Summary

`ctx/docs/AGENTS.md` defines the documentation structure and boundaries of the `ctx/docs/` branch and serves as the navigational index for ADSM documentation levels.
