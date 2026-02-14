# Namespace Convention

## Purpose

This convention defines a stable, readable namespace format for identifiers used across JavaScript libraries. It separates public contracts from internal implementation and keeps naming zones semantically strict.

## Namespace format

Use underscore-delimited segments:

`<Vendor>_<Library>_<Zone>\_<NameParts...>`

### Segment rules

- `<Vendor>`: stable vendor/author prefix.
- `<Library>`: stable library name prefix.
- `<Zone>`: a single semantic marker (see Zones).
- `<NameParts...>`: logical name parts; each part is a separate segment.
- Use a single casing style across the library (recommended: PascalCase per segment).

### Examples

- `Acme_MyLib_Api_Container`
- `Acme_MyLib_Spi_Logger`
- `Acme_MyLib_Int_Resolver_Stack`
- `Acme_MyLib_Core_Resolver`

## Zones

Zones express _semantic role_ of a namespace. Use exactly one zone segment per identifier.

### Public zones (external contracts)

- `_Api_` — consumer-facing contracts: types/interfaces expected to be used (called) by library consumers.
- `_Spi_` — provider-facing contracts: extension points expected to be implemented (provided) by external code.

### Internal zones (not part of the external compatibility promise)

- `_Int_` — internal contracts (“internal headers”): types/interfaces used only inside the library.
- `_Core_` — implementation code: concrete internals, algorithms, utilities.

### Optional zones (use only if the meaning is strict)

- `_Dto_` — data shapes (transport/data contracts). Decide upfront whether DTOs are part of the public contract or internal only.

## Semantic constraints

### Zone orthogonality

- Do not combine zones in a single identifier (avoid forms like `_Api_Spi_`, `_Core_Api_`).
- If a concept needs two different roles, define two identifiers in different zones.

### Dependency direction (conceptual)

- `_Api_` and `_Spi_` describe contracts and must remain independent from implementation details.
- `_Int_` may reference public contracts but must not become an external dependency surface.
- `_Core_` may depend on contracts but must not “leak” as a required import surface for consumers.

## Stability promise

- `_Api_` and `_Spi_` are compatibility surfaces: changes should follow semantic versioning expectations.
- `_Int_` and `_Core_` may change freely between versions unless explicitly declared otherwise.

## Naming guidance

- Prefer short, specific `<NameParts...>` with clear intent.
- Avoid abbreviations unless they are established project-wide.
- Keep the namespace stable across refactors; do not rename without a compatibility reason.
