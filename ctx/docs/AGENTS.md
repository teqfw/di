# Project Documentation (`./ctx/docs/`)

- Path: `./ctx/docs/AGENTS.md`
- Version: `20251218`

## Purpose

The `ctx/docs/` directory accumulates declarative knowledge about the project: its meanings, architecture, engineering norms, composition, and operational environment. This level forms the project perspective by fixing domain contours and invariants without including organizational modes of agent operation. It inherits quality criteria from `ctx/AGENTS.md`, while each subdirectory refines context boundaries and preserves the declarative nature of descriptions.

## Level Map

- `architecture/` — architectural form of the system: overview, structures, and boundaries in which contours, events, phases, and interfaces are fixed.
- `code/` — engineering norms: code organization conventions, modularity rules, runtime contracts, and testing requirements.
- `composition/` — application composition: user interfaces, components, states, routes, and application mechanics grouped by contours.
- `constraints/` — mandatory implementation constraints ensuring compliance with semantic and architectural invariants.
- `environment/` — description of the operational environment: runtime configuration, services, system dependencies, and environment parameters.
- `product/` — semantic core: purpose, terminology, descriptions of system capabilities, and interaction flows.
- `AGENTS.md` — this document at the `docs/` level, defining the boundaries of project documentation and serving as the agent’s entry point.

## Level Boundaries

Documentation at the `docs/` level is limited to describing meanings, architecture, engineering rules, and operational characteristics. It does not contain instructions for agent behavior, reporting, or interaction procedures. Each subdirectory concentrates on its own type of knowledge:  
`product/` — meaning,  
`constraints/` — obligations,  
`architecture/` — form,  
`composition/` — application structure,  
`code/` — engineering norms,  
`environment/` — execution environment.

Relationships between directories are described declaratively, without role overlap and without duplicating statements fixed at higher levels.

## Structure and Relationships

The `docs/` level inherits the context of `ctx/AGENTS.md` and is refined by its own declarations. The file `ctx/docs/AGENTS.md` fixes that this branch contains project descriptions; each subdirectory then introduces its own `AGENTS.md` defining local boundaries. Relationships between subdirectories are defined through declarative references (`ctx/docs/...`), while inheritance principles ensure semantic consistency and the absence of procedural descriptions.

## Requirements

Documents at the `docs/` level must:

1. Use a declarative style and must not repeat statements fixed at other context levels.
2. Not introduce instructions for agent behavior; such instructions belong exclusively to the `ctx/agent/` branch.

## Summary

`ctx/docs/AGENTS.md` fixes the structure and hierarchy of project documentation, ensuring that meanings, architecture, engineering norms, composition, constraints, and the execution environment are described within a single coherent space and do not intersect with the agent’s organizational branch.
