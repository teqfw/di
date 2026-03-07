# concepts.md

Version: 20260307

## Purpose of the Container

The container provides a deterministic mechanism for linking ES modules at runtime. Instead of static imports between modules, dependencies are resolved through a central container that loads modules, instantiates exported factories, and returns linked objects. This approach separates module implementation from dependency resolution and allows systems to assemble components dynamically.

## Late Binding

Dependencies between modules are resolved at runtime rather than during module loading. Modules do not import their collaborators directly and therefore remain independent of concrete implementations. The container performs dependency resolution when an object is requested, which allows components to be replaced, extended, or mocked without modifying module code.

Late binding enables the following properties:

- reduced coupling between modules
- runtime replacement of implementations
- simplified testing through dependency substitution
- compatibility with different runtime environments

## Dependency Container

The container acts as the composition root of the application. It receives dependency requests expressed as identifiers, resolves them into module locations, loads the corresponding ES modules, and produces linked objects.

The container is responsible for:

- translating dependency identifiers into module references
- loading ES modules dynamically
- instantiating exported factories
- applying preprocessing and postprocessing steps
- returning fully linked objects to the caller

Application modules do not construct their dependencies directly and do not perform dependency resolution.

## Dependency Identifiers

Dependencies are addressed using structured identifiers interpreted by the container. An identifier describes how the dependency should be resolved and how the resulting object should be instantiated.

Dependency identifiers define:

- which module provides the dependency
- which export must be used
- whether the dependency represents a singleton or a new instance

The identifier syntax and resolution rules are described in **dependency-id.md**.

## Namespaces

Namespaces provide deterministic mapping between logical identifiers and module locations. Each package defines a namespace root that corresponds to a directory containing source modules.

The container resolves identifiers by applying namespace rules that translate identifier prefixes into filesystem paths. This mechanism allows modules to be referenced through stable logical names instead of file paths.

Namespace resolution ensures:

- predictable module addressing
- isolation between packages
- consistent mapping between identifiers and modules

## Immutable Linked Objects

Objects returned by the container represent linked components of the application and are treated as immutable values. After an object is created and linked, it is frozen to prevent runtime modification.

Immutability ensures that:

- components behave consistently after linking
- shared instances cannot be altered by consumers
- the container remains the single authority responsible for object construction
