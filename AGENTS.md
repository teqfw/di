# Root Level

- Path: `AGENTS.md`
- Template Version: `20261114`
- Changed: `20261117`

## Boundary

This file controls repository work. `ctx/` owns project meaning and is authoritative for product and implementation decisions; consult `ctx/AGENTS.md` and task-relevant context for design or code changes. If implementation conflicts with accepted context, follow the context and report any proposed change to accepted meaning for human approval rather than silently rewriting it. Read navigation documents only when needed and avoid rereading unchanged instructions within a session. Use the `adsm-ctx` skill when available for context lifecycle work.

Accepted context declares the current target, including approved requirements not yet implemented; code and tests converge toward it. Obsolete narratives, speculation, plans, and reports are not authoritative declarations.

`ctx/` may be part of this repository or a separately mounted repository. Detect its Git boundary before editing, preserve separate histories, and never remove, replace, relocate, or unmount it. If absent, create `ctx/` only when bootstrap is within the assigned scope. Deeper `AGENTS.md` files refine local rules without overriding root invariants.

A task may cover multiple repositories. Coordinate affected contracts and consumers, verify their integration, and keep each Git history separate. Do not expand into unrelated repositories. The human defines scope and approves changes to accepted meaning.

## Development Policy

Default to Rapid Evolution by Default, Reliability by Requirement: deliver the essential happy path for fast feedback, fail visibly on unexpected conditions, and avoid speculative defenses and backward compatibility unless justified by accepted requirements, demonstrated problems, or meaningful identified risks. Verify essential contracts and increase verification when risk or observed defects justify it. Accepted context defines the target; humans determine acceptable risk and may strengthen or replace this default. Preserve security, integrity, and explicit invariants. Consult the `adsm-ctx` skill for the policy.

This default includes fresh integration of trusted, actively developed first-party dependencies without separate opt-in. Accepted requirements or human instructions may override it; preserve required security, integrity, offline operation, and reproducibility, particularly for releases and deployments. Follow the skill's dependency guidance.

When reviewing dependency versions, lockfiles, installation, or reproducibility, assess the applicable project policy and deployment boundaries before reporting a violation. Distinguish demonstrated violations from trade-offs and missing evidence; consult the skill's dependency review guidance.

## Efficient Execution

Classify the task before reading context or running checks. Git-only work needs Git-state checks, not product-context scans or tests. For code or context changes, inspect only relevant owners; run deterministic checks chosen by changed responsibility and risk. Capture verbose output outside the model context and inspect logs on failure or when evidence is needed. Report results, omitted coverage, and material risks concisely.

Before checks, identify the intended outcome, essential happy path or contract, suitable environment, and sufficient evidence. Verify each package under work with its applicable tests; verify dependencies only as needed for the affected contract unless more is requested or required. Choose the smallest useful check; stop when it supplies sufficient evidence. Do not expand verification beyond the task's requested scope without an explicit request; follow binding project requirements and limit diagnosis of a failed check to the failure. If prerequisites are absent, report the limit rather than constructing an unrequested verification environment. Follow the skill's testing and verification guidance.

Do not modify, replace, delete, or relocate this file without explicit human instruction. Do not read, search, or expose secret-bearing files or credentials; non-secret examples may describe configuration shape. If a secret is accidentally exposed, do not repeat it; notify the human that it should be rotated or revoked.

## Git Delivery

An explicit task instruction to commit and push authorizes delivery of the verified commit to the named repository and branch, or to its configured upstream when the branch is unspecified. Inspect the worktree, branch, and remote before pushing. If sandbox networking blocks Git, use the normal approved escalation path; do not ask for duplicate authorization.

An automated approval rejection is a platform restriction, not evidence that user authorization is missing. Report the specific restriction and request only the approval the gate requires. Keep delivery pending while that approval is required. These instructions do not override platform security or approval controls or applicable repository rules.
