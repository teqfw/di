# Composition Extensions

The Composition Root declares producer identifiers for Preprocessors,
Postprocessors, and optional custom Hardener processing in the DTO before
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

Hardener processing is mandatory under default and configured policy. After
configured Postprocessors and selected Wrappers, the Container settles any
Promise/thenable and freezes the ordinary object or function actually delivered
to the consumer. It does not satisfy this guarantee by freezing only a carrying
Promise. A successful Singleton hit reuses its already hardened final value.

The optional `hardener` producer Dependency Identifier materializes a
synchronous function receiving that settled adapted value. It may strengthen
protection or return a replacement, but its result must be terminal and is still
subject to the mandatory freeze. A Promise/thenable result, function error, or
ordinary freeze failure rejects only the active entry; failed Singleton
production is not cached and queued work continues. Input settlement rejection
occurs before Hardener and likewise ends only its entry.

Primitives and already frozen values are preserved. Runtime-owned ES Module
Namespace Objects retain native semantics and live bindings. Ordinary objects
cannot claim that exception merely because freezing fails. Shallow freezing
does not freeze nested objects, closure state, or external resources. The custom
function is not a Wrapper or dependency-specific Wrapper Selection.

## Wrappers

Wrappers are not registered global policy. They are selected by the Dependency
Identifier and resolved from the dependency module itself:

```text
App_Service$$_trace_metrics
App_Service__format$$$_trace
```

Configured Postprocessors run in configuration order, then selected Wrappers
run in identifier order, followed by Promise/thenable settlement and mandatory
final-value hardening. A Wrapper does not change the selected Dependency
Lifestyle or Address Kind. Producers, Postprocessors, and Wrappers remain
synchronous; this settlement stage does not permit them to return Promises.
