# EDD Grammar Terminology Alignment

## Goal

Eliminate ambiguity between the term `IdentifierName` and the actual lexical constraints applied to EDD, while preserving all existing validation and semantic behavior.

## Actions

1. Reviewed context governance files (`AGENTS.md`) for `ctx/`, `ctx/docs/`, `ctx/docs/architecture/`, `ctx/docs/product/`, and reporting rules.
2. Located all `IdentifierName` references in documentation related to EDD grammar.
3. Determined that the intended lexical model is a custom ASCII-only class (not ECMAScript `Identifier`) because reserved keywords remain admissible while Unicode and leading digits are forbidden.
4. Introduced and normalized the term `AsciiEddIdentifier` as the formal lexical class and aligned cross-document references.
5. Kept parser/profile semantics unchanged and updated only terminology and lexical definition wording.

## Artifacts

Updated documentation files:

- `ctx/docs/architecture/edd-model.md`
- `ctx/docs/architecture/overview.md`
- `ctx/docs/architecture/parser/validation.md`
- `ctx/docs/architecture/parser/overview.md`
- `ctx/docs/product/default-edd-profile.md`
- `ctx/docs/product/overview.md`

Created report:

- `ctx/agent/report/2026/02/16/19-03-align-edd-grammar-terminology.md`
