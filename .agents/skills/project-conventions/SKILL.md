---
name: project-conventions
description: Project-specific conventions. Use for every task in this repository.
---

# Project Conventions

`AGENTS.md` overrides this file.

## Repositories

- The root and `ctx/` are separate Git repositories; do not mix Git operations.
- `ctx/` is the cognitive-context repository: [`flancer32/teqfw-di-ctx`](https://github.com/flancer32/teqfw-di-ctx).

## Workflow

- Work on `main` in both repositories unless the task specifies another branch; do not create branches.
- Before work, fetch both repositories and ensure the current branches match their upstreams.

## Communication

- User: Russian unless requested otherwise; code, comments, docs, commits, identifiers: English.
- Report changes, verification, and remaining risks.

## Shared memory

- `flancer32/ai-memo` is the shared cross-project issue tracker and memory.
- May create issues: source `teqfw/di`; name the project or projects expected to resolve them.
- In GitHub issue descriptions and comments, use actual line breaks; literal `\n` is displayed as text.
- Notes: `project/teqfw/di/`.

## Validation

- Do not use `teqfw-esm-validator`.

## TeqFW platform

- Use `teqfw-platform` only for `@teqfw/di` tasks; otherwise require package-local adaptation.

## Editing fallback

- Use `apply_patch`; on `bwrap` or network-namespace failure, use scoped `git apply`.
- Do not use shell redirection, `cat`, or broad rewrites; after fallback, run `git diff --check` in each affected repository.
