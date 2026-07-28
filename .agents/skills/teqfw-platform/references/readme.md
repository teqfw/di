# README Rules

## Source of truth

Read `ctx/docs/code/components/readme.md` before changing the shipped root README.

## Public entry contract

Present `@teqfw/di` as a runtime container for deterministic linking of native ES modules through explicit Dependency Specifiers and `__deps__`.

Describe the public adoption path around `Container`:

- `new Container()`;
- configuration before the first `get` call;
- namespace-root registration with `addNamespaceRoot(prefix, target, defaultExt)`;
- dependency retrieval with `get(specifier)`;
- test mode and mock registration briefly.

Explain namespace roots as module-location mappings, not merely filesystem paths. Keep browser-compatible use and agent-oriented context secondary to the public container explanation.

## Boundaries

Use current product and architecture terminology. Do not use removed legacy Dependency Specifier terminology. Do not present UMD as runtime semantics, package discovery as runtime dependency resolution, or internal helpers and pipeline stages as public API.

Keep the README concise and adoption-oriented. It may summarize authoritative documentation but must not duplicate internal algorithms, lifecycle details, or code-level contracts.
