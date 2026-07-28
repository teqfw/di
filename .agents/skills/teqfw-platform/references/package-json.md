# package.json Rules

## Source of truth

Read `ctx/docs/code/platform/nodejs/package-json.md` before changing the manifest. It is authoritative for durable manifest structure; release-specific values remain package artifacts.

## Current package contract

`@teqfw/di` is a library, not a standalone executable. Use `type: module`, `types: types.d.ts`, and `engines.node: >=20`. Publish through `exports`; do not add legacy `main` or non-standard `module` fallback fields.

Keep the published surface limited to the root export, the Node.js registry subpaths, and the deprecated `./src/Config/NamespaceRegistry.mjs` compatibility entry point. Keep UMD only as a browser compatibility artifact and never present it as the normative runtime model.

Maintain the scripts:

- `rollup` — `rollup -c`;
- `test` — runs `test:unit` then `test:integration`;
- `test:unit` — discovers `test/unit/**/*.test.mjs` for `node --test`;
- `test:integration` — discovers `test/integration/**/*.test.mjs` for `node --test`.

Do not add a `start` script: this package has no standalone executable boundary.

Maintain `teqfw.namespaces` metadata for the `TeqFw_Di_` prefix, `./src` path, and `.mjs` extension. Keep runtime dependencies empty unless a separately authorized package change requires one.
