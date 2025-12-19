# Architecture Context

Path: `ctx/docs/architecture/AGENTS.md`

## Purpose

The `architecture/` level fixes **architectural form and invariants** of the project.
It declares what structural rules are valid and binding for all lower documentation levels.

---

## Level Map

- `AGENTS.md` — this document.
- `types-map.md` — normative rules for namespace-to-source mappings used by IDEs and static analyzers.

---

## Boundaries

This level:

- defines architectural invariants and allowed forms;
- acts as the highest authority on structure.

This level does not:

- describe runtime behavior;
- define implementation techniques;
- contain engineering or coding conventions.
