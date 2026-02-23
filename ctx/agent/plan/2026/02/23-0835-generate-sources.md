# Implementation Strategy

Build bottom-up, one component at a time:

1. Structural layer (Enums, DTOs, Parser) — already implemented
2. Infrastructure layer (Resolver, Instantiator) — implemented
3. Dependency graph resolution
4. Lifecycle management
5. Wrapper pipeline execution
6. Container orchestration
7. Integration tests
8. Public API stabilization

Each stage must include:

- Implementation of a single component
- Corresponding unit tests
- Compliance verification
- Freeze before proceeding

---

## Stage 1 — Graph Resolver

Component:
`src2/Container/Resolve/GraphResolver.mjs`

Responsibilities:

- Accept root DepId
- Load module via Resolver
- Extract `__deps__` (if present)
- Parse dependencies via Parser
- Recursively resolve graph
- Detect cycles (fail-fast)
- Return resolved dependency map

Exclude:

- Lifecycle handling
- Wrapper execution

Add unit tests covering:

- No dependencies
- Nested dependencies
- Cyclic detection
- Missing namespace rule

---

## Stage 2 — Lifecycle Registry

Component:
`src2/Container/Lifecycle/Registry.mjs`

Responsibilities:

- Singleton caching
- Transient passthrough
- Cache key based on DepId structural identity

Add unit tests:

- Singleton reuse
- Transient new instance
- Independent keys
- No effect on AS_IS composition

---

## Stage 3 — Wrapper Executor

Component:
`src2/Container/Wrapper/Executor.mjs`

Responsibilities:

- Execute ordered wrapper pipeline
- Each wrapper is callable
- Synchronous only
- Fail on missing wrapper or thenable result

Add unit tests:

- Single wrapper
- Multiple wrappers
- Thenable rejection
- Missing wrapper error

---

## Stage 4 — Container Core

Component:
`src2/Container.mjs`

Dependencies:

- Parser
- Resolver
- GraphResolver
- Instantiator
- LifecycleRegistry
- WrapperExecutor

Public API:

- `get(edd)`
- `getDepId(depId)`

Execution flow:

1. Parse
2. Resolve graph
3. Instantiate
4. Apply lifecycle
5. Apply wrappers
6. Return value

Add unit tests:

- Teq singleton
- Teq transient
- npm platform
- node platform
- Named export injection
- Default export injection
- Nested graph
- Error propagation

---

## Stage 5 — Integration Tests

Directory:
`test2/integration/`

Cover:

- Longest-prefix namespace resolution
- Composition modes
- Lifecycle + factory
- Mixed platform graphs
- Wrapper + lifecycle interaction

---

## Stage 6 — Final Stabilization

- Verify structural compliance
- Verify JSDoc compliance
- Verify type declarations (`types.d.ts`)
- Confirm layer boundaries
- Confirm deterministic behavior

---

Execution rule:

Never implement multiple architectural layers in a single Codex iteration.
Each layer must be isolated, validated, and frozen before proceeding.
