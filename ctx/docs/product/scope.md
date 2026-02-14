# Scope and Responsibility

Path: `./ctx/docs/product/scope.md`

## Application Domain

`@teqfw/di` is intended for use in any program built on ES6 modules. The container is conceptually limited to the JavaScript ecosystem and operates exclusively within the ES module model. It does not aim to abstract over multiple language runtimes or module systems.

## Responsibility

The container is an infrastructure tool responsible for disciplined object creation and dependency resolution through late binding. Its responsibility is limited to linking modules and instantiating objects according to declarative dependency definitions.

The container does not manage application architecture, domain logic, or execution policies. Architectural outcomes emerge from its disciplined usage but are not directly governed by the container.

## Supported Concerns Within Scope

Within its responsibility boundary, the container may:

- detect and prevent cyclic dependencies,
- provide diagnostic information in debug mode,
- support configuration related to namespace mapping and extension integration,
- maintain internal operational state necessary for resolution and testing modes.

These concerns remain strictly related to controlled dependency resolution and object composition.

## Out of Scope

The container does not:

- manage application lifecycle phases,
- implement runtime platforms,
- enforce domain-level policies,
- define security policies,
- regulate execution strategies beyond dependency linking.

Any functionality beyond disciplined object linking lies outside the core responsibility of the product.

## Extensibility

The container allows behavioral modification through extensions. Extensions may alter resolution strategies, identifier interpretation, or object wrapping. Such modifications are external to the core and do not redefine the fundamental responsibility of the container.

The existence of extension points does not expand the responsibility of the core system.

## Evolution Boundary

The product does not aim to expand its responsibility into a runtime framework or application platform. Higher-level systems may be constructed on top of the container, but such systems remain separate from its core scope.
