# Scope and Responsibility

Path: `./ctx/docs/product/scope.md`

## Application Domain

`@teqfw/di` is an object container for programs based on ES6 modules within the JavaScript ecosystem. Its scope is limited to the ES module model.

## Responsibility

The container is responsible for disciplined object creation and dependency resolution through late binding. It links modules and instantiates objects according to declarative dependencies.

## Supported Concerns Within Scope

Within its responsibility boundary, the container may:

- detect and prevent cyclic dependencies;
- provide diagnostic information in debug mode;
- support configuration for namespace mapping and extension integration;
- maintain internal operational state required for resolution and testing modes.

## Out of Scope

The container does not manage:

- application lifecycle;
- domain logic;
- execution policies;
- security policies;
- runtime platform behavior.

## Extensibility

The container supports extensions that can alter resolution strategies, identifier interpretation, or object wrapping. These modifications remain external to the core responsibility.

## Evolution Boundary

Higher-level systems may be built on top of the container, while the container scope remains limited to disciplined object linking and dependency resolution.
