# compatibility.md

## Purpose

This reference describes temporary public compatibility surfaces that consumers can encounter. Use canonical surfaces for all new code.

## Deprecated Namespace Registry Import

- Deprecated import: `@teqfw/di/src/Config/NamespaceRegistry.mjs`.
- Canonical import: `@teqfw/di/node/registry/namespace`.
- Status: active only for migration of existing Node.js composition roots.
- Review date: 2027-01-28.
- Removal: only through an explicitly approved breaking release after review.

The deprecated entry re-exports the canonical registry. It does not provide different discovery, configuration, lifecycle, or browser behavior.

## Legacy Container Configuration Builders

For new integrations, use the JSON-safe `new Container(config)` DTO. The
deprecated `addNamespaceRoot()`, `addPreprocess()`, `addPostprocess()`,
`setHardener()`, and `enableLogging()` methods remain available only for
migrating existing composition roots. They are accepted only while the
Container is `Configuring`; the first `get()` locks every configuration surface.

A migration may have both DTO and legacy configuration, but new code must not
mix equivalent policy or rely on its ordering or override behavior. These
Container methods have no committed removal schedule.

## Test-Only Substitution

`enableTestMode()` and `register()` are a separate test-only public capability,
not deprecated Container configuration builders. Enable test mode and register
arbitrary runtime values before the first `get()`; registration then locks with
the other pre-resolution state. Test substitutions are outside the JSON-safe
DTO and do not participate in configured-policy materialization. There is no
mutable `enableIntrospection()` compatibility path.

## Legacy Namespace Manifest Metadata

- Deprecated field: `package.json#teqfw.namespaces`.
- Canonical field: `package.json#teqfw.fw.di.namespaces`.
- Review date: 2027-01-28.
- Removal: only through a deliberate breaking release; no date-based runtime switch exists.

Use the canonical array immediately. Legacy metadata is selected only when canonical metadata is absent; selected schemas are never merged.
