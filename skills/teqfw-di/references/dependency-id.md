# Dependency Identifiers

A Dependency Identifier consists of a Dependency Address and optional Export
Selection, Dependency Lifestyle, and ordered Wrapper Selection. It is the
runtime declaration language used by `__deps__` and by the one public
`container.get()` root request.

## Address Kinds

| Address Kind | Serialized form | Example | Mapping |
| --- | --- | --- |
| Teq | unprefixed | `App_Service` | A configured Namespace Mapping derives the module location. |
| Node | `node:` | `node:fs` | A Node-native module specifier. |
| npm | `npm:` | `npm:@scope/package` | An environment-appropriate package specifier. |

`teq:` is invalid serialized syntax. Namespace Mapping applies only to Teq;
never treat Node or npm addresses as Teq namespaces. Node addressing is
Node.js-specific. npm addressing can be supported by different runtime routes,
including a supported browser environment.

## Export Selection and Lifestyle

`__ExportName` selects a named export. A Lifestyle Marker selects the default
export when no export was explicitly selected. Without an export selection and
without a marker, Direct exposes the whole module namespace.

```text
App_Service                    whole module namespace, Direct
App_Service__format            named export, Direct
App_Service$                   default export, Singleton
App_Service__create$$          named export, Transient
App_Service__format$$$_trace   named export, explicit Direct with Wrapper Selection
```

| Dependency Lifestyle | Marker | Result |
| --- | --- | --- |
| Direct | no marker, or `$$$` explicitly | Exposes the selected export as-is. It does not invoke a function or construct a class. |
| Singleton | `$` | Uses the selected export as a producer and reuses one final managed value in this Container graph. |
| Transient | `$$` | Uses the selected export as a producer and produces a fresh value for each applicable resolution. |

Direct is not Transient. `$$$` is explicit Direct, not a producer mode. Native
ESM caching does not provide Container-managed Singleton behavior.

## Wrapper Selection

Append one or more wrapper names after a Lifestyle Marker, separated by `_`:

```text
App_Service$$_trace_metrics
App_Service__format$$$_trace
```

Wrappers are selected by the Dependency Identifier and run in their declared
order. They can adapt a Direct value. Use `$$$` when a Direct request needs the
explicit Lifestyle Marker required by Wrapper Selection.
