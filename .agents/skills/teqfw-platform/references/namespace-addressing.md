# Module Token and Dependency Specifier Rules

## Source of truth

Read `ctx/docs/product/glossary.md` and `ctx/docs/architecture/structure.md` before changing dependency-specifier parsing, linking, or compatibility behavior.

## Terms

- A **Namespace** is an addressing space independent from module locations.
- A **Module Token** is the stable logical identity of a module. It contains no export, lifecycle, or wrapper selection.
- A **Dependency Specifier** is a Module Token with optional export, lifecycle, and wrapper selectors.
- An **ES Module** is the runtime loading unit. Its preferred Principal Application Value is its default export.
- `__deps__` declares the Dependency Specifiers required by a module's Principal Application Value.

## Canonical interpretation

Preserve the one canonical Dependency Specifier interpretation. The parser validates the text, derives `DepId`, and rejects invalid or contradictory declarations deterministically.

`DepId` carries `moduleName`, `platform`, `exportName`, `composition`, `life`, ordered `wrappers`, and `origin`. Runtime linking operates on this structural identity rather than raw text.

Lifecycle selectors are:

- no marker — direct;
- `$` — singleton;
- `$$` — transient;
- `$$$` — direct.

For default-export factory selection, preserve the explicit canonical forms `Module__default$`, `Module__default$$`, and `Module__default$$$`. The corresponding shorthand forms without `__default` are compatibility-equivalent. Add wrapper selectors through the documented underscore-separated suffix form, such as `Module$_log`.

Do not introduce alternative Dependency Specifier grammars, equivalence classes, selector meanings, or lifecycle mappings.

## Namespace mapping

Declare package namespace mappings under `teqfw.namespaces` in `package.json`. A mapping prefix ends in `_`; its path is a package-relative module-location root; its extension defaults to `.mjs` and is normalized before the container receives it.

Build and validate namespace mappings during composition. Runtime resolution consumes finalized mappings and must not read manifests, discover packages, normalize entries, or use fallback probing.
