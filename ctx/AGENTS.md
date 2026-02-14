# Cognitive Layer of the Project

Path: `./ctx/AGENTS.md`
Version: `20260214`

## Purpose

The `ctx/` directory defines the composition and boundaries of the project’s cognitive layer. Documents at this level establish the organizational and declarative configuration of the context and delimit the `agent/`, `docs/`, and `assets/` branches without including product code.

## Document Attributes

Each document at the `ctx/` level must begin with an attribute block in the following form:

```md
Path: `./ctx/<subdir>/doc-name.md`
Version: `YYYYMMDD`
```

Attributes are placed immediately below the document title and must follow the specified format.

### Path

`Path` is a mandatory attribute that specifies the exact location of the document within the project structure. Its value must correspond to the actual file path. Any mismatch between the declared and actual path constitutes a violation of the level invariant.

### Version

`Version` is an optional attribute used for documents intended for cross-project reuse. The value format is `YYYYMMDD`. The decision to include this attribute is made by the human. If the attribute is present, the agent must preserve it and update its value when the invariants of the document change. If invariants remain unchanged, the version must not be updated. The agent must not introduce the `Version` attribute on its own initiative.

## Level Map

- `agent/` — organizational branch: agent operating mode, interaction rules, and reporting.
- `assets/` — auxiliary materials of the cognitive layer: diagrams, schemes, tables, and other static carriers without normative status.
- `docs/` — declarative branch of project documentation: architecture, composition, engineering conventions, and product description.
- `AGENTS.md` — this document, defining the structure of the `ctx/` directory.

## Hierarchy Principle

Subdirectories of `ctx/` inherit the constraints of the current level and may refine them only within their defined boundaries. Redefinition of level invariants or expansion of its boundaries is not permitted.

## Summary

`ctx/AGENTS.md` defines the structure of the project’s cognitive layer and ensures consistent separation of the `agent/`, `docs/`, and `assets/` branches within this level of context.
