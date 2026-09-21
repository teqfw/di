# Composition Extensions

The Composition Root declares Preprocessors, Postprocessors, and an optional
Hardener as separate Container-policy mechanisms in the immutable DTO before
constructing the Container. Wrappers are separate: a Dependency Identifier
selects them for an individual resolution and they are not global DTO policy.
Keep their ownership and timing distinct.

## Preprocessors and Dependency Substitution

`preprocessors` contains ordered producer Dependency Identifiers. Container
materializes every configured policy producer under default policy once before
installing any of them or beginning the first entry; each
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

## Hardener

The optional `hardener` producer Dependency Identifier materializes one
Container policy function. It receives each final adapted value after configured
Postprocessors and selected Wrappers. It is not a Wrapper and does not select a
dependency-specific adaptation.

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
