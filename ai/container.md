# container.md

Version: 20260331

## Role of the Container

The container provides the operational mechanism that links ES modules at runtime. It resolves dependency identifiers, loads modules, instantiates exported factories, and returns fully linked objects. The container serves as the composition root of the system and centralizes all dependency resolution.

Application modules do not resolve dependencies themselves and do not construct collaborators directly. Instead, they request dependencies from the container using dependency identifiers.

## Container Responsibilities

The container performs the following responsibilities:

- interpret dependency identifiers
- resolve identifiers into module locations
- load ES modules dynamically
- instantiate exported factories
- apply preprocess and postprocess handlers
- manage object lifecycle semantics
- freeze linked objects before returning them

These responsibilities ensure deterministic runtime linking between modules.

## Dependency Resolution Pipeline

When a dependency is requested, the container processes the request through a deterministic pipeline consisting of the following stages:

1. **Parse** — interpret the dependency identifier.
2. **Preprocess** — allow registered preprocess handlers to transform the identifier.
3. **Resolve** — translate the identifier into a module reference.
4. **Instantiate** — load the module and create the object using the selected export.
5. **Postprocess** — apply wrapper handlers to the created object.
6. **Lifecycle** — apply lifecycle semantics such as singleton caching or instance creation.
7. **Freeze** — freeze the resulting object before returning it.

This pipeline ensures that all dependencies are created and linked through a consistent process.

## Container API

The container exposes a minimal public interface used by application code and configuration code.

The core operations are:

- **register(identifier, value)** — register a predefined dependency or instance in the container.
- **get(identifier)** — resolve a dependency identifier and return the linked object.
- **addPreprocess(handler)** — register a handler that can transform dependency identifiers before resolution.
- **addPostprocess(handler)** — register a handler that can modify created objects after instantiation.

The exact semantics of dependency identifiers are defined in **dependency-id.md**. Dependency descriptors are export-scoped: canonical descriptors are hierarchical and keyed by export name, while flat descriptors are shorthand for limited single-export cases.

## Container State Model

The container operates in three states:

- **notConfigured** — the container is being configured and dependencies may be registered.
- **operational** — the container resolves dependencies and produces linked objects.
- **failed** — the container has encountered an unrecoverable error.

If an error occurs during dependency resolution or any pipeline stage, the container transitions to the **failed** state. Once the container enters this state, all subsequent dependency requests are rejected.

This fail-fast behavior prevents partially linked systems from continuing execution.

## Object Linking and Freezing

Objects returned by the container represent linked components of the application. After an object is created and all pipeline stages are completed, the container freezes the object before returning it.

Freezing ensures that:

- linked objects cannot be modified by consumers
- shared instances remain stable
- the container remains the only authority responsible for object construction and linking
