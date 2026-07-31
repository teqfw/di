# @teqfw/di

**JavaScript applications do not need a compiler to gain late binding, explicit contracts, controlled composition, and agent-readable architecture.**

`@teqfw/di` brings these capabilities to native ESM without TypeScript, decorators, reflection, generated code, or transpilation. Business modules depend on stable logical tokens instead of concrete file paths; the host application decides which implementation to load, how to create it, how long to keep it, and which cross-cutting policies to apply.

This is the runtime-linking foundation of Tequila Framework and a practical choice for long-lived applications maintained by developers together with coding agents.

## Why use it

Static imports bind a consumer to a concrete module:

```text
consumer → file path → implementation
```

`@teqfw/di` separates the contract from the implementation:

```text
consumer → dependency token → host policy → implementation
```

That enables:

- late binding and replaceable implementations;
- isomorphic modules for Node.js and browser environments;
- explicit dependency graphs that agents can analyze;
- lifecycle control for transient and singleton values;
- preprocessing, postprocessing, wrappers, diagnostics, and test substitution at the composition boundary;
- shallow hardening of resolved values against ordinary runtime patching.

The package uses native ESM, dynamic `import()`, JSDoc, and standard JavaScript runtime features. No compilation layer is required.

<details>

<summary><strong>Quick Start</strong></summary>

```js
export default function Service({ repository }) {
  return {
    async getProfile(id) {
      return { id, name: await repository.findNameById(id) };
    },
  };
}

export const __deps__ = {
  default: {
    repository: "App_User_Repository$",
  },
};
```

```js
import path from "node:path";
import { fileURLToPath } from "node:url";
import Container from "@teqfw/di";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const container = new Container();
container.addNamespaceRoot("App_", path.join(rootDir, "src/App"), ".mjs");

const service = await container.get("App_User_Service$");
```

</details>

## Agent-ready package

The package ships with three aligned interfaces:

- runtime code in `src`;
- type information through JSDoc and `types.d.ts`;
- a version-matched Agent Skill in `skills/teqfw-di`.

The skill explains the token model, module contracts, lifecycle, configuration, testing, environment boundaries, and approved integration patterns. An agent does not need to reconstruct the package architecture from source code alone.

Mount it into the host project:

```sh
mkdir -p .agents/skills
cd .agents/skills
ln -s ../../node_modules/@teqfw/di/skills/teqfw-di
```

Project instructions and application architecture remain authoritative. The package skill supplies product knowledge; the host supplies intent and policy.

## Public API

- `@teqfw/di` — `Container`;
- `@teqfw/di/node/registry/namespace` — namespace discovery;
- `@teqfw/di/node/registry/package` — package graph discovery.

Do not import `@teqfw/di/src/**`.

## Best fit

Use `@teqfw/di` for modular, long-lived, plugin-oriented ESM applications where implementations, environments, and integrations will evolve.

Use direct imports for small applications where runtime composition adds no practical value.

## Add to a project

Install the runtime package as a project dependency:

```sh
npm install @teqfw/di
```

For agent-assisted development, provide the coding agent with the skills relevant to its task:

- `teqfw-di` — version-matched guidance for the `@teqfw/di` API, dependency tokens, module contracts, lifecycle, testing, and composition rules;
- `teqfw-platform` — the architecture, philosophy, conventions, plugin model, and integration rules of the Tequila Framework;
- `teqfw-esm-validator` — validation rules for native ESM modules and TeqFW-compatible JavaScript structure.

The package includes `teqfw-di`. The other skills are installed or mounted separately by the host project. Project instructions and cognitive context remain authoritative over all package-level guidance.

## Boundaries

The package provides interface-like contracts, composition interception, and shallow value hardening. It does not claim language-level interfaces, full general-purpose AOP, or deep immutability of arbitrary object graphs.

## Development and Ecosystem

This product is developed by AI agents under the direction of Alex Gusev, following the Agent-Driven Software Management (ADSM) methodology. It is built for the Tequila Framework (TeqFW) platform and contributes to its ecosystem.

- [Tequila Framework](https://teqfw.com/?teqfw-di)
- [Alex Gusev's Personal Website](https://wiredgeese.com/?teqfw-di)
- [Alex Gusev's Telegram Channel](https://t.me/alexgusev_lab_en)
- [Agent-Driven Software Management: A Practical Guide](http://fly.wiredgeese.com/flancer/leanpub/adsm-en/?teqfw-di)
