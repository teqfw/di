# AI Package Interface

Version: 20260729

## Purpose

This file provides repository-level navigation and authoring guidance for agent-facing package material.

## Structure

- `AGENTS.md` is repository navigation and is not an installed skill entry point.
- `../skills/teqfw-di/` is the distributable `teqfw-di` Agent Skill.
- `../skills/teqfw-di/SKILL.md` is the consumer entry point.
- `../skills/teqfw-di/references/` contains self-contained detailed consumer references.

## Authoring Boundary

Keep the skill consumer-oriented and aligned with supported package behavior. Do not make the published skill depend on repository-only files or `ctx/`; its references must be loadable from an installed package. Product cognitive context remains authoritative for repository work, while the skill communicates correct use of the installed dependency.
