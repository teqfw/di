# Type Declarations

`types.d.ts` supplies global JSDoc aliases that mirror current implementation
modules and selected public constructable exports. It is useful for editor lookup
and the package's present JavaScript type checking.

For a class-shaped module, the bare alias names the consumer/instance contract,
while `__Class` names the importable constructable export:

```text
Ns_Service         → consumer / Service-instance contract
Ns_Service__Class  → constructable Service export
```

This static distinction is independent of Dependency Identifier syntax. A
Dependency Identifier `Ns_Service$` acquires a produced instance, while
`Ns_Service` or `Ns_Service$$$` acquires the class export directly; neither
runtime marker changes JSDoc alias spelling. Use a structural host-owned type
for a substitutable abstraction when needed, and verify an exact alias against
the installed `types.d.ts`.
