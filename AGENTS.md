# Root Level

- Path: `AGENTS.md`
- Template Version: `20260720`
- Changed: `20261024`

## Purpose

This file defines the root-level working rules for the project repository.

This file is the first instruction source for every agent operating within the repository.

## Level Boundary

Defines:

- Root-level working boundaries between the repository, the cognitive context, and the software product.
- Repository-topology rules needed to work safely when `ctx/` may be mounted separately.
- Root-level protection and escalation rules for this project.

Does NOT define:

- Product-specific meaning, requirements, or domain knowledge.
- Implementation-level structure such as source code, runtime details, or filesystem layout.
- Task-specific instructions, workflows, or local operational procedures.

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

The effective working context of the agent is the aggregate of all `AGENTS.md` files located along the path from the repository root to the target directory.

Rules:

- deeper levels override higher levels within their scope
- root-level invariants cannot be overridden
- all levels must remain mutually consistent

## Root File Protection

This file defines root-level project control rules.

The agent must not modify, replace, delete, relocate, or reinterpret this file unless explicitly instructed by the human.

Violation of this rule constitutes an execution error.

## Secret Handling

The Agent must never read, load, print, search for, or expose secret-bearing project files, including `.env` and `.env.*` files, credentials, private keys, tokens, or secret stores. This rule applies even when a file is Git-ignored and includes broad search or command output that could reveal its contents.

The Agent may use a non-secret example template such as `.env.example` only to learn the configuration shape. It must not infer or request the value of any secret.

If secret data is exposed accidentally, the Agent must stop handling that value, must not repeat it, and must tell the Human that the secret should be rotated or revoked.
