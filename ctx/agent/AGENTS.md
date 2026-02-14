# Human–Agent Interaction (`./ctx/agent/`)

Path: `./ctx/agent/AGENTS.md`
Version: `20260214`

## Purpose

The `ctx/agent/` directory is designated for organizing interaction between the human and the agent within the project. It defines only the operational communication layer and does not contain architectural, product, or engineering invariants. This level does not participate in forming or restoring the project’s architectural model.

## Level Map

- `plan/` — iteration planning documents.
- `prompt/` — task templates for interaction with models and agents.
- `report/` — reports for completed iterations.
- `AGENTS.md` — this document, defining the purpose and boundaries of the `agent/` directory.

## Information Status

The contents of `prompt/`, `plan/`, and `report/` are temporary in nature. Prompts, plans, and reports may be modified, replaced, or removed throughout the project lifecycle. These materials are not a source of invariants and do not define the normative state of the system.

## Level Boundaries

The `ctx/agent/` directory is used exclusively for recording communication and organizing the iterative process. It does not contain declarations of architecture, constraints, engineering rules, or product descriptions. Such declarations are defined only within the corresponding branches of `ctx/docs/`.

## Usage Principle

Plans are stored in `plan/`, reports are created in `report/`, and task templates are maintained in `prompt/`. Removal of outdated documents is permitted provided that the current state of interaction remains consistent and no active work is disrupted.

## Summary

`ctx/agent/` defines the operational environment of human–agent interaction through plans, prompts, and reports and does not participate in establishing project invariants.
