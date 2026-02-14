# Agent Iteration Logging Protocol

Path: `./ctx/agent/report/AGENTS.md`
Version: `20260214`

## Directory Purpose

The `ctx/agent/report/` directory is designated for archival recording of completed interaction iterations between the human and the agent. Each report file represents a single completed iteration and confirms the consistency of the changes introduced.

## Level Map

- `YYYY/` — hierarchical storage structure for reports organized by year with nested month and day directories.
- `AGENTS.md` — this document, defining the invariants of the `report/` level.

## Reporting Invariants

Each completed iteration must be recorded as a separate file at the path `./ctx/agent/report/YYYY/MM/DD/HH-MM-{title}.md`. Absence of a report means the iteration is not considered recorded.

A report contains a structured description of the iteration goal, the performed changes, and the obtained results. The report establishes the relationship between the task definition and the modifications in context or code, but it is not a source of project invariants.

## Report Status

A report is an archival document and must not be edited after creation. Corrections are performed only by creating a new report. Deletion of a report is permitted if it is recognized as erroneous or irrelevant.

The `report/` directory is not used by the agent as a default working context and does not participate in reconstruction of the architectural state of the project.

## Summary

`ctx/agent/report/AGENTS.md` defines a declarative protocol for recording iterations, ensuring archival integrity of the interaction history without affecting the project invariants of the system.
