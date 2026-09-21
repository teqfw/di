# Type Declarations

`types.d.ts` supplies global JSDoc aliases that mirror current implementation
modules and selected public constructable exports. It is useful for editor lookup
and the package's present JavaScript type checking.

Do not read a bare alias as a universal type for a value resolved from a
Dependency Identifier. The same selected JavaScript export has different
runtime meaning by Dependency Lifestyle:

- Direct exposes the raw selected export.
- Singleton and Transient expose a producer result.
- `$$$` remains Direct despite having a marker.

The package has not selected a consumer-facing alias scheme that maps all three
outcomes automatically. Do not invent one in host code or claim that every bare
class alias means an instance. Runtime Lifestyle Markers are not JSDoc type
identifiers.

Use a structural host-owned type for a substitutable abstraction when needed,
and verify an exact alias against the installed `types.d.ts`. A future coherent
consumer type-map decision requires a coordinated package change rather than a
local naming convention.
