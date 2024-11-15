# @teqfw/di

![npms.io](https://img.shields.io/npm/dm/@teqfw/di)
![jsdelivr](https://img.shields.io/jsdelivr/npm/hm/@teqfw/di)

`@teqfw/di` is a lightweight dependency injection container for standard JavaScript, enabling late binding of code
objects with minimal manual configuration. It integrates smoothly in both browser and Node.js environments, supporting
flexibility, modularity, and easier testing for your applications.

Unlike typical object containers, `@teqfw/di` requires no manual registration of objects, instead mapping dependency IDs
directly to their source paths for greater simplicity.

**This library is specifically optimized for ES6 modules, ensuring top performance and compatibility. It does not
support CommonJS, AMD, UMD, or other module formats.**

While this library is primarily designed for JavaScript, it is also fully compatible with TypeScript. Developers can use
TypeScript to compose dependency identifiers in the same way as in JavaScript. It is important to ensure that TypeScript
transpiles the source code to ES6 modules for proper functionality. With this setup, TypeScript users can effectively
leverage the benefits of this library without any additional configuration.

## Samples

Explore `@teqfw/di` in action through the following demo applications:

- [demo-di-app](https://flancer64.github.io/demo-di-app/): A simple demonstration of dependency injection with
  `@teqfw/di`.
- [demo-wa-esm-openai](https://github.com/flancer64/demo-wa-esm-openai): Integrates OpenAI with ES6 modules.
- [pwa-wallet](https://github.com/flancer64/pwa-wallet): A progressive web application wallet showcasing the library's
  modularity.
- [spa-remote-console](https://github.com/flancer64/spa-remote-console): Demonstrates remote console functionality in a
  single-page application.
- [demo-webauthn-pubkey](https://github.com/flancer64/demo-webauthn-pubkey): Uses Web Authentication (WebAuthn) with
  public key credentials.
- [tg-bot-habr-demo-grammy](https://github.com/flancer64/tg-bot-habr-demo-grammy): A Telegram bot demo built with the
  grammY library.

These projects offer practical examples and insights into using `@teqfw/di` effectively!

## Example of Typical Usage

Using `@teqfw/di` typically involves a few simple steps: organizing the file structure, declaring dependencies,
configuring the container, and finally retrieving the main object with injected dependencies.

### Step 1: Organize File Structure

Here’s an example of how files might be organized in a project. This structure can vary depending on your project needs,
as the container can be configured to work with any layout (e.g., within `/home/user/project/`):

  ```
  ./src/
      ./Service/
          ./Customer.js
          ./Sale.js
      ./Config.js
      ./Logger.js
      ./Main.js
  ```

### Step 2: Declare Dependencies

In your code, declare dependencies by defining them as keys in the constructor. Dependency identifiers here follow a
namespace style similar to PHP Zend 1, which is used by default in this library. You can also implement a custom parser
if you prefer a different naming convention or mapping strategy.

  ```js
  export default class App_Main {
    constructor(
        {
            App_Config$: config,
            App_Logger$: logger,
            App_Service_Customer$: servCustomer,
            App_Service_Sale$: servSale,
        }
    ) { /* ... */ }
}
  ```

### Step 3: Configure the Container

Next, set up the container and configure it to use the correct namespace and path for your dependencies:

  ```js
  import Container from '@teqfw/di';

// Create a new instance of the container
const container = new Container();

// Get the resolver from the container
const resolver = container.getResolver();

// Define the namespace root for dependencies, allowing the container to resolve identifiers like 'App_*'
resolver.addNamespaceRoot('App_', '/home/user/project/src'); 
  ```

### Step 4: Retrieve the Main Object with Dependencies

Finally, retrieve your main application instance. The container automatically injects all declared dependencies:

  ```js
  // Retrieve the main application instance as a singleton asynchronously
const app = await container.get('App_Main$');
  ```

## Key Benefits

`@teqfw/di` offers the core functionality of any object container — creating objects and injecting dependencies — with
extensive flexibility and configurability. This allows the library to adapt seamlessly to a wide range of project needs.
Here’s what makes it stand out:

- **Automatic Dependency Resolution**: The library simplifies managing complex objects and their dependencies by
  automatically resolving and injecting them based on container configuration. This basic functionality works out of the
  box but can be fully customized if needed.

- **Flexible Dependency ID Configuration**: With customizable parsers and chunks, you can define unique ID schemes for
  dependencies, making it easy to adapt the library to specific naming conventions or custom mapping rules.

- **Mapping IDs to Source Modules via Resolvers**: Thanks to resolvers, `@teqfw/di` lets you map dependency IDs to their
  source locations effortlessly. This makes the library adaptable to any project structure or file layout.

- **Preprocessing for Enhanced Control**: Built-in preprocessing allows modifying dependencies at the time of creation,
  enabling local overrides or adjustments in functionality. This is especially useful for larger projects, where
  different teams may tailor dependencies to their specific requirements. The default preprocessing can also be replaced
  to suit more precise needs.

- **Interfaces and Dependencies Without TypeScript**: `@teqfw/di` allows you to define interfaces using standard
  JavaScript files with JSDoc annotations. The container supports configuring dependencies to replace interfaces with
  project-specific implementations, offering flexibility without requiring TypeScript.

- **Postprocessing for Object Customization**: Use postprocessing to add wrappers or extend created objects. This can be
  valuable for adding factories, logging, or other behavior, tailored to each project’s requirements.

These features make `@teqfw/di` a powerful, adaptable DI container that not only provides ready-to-use solutions but can
be easily customized to meet unique project demands.

## Installation

### For Node.js

To install `@teqfw/di` in a Node.js environment, use the following command:

  ```shell
  $ npm install @teqfw/di
  ```

Then, import and initialize the container:

  ```js
  import Container from '@teqfw/di';

/** @type {TeqFw_Di_Container} */
const container = new Container();
  ```

### For the Browser (ESM Module)

To use `@teqfw/di` in a browser environment with ES modules, include it as follows (~5KB):

  ```html

<script type="module">
    import Container from 'https://cdn.jsdelivr.net/npm/@teqfw/di@latest/+esm';

    /** @type {TeqFw_Di_Container} */
    const container = new Container();
</script>
  ```

### For the Browser (UMD Module)

Alternatively, you can use the UMD version in the browser (~5KB):

  ```html

<script src="https://cdn.jsdelivr.net/npm/@teqfw/di@latest/dist/umd.js"></script>
<script>
    /** @type {TeqFw_Di_Container} */
    const container = new window.TeqFw_Di_Container();
</script>
  ```

---

## Using the Container

### In Node.js

1. **Configure Dependency Mapping**: Configure the resolver to detect the platform environment. Then, set up namespace
   roots to map dependency IDs to their source paths.

    ```js
    import { platform } from 'node:process';

    const resolver = container.getResolver();
    resolver.setWindowsEnv(platform === 'win32'); // Adjusts for Windows environment if needed
    resolver.addNamespaceRoot('App_', '/path/to/src');
    ```

2. **Retrieve Singleton Instances**: Retrieve the main application instance as a singleton asynchronously:

    ```js
    const app = await container.get('App_Main$');
    ```

### In the Browser

1. **Configure Dependency Mapping**: Set up namespace roots to map dependency IDs to their source paths, using URLs as
   needed.

    ```js
    const resolver = container.getResolver();
    resolver.addNamespaceRoot('App_', 'https://cdn.jsdelivr.net/npm/@flancer64/demo-di-app@0.2/src'); 
    ```

2. **Retrieve Singleton Instances**: Retrieve the main application instance as a singleton asynchronously:

    ```js
    const app = await container.get('App_Main$');
    ```

With these steps, the container is configured to automatically resolve and inject dependencies based on your setup,
whether in Node.js or in a browser environment.

## Dependency ID Types

`@teqfw/di` supports various dependency ID formats to match different import styles and object requirements. Here’s a
quick reference:

| Dependency ID               | Import Style                                           | Description                                                                                           |
|-----------------------------|--------------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| `App_Service`               | `import * as Service from './App/Service.js';`         | Imports the entire module as an ES module.                                                            |
| `App_Service.default`       | `import {default} from './App/Service.js';`            | Imports the default export as-is.                                                                     |
| `App_Service.name`          | `import {name} from './App/Service.js';`               | Imports a named export as-is.                                                                         |
| `App_Service$`              | `import {default as Factory} from './App/Service.js';` | Uses default export as a singleton for the container.                                                 |
| `App_Service$$`             | `import {default as Factory} from './App/Service.js';` | Creates a new instance from the default export for each dependency.                                   |
| `App_Service.name$`         | `import {name} from './App/Service.js';`               | Uses a named export as a singleton.                                                                   |
| `App_Service.name$$`        | `import {name} from './App/Service.js';`               | Creates a new instance from a named export for each dependency.                                       |
| `App_Service.name$$(proxy)` | `import {name} from './App/Service.js';`               | Applies a custom wrapper to the created object in postprocessing, using a handler function `proxy()`. |

### Example Usage

Here’s an example showing a class with multiple dependencies, each using different dependency IDs:

```js
export default class App_Main {
    constructor(
        {
            App_Service: EsModule,
            'App_Service.default': defaultExportAsIs,
            'App_Service.name': namedExportAsIs,
            App_Service$: defaultExportAsSingleton,
            App_Service$$: defaultExportAsInstance,
            'App_Service.name$': namedExportAsSingleton,
            'App_Service.name$$': namedExportAsInstance,
            'App_Service.name(factory)': factoryToCreateInstancesFromNamedExport,
        }
    ) {
        const {default: SrvDef, name: SrvName} = EsModule; // Deconstruct the module and access the exports 
    }
}
```

## Summary

`@teqfw/di` is a versatile and lightweight dependency injection container tailored for modern JavaScript applications.
With its flexible dependency mapping, customizable ID configurations, and support for dynamic object creation,
`@teqfw/di` empowers developers to build modular, testable, and scalable codebases.

Whether you’re working in Node.js or a browser environment, `@teqfw/di` provides a solid foundation with built-in
functionality that you can further adapt to fit your project’s unique requirements. You are encouraged to explore and
extend this library as needed to create your ideal development environment.

For any questions, feedback, or collaboration opportunities, please feel free to reach out through the following
channels:

- **Website**: [wiredgeese.com](https://wiredgeese.com)
- **LinkedIn**: [LinkedIn Profile](https://www.linkedin.com/in/aleksandrs-gusevs-011ba928/)

You can also leave suggestions, feedback, and feature requests directly on GitHub by opening an issue in the repository.

Happy coding!