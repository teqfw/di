# Root Level

- Path: `AGENTS.md`
- Template Version: `20260605`
- Changed: `20260605`

## Purpose

This file defines the root invariants of ADSM (Agent-Driven Software Management) for the entire project.

This file is the first instruction source for every Agent operating within the repository.

## Level Boundary

This level defines methodological invariants, Human and Agent responsibilities, cognitive context principles, repository topology rules, context-product consistency rules, AGENTS.md hierarchy resolution rules, and root file protection rules.

This level does not define product-specific requirements, domain-specific knowledge, implementation details, project filesystem structure, or task-specific instructions.

Such information belongs to the cognitive context.

## ADSM Project Model

An ADSM project consists of two interconnected spaces:

- the **Cognitive Context** located in `./ctx/`
- the **Software Product** located outside `./ctx/`

The cognitive context is the long-term textual memory of the project.

The cognitive context is the primary communication medium between Humans and Agents working on the project.

The cognitive context is the authoritative knowledge source used by Agents when modifying the project.

The software product is the implementation that must be kept consistent with the cognitive context.

## Human and Agent Roles

The Human defines goals, authorizes work, evaluates outcomes, and evolves the project.

The Agent interprets the cognitive context, performs assigned tasks, modifies the project within task boundaries, and maintains consistency between the cognitive context and the software product.

The Agent operates through text and must treat project documentation as operational memory, not as secondary commentary.

## Cognitive Context

The canonical execution location of the cognitive context is `./ctx/`.

Project-specific knowledge, requirements, architecture, environment descriptions, and implementation guidance are defined within the cognitive context.

The Agent must consult `./ctx/AGENTS.md` for project-specific instructions when `./ctx/` exists.

The Agent must consult `./ctx/docs/filesystem.md` for the project filesystem structure and documentation layout when that file exists.

Documentation distributed with the software product may exist outside `./ctx/`, but it does not replace, redefine, or supersede the cognitive context.

## Bootstrap and Repository Topology

An ADSM project may use one repository or two repositories.

In a one-repository topology, the software product and the cognitive context are versioned together.

In a two-repository topology, the software product and the cognitive context are independent version-controlled repositories, and the cognitive context repository is mounted under `./ctx/`.

The Agent must detect whether `./ctx/` is part of the current repository or an independent repository.

The Agent must preserve repository boundaries.

The Agent must not mix changes between independent repositories.

The Agent must not remove, replace, relocate, or unmount `./ctx/`.

If `./ctx/` does not exist, the Agent may perform bootstrap operations required to create the initial cognitive context structure.

After bootstrap is complete, `./ctx/AGENTS.md` becomes the entry point for project-specific instructions.

## Context and Product Consistency

The cognitive context is the source of truth for the project.

If the cognitive context and the software product diverge, the Agent must treat the cognitive context as authoritative.

The Agent must maintain consistency between the cognitive context and the software product.

The Agent may modify the cognitive context when required by the assigned task and when the modification remains consistent with higher-level context constraints.

The Agent may modify the software product when required by the assigned task and when the modification remains consistent with the cognitive context.

## AGENTS.md Hierarchy

Additional `AGENTS.md` files may exist in subdirectories.

The effective working context of the Agent is the aggregate of all `AGENTS.md` files located along the path from the repository root to the target directory.

Rules:

- deeper levels override higher levels within their scope
- root-level invariants cannot be overridden
- all levels must remain mutually consistent

## Root File Protection

This file defines ADSM template-level invariants.

The Agent must not modify, replace, delete, relocate, or reinterpret this file unless explicitly instructed by the Human.

Violation of this rule constitutes an execution error.
