# Philosophy of the TeqFW Platform

**The philosophy of Tequila Framework (TeqFW)** is my personal approach to organizing web application development. I,
Alex Gusev, have shaped this approach based on my own experience, which focuses on **modular monoliths** with a single
database. This document reflects that specific context and does not aim to be universal.

Some of the principles presented may be applicable more broadly, while others may be irrelevant (or even
counterproductive) outside monolithic architectures. It is important to keep this limitation in mind when interpreting
the material.

The document is intended to provide cognitive context for both human and artificial intelligences. It addresses both
specific aspects of web development and more general software architecture issues, emphasizing the reduction of
excessive complexity, improved structuring, and adaptability to changes.

**Tequila Framework (TeqFW)** is not a finished product but an evolving experimental platform. It serves as a testbed
for the principles outlined here and is actively used in development.

## Core Principles of TeqFW

1. **Use a Unified Development Language:** JavaScript (ES6+) is used on both the client and server sides, ensuring code
   integrity, reducing duplication, and lowering cognitive load.

2. **Enable Late Binding for Flexibility:** Dynamic dependency management through an object container and ES6 module
   namespaces. This reduces tight coupling between modules, simplifies system expansion, and makes the code more
   adaptable.

3. **Design for Evolutionary Code Resilience:** Code is designed with inevitable changes in mind to minimize adaptation
   costs and facilitate expansion without modifying existing components.

4. **Separate Data and Logic Functionally:** Isolation of data structures (DTO) and logic handlers. This approach makes
   code easier to test, maintain, and reuse.

5. **Use Namespaces for Structure and Isolation:** Each type of entity—npm packages, ES6 modules, database tables, CLI
   commands, or configurations—has its own namespace. This ensures clear project structure, reduces conflicts, and
   simplifies code navigation.

6. **Favor Pure JavaScript Without Compilation:** Using modern JavaScript (ES6+) without TypeScript or version
   downgrading. The code remains transparent and accessible, simplifying maintenance, library integration, and speeding
   up development.

7. **Optimize Code and Docs for LLMs:** Code and documentation are organized to be easily analyzed and supplemented by
   language models. Clear structure, standardized templates, and predictable conventions simplify automation and code
   generation.

## Principles in Detail

### Use a Unified Development Language

Using modern JavaScript (ES6+) at all application levels eliminates the need to switch between different languages and
simplifies knowledge sharing among developers. This is especially important in small teams and projects with limited
resources, where minimizing cognitive load accelerates work.

Browsers support only JavaScript (among high-level languages), and thanks to Node.js, it has become widespread in server
development. This enables writing **isomorphic code** that can be reused on both client and server sides, reducing logic
duplication.

A unified language simplifies code maintenance and accelerates the onboarding of new developers into the project.

### Enable Late Binding for Flexibility

Late binding ensures architectural flexibility by allowing dynamic dependency management without tight coupling between
modules. Instead of direct imports, ES6 module namespaces and an object container are used to handle instantiation and
component replacement at runtime.

This approach reduces the risk of application "breakage" due to changes, simplifies system expansion, and makes the code
more adaptable. Components can be replaced without deep refactoring, and the dependency mechanism remains transparent
and predictable.

Late binding also improves testability: modules can be replaced with stubs or alternative implementations, making it
easier to isolate tests. In team development, this simplifies understanding of complex dependencies and makes system
maintenance more manageable.

### Design for Evolutionary Code Resilience

Code is designed to adapt to inevitable changes in requirements, APIs, and data with minimal overhead. This is achieved
through approaches that allow **expanding functionality without significant modifications to existing code**.

Key techniques:

- **Flexible input data processing.** Using function argument destructuring and the "ignore unknown attributes"
  principle in data structures allows adding new parameters and properties without modifying existing handlers.
- **Clear interaction contracts.** Separating interfaces from implementations reduces the impact of changes while
  maintaining system predictability.
- **Late binding.** Components depend on abstractions rather than specific implementations, enabling code adaptation
  without directly modifying dependencies (see **Enable Late Binding for Flexibility** principle).

