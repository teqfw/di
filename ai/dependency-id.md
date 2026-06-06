# dependency-id.md

Version: 20260606

## Purpose

Dependencies in the container are addressed using **Canonical Dependency Codes (CDC)**. A CDC is a structured identifier interpreted by the container to determine which module must be loaded, which export must be selected, and whether the resolved value is returned as-is or instantiated with lifecycle semantics.

## Grammar

```txt
CDC := [PlatformPrefix]ModuleName[__ExportName][Lifecycle][WrapperSuffixes]
```

Component order is fixed.

- `PlatformPrefix` is optional.
- `__ExportName` is optional.
- `Lifecycle` is optional.
- `WrapperSuffixes` are optional and require a lifecycle marker.

## Components

- `PlatformPrefix` — optional source selector such as `node:` or `npm:`.
- `ModuleName` — logical module identifier inside a namespace.
- `__ExportName` — optional named export selector. Omission means the default export for composition, or whole-module namespace for as-is resolution.
- `Lifecycle` — optional instantiation marker.
- `WrapperSuffixes` — optional ordered wrapper export names appended after the lifecycle marker.

## Platform Prefixes

Supported prefixes:

- `node:` — reference a built-in Node.js module.
- `npm:` — reference an npm package.

If no platform prefix is present, the identifier refers to an application module resolved through namespace roots.

Examples:

```txt
node:fs
npm:@humanfs/core
App_Service_User$
```

## Module Identification

`ModuleName` identifies the provider module. Identifier segments separated by underscores correspond to path segments inside the configured namespace root.

Example:

```txt
App_Service_User
```

may map to a module-specifier base such as:

```txt
AppRoot/Service/User.mjs
```

The base may be filesystem-backed or URL-backed depending on runtime configuration.

## Export Selection

Named exports are selected with a double underscore separator.

Examples:

```txt
App_Service_User$
App_Service_User__Factory$
```

- `App_Service_User$` selects the default export for lifecycle-based composition.
- `App_Service_User__Factory$` selects the named export `Factory` for lifecycle-based composition.

## Lifecycle Markers

Supported lifecycle markers:

- `$` — singleton lifecycle; create once and reuse the same instance.
- `$$` — transient lifecycle; create a new instance each time.
- `$$$` — transient alias; behaves the same as `$$` in the current implementation.

If the lifecycle marker is omitted, the selected module export is resolved **as-is** and is not instantiated by lifecycle rules.

Examples:

```txt
App_Math
App_Service$
App_Task$$
```

## Wrapper Suffixes

Wrapper suffixes are appended after the lifecycle marker and separated by underscores.

Example:

```txt
App_Service$$_wrapLog_wrapTrace
```

In this example the container creates a transient instance, then applies wrapper exports `wrapLog` and `wrapTrace` in the declared order.

Wrapper exports are described in `extensions.md`.

## Interpretation Rules

When the container receives a CDC it interprets it in this order:

1. determine the platform prefix and module namespace;
2. resolve the module identifier into a module location;
3. select the default export, a named export, or the whole module namespace for as-is resolution;
4. apply lifecycle semantics if a lifecycle marker is present;
5. apply wrapper exports if wrapper suffixes are present.

Important rules:

- no lifecycle marker means as-is resolution of the selected export;
- wrapper suffixes are meaningful only for lifecycle-based composition;
- named export selection does not by itself imply singleton or transient behavior;
- lifecycle and wrappers are interpreted after export selection.

## Canonical Examples

```txt
App_Math
App_Service$
App_Service__Factory$
App_Task$$_wrapLog
node:fs
npm:@humanfs/core
```

These examples cover:

- as-is module or export resolution;
- singleton composition;
- named export composition;
- transient composition with wrapper exports;
- platform module access.
