# Architecture Context

Path: `ctx/docs/architecture/AGENTS.md`

## Purpose

The `architecture/` level fixes **architectural form and invariants** of the project.
It declares what structural rules are valid and binding for all lower documentation levels. Architectural statements at this level are fixed invariants for automated agents.

---

## Architectural Authority

This level is authoritative over all architectural statements in the project context.
Architectural statements at this level are not reinterpreted, optimized, or substituted by automated agents.

## Document Stability

- `dependency-model.md` — Stable / Normative
- `dependency-language.md` — Stable / Normative
- `types-map.md` — Stable / Normative

## Level Map

- `AGENTS.md` — this document.
- `dependency-language.md` — canonical dependency identifier language and interpretation rules.
- `dependency-model.md` — architectural dependency model and invariants for container behavior.
- `namespace-addressing.md` — namespace addressing rules, zoning, and module-to-path mapping invariants.
- `types-map.md` — normative rules for namespace-to-source mappings used by IDEs and static analyzers.

---

## Boundaries

This level:

- defines architectural invariants and allowed forms;
- acts as the highest authority on structure.

This level does not:

- prescribe implementation techniques or optimization algorithms;
- define engineering or coding conventions;
- describe procedural runtime mechanics beyond fixed model invariants.
