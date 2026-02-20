# AGENTS.md — `src2/`

Path: `./src2/AGENTS.md`

## Scope

This file governs all source code under `./src2/`.

All changes in this directory MUST comply with normative documents located in `ctx/docs/code/`.

## Normative References (Code)

The following documents are mandatory:

- `ctx/docs/code/structure.md`
- `ctx/docs/code/container.md`
- `ctx/docs/code/resolver.md`
- `ctx/docs/code/parser.md`
- `ctx/docs/code/lifecycle.md`
- `ctx/docs/code/depid.md`
- `ctx/docs/code/testing.md`
- `ctx/docs/code/conventions/teqfw/dto.md`
- `ctx/docs/code/conventions/teqfw/enum.md`

Agent MUST read and follow them before generating or modifying code.

## Structural Compliance

Code structure, directory layout, naming rules, namespace mapping, and dependency direction MUST strictly follow `ctx/docs/code/structure.md`.

Any deviation constitutes an execution error.

## JSDoc Requirement

JSDoc compliance is mandatory and defined in:

- `ctx/docs/code/structure.md`

All exported entities and their public surface MUST be annotated accordingly.
Private fields and private methods in classes MUST also be annotated with JSDoc, including parameter and return typing for private methods.
Local `const`/`let`/`var` values with non-primitive or non-obvious types MUST be annotated with JSDoc `@type`; obvious primitive locals may be left without explicit annotation.

For public DTO typing in JSDoc, existing aliases from `types.d.ts` MUST be used when available (for example `TeqFw_Di_Dto_Resolver_Config$DTO`, `TeqFw_Di_Dto_Resolver_Config_Namespace$DTO`, `TeqFw_Di_DepId$DTO`).

Creating local replacement typedef aliases for already declared public DTO types is prohibited.

Absence of required JSDoc constitutes non-compliance.

## Testing Alignment

Unit and integration tests MUST follow:

- `ctx/docs/code/testing.md`
