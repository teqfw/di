# Composition Extensions

The Composition Root declares three separate mechanisms in the immutable DTO
before constructing the Container. Keep their ownership and timing distinct.

## Preprocessors and Dependency Substitution

`preprocessors` contains ordered producer Dependency Identifiers. Container
materializes each producer under default policy before root resolution; each
producer synchronously returns policy that receives a requested parsed
Dependency Identifier and returns its effective replacement before module
loading. Dependency Substitution is its primary use.

A substitution may change the address kind, address, export selection,
lifestyle, or wrappers. It must preserve a coherent Dependency Identifier. Do
not create a second identifier language, depend on Container internals, or
substitute by adding static imports to runtime modules. Treat the callback's
identifier carrier as package-internal structure; this skill intentionally does
not prescribe its fields or a new consumer type model.

## Postprocessors

`postprocessors` contains ordered producer Dependency Identifiers. Each
materialized producer synchronously returns a function that adapts each newly
acquired dependency value after Direct exposure or producer acquisition and
before final exposure.

Postprocessors are synchronous. Do not return a Promise or mutate a value after
the Container has exposed and hardened it.

## Wrappers

Wrappers are not registered global policy. They are selected by the Dependency
Identifier and resolved from the dependency module itself:

```text
App_Service$$_trace_metrics
App_Service__format$$$_trace
```

Configured Postprocessors run in configuration order, then selected Wrappers
run in identifier order, then applicable final-value hardening occurs. A Wrapper
does not change the selected Dependency Lifestyle or Address Kind.
