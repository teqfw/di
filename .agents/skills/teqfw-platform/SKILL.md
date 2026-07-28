---
name: teqfw-platform
description: Apply the current TeqFW platform rules for the `@teqfw/di` package when implementing, reviewing, or documenting its JavaScript/npm artifacts. Use for Module Tokens and Dependency Specifiers, `types.d.ts`, ES modules, JSDoc, `package.json`, or the shipped root README.
---

# TeqFW Platform

Apply the current code-level rules of `@teqfw/di` only. Do not apply this skill to another TeqFW package without an explicit package-local adaptation. Treat the project cognitive context and applicable `AGENTS.md` instructions as authoritative.

## Load relevant references

- For Module Tokens, Dependency Specifiers, export selection, lifecycle selection, or wrappers, read [namespace-addressing.md](references/namespace-addressing.md).
- For `types.d.ts`, static aliases, or JSDoc type references, read [types-map.md](references/types-map.md) and [jsdoc.md](references/jsdoc.md).
- For source-module structure, read [es6-module.md](references/es6-module.md).
- For `package.json`, package exports, scripts, or namespace metadata, read [package-json.md](references/package-json.md).
- For the shipped root `README.md`, read [readme.md](references/readme.md).

Load only the references that cover the requested change.

## Route architecture-sensitive changes

For a change to Dependency Specifier semantics, parsing, `DepId`, runtime linking, lifecycle, wrappers, preprocess, postprocess, or resolver behavior:

1. Read the applicable component contract under `ctx/docs/code/components/`.
2. Read every document listed in that contract's `Normative References` or `Normative Architecture References` section.
3. Preserve the fixed architectural pipeline and report a contradiction before editing.

When no component contract applies, read the following documents before changing architecture semantics:

- `ctx/docs/product/overview.md`
- `ctx/docs/product/domain.md`
- `ctx/docs/product/glossary.md`
- `ctx/docs/architecture/overview.md`
- `ctx/docs/architecture/structure.md`
- `ctx/docs/architecture/behavior.md`
- `ctx/docs/architecture/state.md`
- `ctx/docs/architecture/constraints.md`

## Resolve conflicts

1. Follow the applicable `AGENTS.md` hierarchy and cognitive context.
2. Treat these references as a task-oriented projection of the current context, not as an independent source of rules.
3. When a change affects product or architecture semantics, read the linked context source before editing and report any contradiction.
