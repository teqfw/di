---
name: project-conventions
description: Project-wide conventions that must be loaded for every agent session in this repository.
---

# Project Conventions

Apply the following rules in order of priority. If a rule conflicts with an applicable `AGENTS.md` instruction, follow `AGENTS.md`.

## 1. Repository topology

- Treat the root repository and `ctx/` as separate Git repositories.
- Treat `ctx/` as the cognitive-context repository: [`flancer32/teqfw-di-ctx`](https://github.com/flancer32/teqfw-di-ctx).
- Keep changes, Git status checks, commits, and pushes within the repository to which they belong. Do not mix their changes.

## 2. Git workflow

Work directly on `main` in both repositories. Do not create working branches.

## 3. Communication

- Communicate with the user in Russian unless the user explicitly requests another language.
- Write source code, comments, documentation, commit messages, and identifiers in English.
- Report the changes made, the verification performed, and remaining risks.
- Create a GitHub issue in `flancer32/ai-memo` when a problem requires the user's attention.
