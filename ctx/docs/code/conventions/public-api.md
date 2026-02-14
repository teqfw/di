# Public API Surface

Path: `ctx/docs/code/conventions/public-api.md`

## 1. Intent

This document defines the **target public API surface** of the package: which contracts are intended to be stable and used by external projects, and which contracts are intentionally excluded from the public surface.

The container is a **composition core**: external code uses it to compose **root objects**. Extensibility is allowed only along the declared axes (pre-processing, post-processing, namespace/path resolution, binding rules). The dependency identifier language (DSL) is canonical and is **not** an extension point.

## 2. Public API skeleton (what exists for consumers)

Public API is grouped by role. Reading order is “from the core to the details”.

### 2.1 Runtime surface (composition phase)

- `TeqFw_Di_Api_Container`
  - `compose(depId): Promise<*>`

This is the only runtime operation exposed to consumer code.

### 2.2 Configuration surface (composition root only)

- `TeqFw_Di_Api_Container_Config`
  - `preProcessor(): TeqFw_Di_Api_Container_PreProcessor`
  - `postProcessor(): TeqFw_Di_Api_Container_PostProcessor`
  - `resolver(): TeqFw_Di_Api_Container_Resolver`
  - `finalize(): TeqFw_Di_Api_Container`

Configuration contracts are used only in the **composition root** before the first `compose()` call.

### 2.3 Extension surface (optional behavior modification)

These contracts define the shapes that external code may provide to modify container behavior along the allowed axes.

Pre-resolution identifier transformation:

- `TeqFw_Di_Api_Container_PreProcessor`
  - `addChunk(chunk: TeqFw_Di_Api_Container_PreProcessor_Chunk): void`
  - `modify(depId: TeqFw_Di_DepId, stack: string[]): TeqFw_Di_DepId`
- `TeqFw_Di_Api_Container_PreProcessor_Chunk`
  - `modify(depId: TeqFw_Di_DepId, originalId: TeqFw_Di_DepId, stack: string[]): TeqFw_Di_DepId`

Post-processing of composition results:

- `TeqFw_Di_Api_Container_PostProcessor`
  - `addChunk(chunk: TeqFw_Di_Api_Container_PostProcessor_Chunk): void`
  - `modify(obj: *, depId: TeqFw_Di_DepId, stack: string[]): Promise<*>`
- `TeqFw_Di_Api_Container_PostProcessor_Chunk`
  - `modify(obj: *, originalId: TeqFw_Di_DepId, stack: string[]): *`

Namespace / path resolution strategy:

- `TeqFw_Di_Api_Container_Resolver`
  - `resolve(moduleName: string): string`

## 3. Test-only public surface (optional product feature)

If test mode is a supported capability, it is part of the public configuration API but is constrained to tests.

- `TeqFw_Di_Api_Container_Config`
  - `enableTestMode(): void`
  - `register(depId: string, obj: object): void`

In production mode, explicit registration/substitution is forbidden.

## 4. Explicit exclusions (not in the target public surface)

This section exists to prevent accidental publication of non-target contracts.

### 4.1 No service-locator runtime API

- `TeqFw_Di_Api_Container.get(...)` is not part of the target public runtime surface.
- The public runtime container exposes only `compose(depId)`.

Rationale: public “get by id” semantics encourages service-locator usage and blurs the composition-only model.

### 4.2 No parser extension surface (DSL is frozen)

The dependency identifier language is canonical and not an extension point. Therefore:

- `TeqFw_Di_Api_Container_Parser` and `TeqFw_Di_Api_Container_Parser_Chunk` are not part of the target public surface.
- `TeqFw_Di_Api_Container_Config.parser()` is a legacy/temporary facet and must not be relied upon as a public capability.

Parser implementation and any internal parsing helpers are internal mechanisms.

## 5. Publication rule (types)

Only contracts listed in sections 2 and 3 (and DTOs referenced by their signatures) are intended to be published into consuming projects via the package type surface (`types.d.ts` global declarations). Everything else is internal, even if present in source form.
