# dependency-id.md

Version: 20260307

## Purpose

Dependencies in the container are addressed using **Canonical Dependency Codes (CDC)**. A CDC is a structured identifier interpreted by the container to determine which module must be loaded, which export must be used, and how the resulting object must be instantiated.

CDC provides a stable logical addressing mechanism that is independent of file paths and runtime environments.

## Canonical Form

A CDC follows the canonical structure:

```txt
[PlatformPrefix]ModuleName[__ExportName][Lifecycle][WrapperSuffixes]
```

The components have the following roles:

- **PlatformPrefix** — optional prefix identifying a platform module source.
- **ModuleName** — logical module identifier within a namespace.
- **ExportName** — optional named export selector.
- **Lifecycle** — marker defining instantiation semantics.
- **WrapperSuffixes** — optional sequence of wrapper identifiers.

Each CDC is interpreted deterministically by the container.

## Platform Prefix

A CDC may reference modules provided by the runtime platform or external packages.

The following prefixes are supported:

- **`node_`** — reference a built-in Node.js module.
- **`npm_`** — reference a module from the npm ecosystem.

Examples:

```txt
node_fs$
npm_lodash$
```

If no platform prefix is present, the identifier refers to an application module resolved through namespace mapping.

## Module Identification

The **ModuleName** identifies the module that provides the dependency. Module identifiers use namespace-based naming and are translated into filesystem paths according to namespace resolution rules described in **container.md**.

Identifier segments separated by underscores correspond to directory boundaries in the module path.

Example:

```txt
App_Service_User
```

maps to a module located at:

```txt
AppRoot/Service/User.js
```

## Export Selection

A CDC may reference either the default export of a module or a named export.

Named exports are selected using a double underscore separator.

Examples:

```txt
App_Service_User$
App_Service_User__Factory$
```

The first identifier resolves the module default export. The second resolves the named export `Factory`.

## Lifecycle Markers

Lifecycle markers define how the container instantiates and returns objects.

The following markers are supported:

- **`$`** — singleton lifecycle; the container creates the object once and returns the same instance for subsequent requests.
- **`$$`** — transient lifecycle; a new instance is created for each request.
- **`$$$`** — transient lifecycle alias; behaves the same as `$$`.

Lifecycle markers are appended at the end of the identifier.

## Wrapper Suffixes

Wrappers allow postprocessing of created objects. Wrapper identifiers are appended after the lifecycle marker and separated by underscores.

Example:

```txt
App_Service_User$$_wrapLog_wrapTrace
```

In this example the container creates a new instance and applies the wrappers `wrapLog` and `wrapTrace` during the postprocess stage.

Wrapper behavior is described in **extensions.md**.

## Resolution Semantics

When the container receives a CDC it performs the following interpretation steps:

1. determine the platform prefix and module namespace
2. resolve the module identifier into a module location
3. select the requested export
4. apply lifecycle semantics
5. apply wrapper suffixes if present

These interpretation steps integrate with the dependency resolution pipeline described in **container.md**.
