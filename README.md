# @teqfw/di

> **Human-governed. Agent-built. Agent-ready.**

`@teqfw/di` links native ESM modules through explicit dependency tokens, letting host applications choose implementations, lifecycles, and composition policies at runtime. It is a foundational package of the Tequila Framework (TeqFW): created and evolved by coding agents under the architectural direction and final responsibility of Alex Gusev, and shipped with a version-matched Agent Skill so other agents can understand, integrate, and use it correctly.

## Why use it

> **JavaScript applications do not need a compiler to gain late binding, explicit contracts, controlled composition, and agent-readable architecture.**

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

---

<details>

<summary><strong>Quick Start: Node.js host</strong></summary>

This Node.js example maps `App_` module tokens to modules below `src/App`. A namespace root is host-owned location mapping, not a dependency contract.

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

---

## Agent-ready package

The package ships with three aligned interfaces:

- runtime code in `src`;
- type information through JSDoc and `types.d.ts`;
- a version-matched Agent Skill in `skills/teqfw-di`.

The skill explains the token model, module contracts, lifecycle, configuration, testing, environment boundaries, and approved integration patterns. An agent does not need to reconstruct the package architecture from source code alone.

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

## Agent-Driven Development

TeqFW is built through the same development model that it is designed to enable: one human defines the intent, architecture, constraints, and acceptance criteria; coding agents implement and maintain the products; other agents use those products in different combinations to create applications.

`@teqfw/di` is a foundational package of TeqFW. The package includes a version-matched Agent Skill in `skills/teqfw-di`. The README provides a human-facing product overview; the skill provides agents with the package concepts, contracts, integration rules, examples, and boundaries.

Mount the skill into a host project:

```sh
mkdir -p .agents/skills
ln -s ../../node_modules/@teqfw/di/skills/teqfw-di \
  .agents/skills/teqfw-di
```

Each TeqFW package is both a practical software component and a working demonstration of human-governed, agent-driven development. This work follows the Agent-Driven Software Management (ADSM) approach: human intent, architectural authority, acceptance, and responsibility remain authoritative; agents act as implementation and reasoning partners.

- [Tequila Framework](https://teqfw.com/?from=github-teqfw-di)
- [Agent-Driven Software Management: A Practical Guide](http://fly.wiredgeese.com/flancer/leanpub/adsm-en/?from=github-teqfw-di)
- [Alex Gusev](https://github.com/flancer64)
