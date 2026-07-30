# compatibility.md

Version: 20260730

## Purpose

This reference describes temporary public compatibility surfaces that consumers can encounter. Use canonical surfaces for all new code.

## Deprecated Namespace Registry Import

- Deprecated import: `@teqfw/di/src/Config/NamespaceRegistry.mjs`.
- Canonical import: `@teqfw/di/node/registry/namespace`.
- Status: active only for migration of existing Node.js composition roots.
- Review date: 2027-01-28.
- Removal: only through an explicitly approved breaking release after review.

The deprecated entry re-exports the canonical registry. It does not provide different discovery, configuration, lifecycle, or browser behavior.

## Legacy Namespace Manifest Metadata

- Deprecated field: `package.json#teqfw.namespaces`.
- Canonical field: `package.json#teqfw.fw.di.namespaces`.
- Review date: 2027-01-28.
- Removal: only through a deliberate breaking release; no date-based runtime switch exists.

Use the canonical array immediately. Legacy metadata is selected only when canonical metadata is absent; selected schemas are never merged.

## Legacy AI Directory

- Deprecated package directory: `ai/` and `ai/AGENTS.md`.
- Canonical consumer interface: `skills/teqfw-di/SKILL.md`.
- Review date: 2026-10-30.
- Removal: only through an explicitly approved breaking release after review.

The legacy directory is a navigation pointer, not a second installed skill interface.