These methods make the code less fragile and allow the system to evolve while reducing complexity and refactoring
volume.

### Separate Data and Logic Functionally

Code is divided into **data structures (DTO) and logic handlers**, eliminating state within handlers and making them
independent of data. DTOs contain all necessary information and are passed between handlers that perform operations on
them.

This approach offers several key advantages:

- **Handlers can be singletons.** Since they do not store state, they are execution-context-independent and can be
  shared across the entire application.
- **The program consists of data processing nodes.** The code is structured as a set of functions that receive data,
  process it, and pass it on.
- **Changeability through pure logic.** Logic remains separate from data structures, allowing modifications without
  affecting handlers and vice versa.
- **Minimized side effects.** Handlers do not depend on global state, making the system more predictable.

### Use Namespaces for Structure and Isolation

Namespaces ensure a clear project structure and prevent conflicts by allowing each entity to reserve its name and build
its own hierarchy. This principle applies at all levels:

- **Packages and modules.** npm packages and ES6 modules are organized into predictable namespaces, avoiding dependency
  conflicts.
- **Files and classes.** File and class names reflect their purpose and relationships with other components, simplifying
  project navigation and structure.
- **Database tables.** Table names are structured to avoid collisions and logically group data.
- **Endpoints and APIs.** Namespaces are used in routing and APIs, ensuring consistent addressing.
- **Configurations and CLI commands.** Settings and commands are organized hierarchically to prevent duplication.

Code is designed to operate in an environment with other code. Each unit within its namespace reserves a name and builds
a downward hierarchy, creating a predictable interaction structure.

### Favor Pure JavaScript Without Compilation

Tequila Framework uses modern JavaScript (ES6+) without version downgrading or strict TypeScript typing. The code
remains in its original form, making it transparent, accessible, and easy to maintain.

Key characteristics:

- **No compilation.** Developers work with pure JavaScript without intermediate transformations, speeding up debugging
  and simplifying maintenance.
- **JSDoc instead of TypeScript.** JSDoc annotations allow IDEs to understand data structures and provide
  autocompletion, maintaining flexibility without strict typing.
- **Maximum compatibility.** The code easily integrates with any libraries and tools, as it does not require adaptation
  to strict type contracts.
- **Fast development.** Changes are immediately reflected in the code without requiring a rebuild, increasing
  development speed.

### Optimize Code and Docs for LLMs

Architecture, code, and documentation are designed for easy analysis and use by language models (LLM). This improves the
efficiency of **automatic code completion, generation of template solutions, and integration with AI tools**.

For this, the following practices are applied:

- **Predictable project structure.** Clear file organization, logical naming, and standardized conventions.
- **Unified code templates.** Repetitive structures and a predictable format help models understand and supplement the
  code.
- **Optimized abstraction depth.** Code is organized to maintain modularity while avoiding excessive nesting.
- **Automated annotations.** JSDoc and standardized comments ensure precise code generation and documentation.

This approach allows LLM agents to:

- Quickly analyze code and suggest corrections.
- Automatically supplement documentation and comment code.
- Generate new modules according to the project's architectural standards.
- Simplify CI/CD integration by checking code compliance with style and conventions.

LLMs become part of the development process, helping not only with writing code but also keeping it up to date, reducing
developers' routine workload.

## Conclusion

The principles outlined in this document form an approach to **modular monolith** development, focused on
predictability, structure, and adaptability. They enable building architectures where code remains flexible,
transparent, and easily extensible.

These ideas do not require complex theoretical justifications or significant time investments for validation. They aim
to simplify integration, reduce unnecessary complexity, and enhance the potential for automation. **Standardized
structures, predictable namespaces, and development without transpilation** create an environment where the code is
understandable both for developers and language models (LLM).

The **Tequila Framework (TeqFW)** platform demonstrates these principles in action. While still evolving, it already
supports real-world development. This approach may serve not only as a foundation for proprietary tools, but also as
inspiration for rethinking conventional software architecture, prioritizing clarity, modularity, and adaptability over
unnecessary complexity.
