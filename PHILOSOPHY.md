# Philosophy of the TeqFW Platform

Version: `20260310`

Tequila Framework (TeqFW) is an architectural philosophy for building web applications in the era of LLM agents. The approach was developed by Alex Gusev based on practical experience designing modular monolith systems with a single database and a unified JavaScript codebase running across browser and server environments. TeqFW focuses specifically on web applications because the browser is the most universal runtime environment available today and JavaScript is the only language natively executed within it.

TeqFW is not intended to be a universal software architecture. Its principles are designed specifically for web application development in an environment where LLM agents participate in writing and maintaining code. In other domains such as high-performance distributed systems, embedded software, or traditional human-centric development, different architectural approaches may be more appropriate. TeqFW should therefore be understood as a contextual architecture optimized for web platforms, modular monolith systems, and code produced and evolved with the assistance of LLM agents.

Within this context the framework emphasizes structural clarity, explicit contracts, and resilience to change. These characteristics make systems easier to evolve over time and easier for both human developers and automated agents to understand.

## Architectural Context

Traditional software architectures assume that humans write and maintain most of the code. Developers rely heavily on implicit knowledge, informal conventions, and flexible interpretation of system structure. In such environments architecture often contains many implicit relationships between modules, configurations, and build tools that experienced developers learn to navigate intuitively.

When LLM agents become active participants in development this assumption changes. Language models analyze source code primarily as structured text and therefore perform best when systems expose predictable structures and explicit relationships between components. Architectures that rely on implicit coupling or hidden wiring mechanisms are significantly harder for automated agents to analyze reliably.

TeqFW therefore prioritizes structural transparency. Instead of relying on implicit module relationships, the architecture encourages explicit contracts, predictable namespaces, and runtime linking mechanisms that make the structure of the application visible. Runtime linking replaces compile-time wiring as the primary mechanism of system composition, allowing dependency relationships to remain explicit and analyzable.

## Why Traditional Architectures Break With LLM Agents

Many widely used software architectures evolved around the assumption that developers manually write and refactor code. As a result these systems often rely on implicit relationships such as static imports, reflection-based dependency discovery, or complex build pipelines. Human developers can usually navigate these structures using experience and intuition.

For automated agents these mechanisms introduce ambiguity. When dependencies are discovered implicitly or hidden behind build configurations the structure of the system becomes difficult to reconstruct from source code alone. This increases the likelihood of incorrect modifications, architectural drift, and inconsistent integration.

TeqFW addresses this problem by emphasizing explicit contracts and runtime composition. Instead of inferring system structure indirectly, the architecture makes dependencies and module relationships visible and deterministic. This shift makes the system easier to analyze, generate, and evolve programmatically.

## Core Principles of TeqFW

The following principles form the foundation of the framework. They are not independent ideas but consequences of the architectural context described above.

### 1. Use a Unified Development Language

TeqFW uses modern JavaScript (ES6+) across the entire application stack. JavaScript is the only language natively supported by browsers and through Node.js it is also widely used for server-side development. Using a single language enables the creation of isomorphic systems where code can operate in both environments. A unified language reduces cognitive overhead, simplifies onboarding, and allows both developers and automated agents to work with a consistent representation of the system.

### 2. Enable Late Binding for Flexibility

TeqFW favors late binding of dependencies. Instead of wiring modules together through static imports and compile-time coupling, dependencies are resolved dynamically through a container and namespace-based addressing. Late binding reduces tight coupling between components, simplifies the replacement of implementations, and improves testability by allowing dependencies to be substituted without modifying existing modules. This approach also keeps dependency relationships explicit and therefore easier for automated systems to analyze.

### 3. Design for Evolutionary Code Resilience

Software systems inevitably evolve as requirements change. TeqFW encourages designing code structures that can absorb change with minimal modifications to existing components. This is achieved through flexible data processing, clearly defined interaction contracts between components, and reliance on late binding rather than rigid compile-time dependencies. Systems built with these principles remain adaptable and require less refactoring as they grow.

### 4. Separate Data and Logic Functionally

TeqFW encourages a clear separation between data structures and logic handlers. Data objects contain state while handlers operate on those objects without maintaining internal state. This separation improves testability, reduces side effects, and allows handlers to be implemented as stateless components. The system becomes a network of data-processing nodes where handlers receive structured data, transform it, and produce new results. Such a structure is easier for both humans and automated agents to analyze and extend.

### 5. Use Namespaces for Structure and Isolation

Namespaces provide predictable structure and reduce conflicts across large systems. Every entity within the system such as modules, packages, database tables, APIs, and configuration elements exists within a defined namespace. This ensures that each component occupies a clear position within the project hierarchy and allows developers and automated agents to navigate the system more easily. A consistent namespace structure also simplifies integration between independent modules.

### 6. Favor Pure JavaScript with JSDoc Instead of TypeScript Compilation

TeqFW favors pure JavaScript with JSDoc annotations instead of TypeScript compilation. This approach preserves the advantages of type systems while avoiding the additional compilation layer introduced by TypeScript. JSDoc annotations allow IDEs and analysis tools to infer types and provide autocompletion while the runtime code remains identical to the source code. In environments where automated agents interact with the codebase this single-layer architecture reduces complexity because there is only one representation of the program instead of separate source and compiled versions.

### 7. Optimize Code and Documentation for LLM Agents

TeqFW assumes that LLM agents participate in the development process. To support this collaboration code and documentation are organized to maximize machine analyzability. Predictable file structures, explicit dependency declarations, standardized module conventions, and consistent documentation formats help automated systems analyze the project and generate new components that follow existing architectural rules. These conventions allow LLM agents to assist with code generation, refactoring, and documentation maintenance while preserving architectural consistency.

### 8. Provide Explicit Machine Interfaces

Traditional software systems expose interfaces for users and other systems such as user interfaces, APIs, and command-line tools. When automated agents become part of the development process it becomes useful to expose a similar interface for machines. TeqFW therefore encourages software packages to include an explicit machine interface describing how the system should be used. This interface typically takes the form of structured documentation distributed alongside the package and designed specifically for LLM agents. Such documentation describes the public contract of the package, expected integration patterns, and architectural assumptions in a concise and analyzable format. Human developers may rely on README files and source code while automated agents can rely on dedicated machine-oriented documentation.

## Conclusion

The TeqFW philosophy describes an approach to building modular monolith web applications in a development environment where LLM agents assist in producing and maintaining code. The framework emphasizes predictable architecture, explicit dependency relationships, runtime flexibility through late binding, and structural clarity that benefits both human developers and automated systems.

By combining explicit contracts, namespace-driven organization, runtime linking, and machine-oriented documentation, TeqFW explores how software architecture can evolve when automated agents become a permanent part of the development process. Rather than replacing traditional architectures, the framework demonstrates how systems may be structured differently when code generation and maintenance increasingly involve collaboration between humans and intelligent agents.
