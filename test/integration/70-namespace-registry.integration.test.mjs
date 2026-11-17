import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

import TeqFw_Di_Container from '@teqfw/di';
import TeqFw_Di_Node_Registry_Namespace from '@teqfw/di/node/registry/namespace';
import TeqFw_Di_Node_Registry_Package from '@teqfw/di/node/registry/package';

/**
 * @param {string} fileAbs
 * @param {Record<string, unknown>} data
 * @returns {Promise<void>}
 */
async function writeJson(fileAbs, data) {
    await fs.mkdir(path.dirname(fileAbs), {recursive: true});
    await fs.writeFile(fileAbs, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

/**
 * @param {string} fileAbs
 * @param {string} content
 * @returns {Promise<void>}
 */
async function writeText(fileAbs, content) {
    await fs.mkdir(path.dirname(fileAbs), {recursive: true});
    await fs.writeFile(fileAbs, content, 'utf8');
}

describe('Namespace registry integration', () => {
    it('selects the root-visible copy while retaining the installed dependency graph', async (t) => {
        const appRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'teqfw-di-copies-'));
        t.after(() => fs.rm(appRoot, {recursive: true, force: true}));
        const rootA = path.join(appRoot, 'node_modules/a');
        const tool = path.join(appRoot, 'node_modules/tool');
        const nestedA = path.join(tool, 'node_modules/a');
        const nestedOnly = path.join(tool, 'node_modules/only');
        /** @param {string} prefix */
        const mapping = (prefix) => ({fw: {di: {namespaces: [{prefix, path: './src'}, {prefix, path: './src', ext: 'mjs'}]}}});
        await writeJson(path.join(appRoot, 'package.json'), {name: 'host', dependencies: {a: '*'}, devDependencies: {tool: '*'}});
        await writeJson(path.join(rootA, 'package.json'), {name: 'a', teqfw: mapping('A_')});
        await writeText(path.join(rootA, 'src/Service.mjs'), 'export const provider = "root";\n');
        await writeJson(path.join(tool, 'package.json'), {name: 'tool', dependencies: {a: '*', only: '*'}});
        await writeJson(path.join(nestedA, 'package.json'), {name: 'a', teqfw: mapping('A_')});
        await writeText(path.join(nestedA, 'src/Service.mjs'), 'export const provider = "nested";\n');
        await writeJson(path.join(nestedOnly, 'package.json'), {name: 'only', teqfw: mapping('Only_')});
        await writeText(path.join(nestedOnly, 'src/Service.mjs'), 'export const provider = "only";\n');

        const graph = await new TeqFw_Di_Node_Registry_Package({fs, path, appRoot}).build();
        assert.equal(graph.filter((record) => record.name === 'a').length, 2);
        assert.ok(graph.some((record) => record.rootAbs === nestedOnly));
        const mappings = await new TeqFw_Di_Node_Registry_Namespace({fs, path, appRoot}).build();
        assert.equal(mappings.filter(({prefix}) => prefix === 'A_').length, 1);
        assert.equal(mappings.find(({prefix}) => prefix === 'A_')?.dirAbs, path.join(rootA, 'src'));
        const container = new TeqFw_Di_Container({namespaces: mappings.map(({prefix, dirAbs, ext}) => ({prefix, target: dirAbs, defaultExt: ext}))});
        assert.equal((await container.get('A_Service')).provider, 'root');
        assert.equal((await container.get('Only_Service')).provider, 'only');

        // The same physical root is reachable from two dependency edges.
        await fs.rm(nestedA, {recursive: true});
        const shared = await new TeqFw_Di_Node_Registry_Package({fs, path, appRoot}).build();
        assert.equal(shared.filter((record) => record.name === 'a').length, 1);
        assert.equal((await new TeqFw_Di_Node_Registry_Namespace({fs, path, appRoot}).build()).filter(({prefix}) => prefix === 'A_').length, 1);
    });

    it('rejects multiple nested-only copies without a root-visible claimant', async (t) => {
        const appRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'teqfw-di-ambiguous-'));
        t.after(() => fs.rm(appRoot, {recursive: true, force: true}));
        await writeJson(path.join(appRoot, 'package.json'), {name: 'host', devDependencies: {one: '*', two: '*'}});
        for (const tool of ['one', 'two']) {
            const toolRoot = path.join(appRoot, 'node_modules', tool);
            const nested = path.join(toolRoot, 'node_modules/a');
            await writeJson(path.join(toolRoot, 'package.json'), {name: tool, dependencies: {a: '*'}});
            await writeJson(path.join(nested, 'package.json'), {name: 'a', teqfw: {fw: {di: {namespaces: [{prefix: 'A_', path: './src'}]}}}});
            await writeText(path.join(nested, 'src/Service.mjs'), 'export const value = 1;\n');
        }
        await assert.rejects(() => new TeqFw_Di_Node_Registry_Namespace({fs, path, appRoot}).build(), (error) => {
            assert.ok(error instanceof Error);
            assert.match(error.message, /Duplicate DI namespace prefix 'A_'/);
            assert.ok(error.message.includes(path.join(appRoot, 'node_modules/one/node_modules/a')));
            assert.ok(error.message.includes(path.join(appRoot, 'node_modules/two/node_modules/a')));
            return true;
        });
    });

    it('builds registry and drives real container namespace resolution', async (t) => {
        const appRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'teqfw-di-registry-'));
        t.after(async () => {
            await fs.rm(appRoot, {recursive: true, force: true});
        });

        await writeJson(path.join(appRoot, 'package.json'), {
            name: 'app-root',
            version: '1.0.0',
            dependencies: {'dep-long': '1.0.0', 'missing-runtime': '1.0.0'},
            devDependencies: {'dep-side': '1.0.0', 'missing-dev': '1.0.0'},
            teqfw: {fw: {di: {namespaces: [{prefix: 'App_', path: './src-short', ext: '.mjs'}, {prefix: 'Root_', path: './src-root'}]}}},
        });

        await writeText(path.join(appRoot, 'src-short/Long/Service.mjs'), `
export const provider = 'root-short';
export const fileAbs = ${JSON.stringify(path.join(appRoot, 'src-short/Long/Service.mjs'))};
`);
        await writeText(path.join(appRoot, 'src-root/Service.mjs'), 'export const provider = "root-extra";\n');

        const depLongRoot = path.join(appRoot, 'node_modules/dep-long');
        await writeJson(path.join(depLongRoot, 'package.json'), {
            name: 'dep-long',
            version: '1.0.0',
            dependencies: {},
            teqfw: {fw: {di: {namespaces: [{prefix: 'App_Long_', path: './modules', ext: 'js'}]}}},
        });
        await writeText(path.join(depLongRoot, 'modules/Service.js'), `
export const provider = 'dep-long';
export const moduleUrl = import.meta.url;
`);

        const depSideRoot = path.join(appRoot, 'node_modules/dep-side');
        await writeJson(path.join(depSideRoot, 'package.json'), {
            name: 'dep-side',
            version: '1.0.0',
            dependencies: {},
            teqfw: {fw: {di: {namespaces: [{prefix: 'Side_', path: './src'}]}}},
        });
        await writeText(path.join(depSideRoot, 'src/Util.mjs'), 'export const marker = "side";\n');

        const publicContainer = await import("@teqfw/di");
        assert.equal(publicContainer.default, TeqFw_Di_Container);
        const publicPackageRegistry = await import("@teqfw/di/node/registry/package");
        assert.equal(publicPackageRegistry.default, TeqFw_Di_Node_Registry_Package);
        const graph = await new TeqFw_Di_Node_Registry_Package({fs, path, appRoot}).build();
        assert.deepStrictEqual(graph.map((item) => item.name), ['dep-long', 'dep-side', 'app-root']);

        const publicNamespaceRegistry = await import("@teqfw/di/node/registry/namespace");
        assert.equal(publicNamespaceRegistry.default, TeqFw_Di_Node_Registry_Namespace);
        // These subpaths must NOT be exported by the package; the dynamic specifiers
        // are kept non-literal because only the runtime resolution is being asserted.
        const namespaceSubpath = "@teqfw/di/src/Node/Registry/Namespace.mjs";
        const packageSubpath = "@teqfw/di/src/Node/Registry/Package.mjs";
        const containerSubpath = "@teqfw/di/src/Container.mjs";
        await assert.rejects(
            () => import(namespaceSubpath),
            /Package subpath '.\/src\/Node\/Registry\/Namespace\.mjs' is not defined/,
        );
        await assert.rejects(
            () => import(packageSubpath),
            /Package subpath '.\/src\/Node\/Registry\/Package\.mjs' is not defined/,
        );
        await assert.rejects(
            () => import(containerSubpath),
            /Package subpath '.\/src\/Container\.mjs' is not defined/,
        );
        const registryBuilder = new TeqFw_Di_Node_Registry_Namespace({fs, path, appRoot});
        const registry = await registryBuilder.build();

        assert.equal(Object.isFrozen(registry), true);
        assert.ok(registry.length >= 4);
        assert.deepStrictEqual(registry.map((entry) => entry.prefix), ['App_Long_', 'Root_', 'Side_', 'App_']);
        assert.deepStrictEqual(registry.find((entry) => entry.prefix === 'App_Long_'), {
            prefix: 'App_Long_',
            dirAbs: path.join(depLongRoot, 'modules'),
            ext: '.js',
        });

        const config = {namespaces: registry.map(({prefix, dirAbs, ext}) => ({prefix, target: dirAbs, defaultExt: ext}))};
        const container = new TeqFw_Di_Container(config);

        const resolved = await container.get('App_Long_Service');
        assert.equal(resolved.provider, 'dep-long');
        assert.equal(fileURLToPath(resolved.moduleUrl), path.join(depLongRoot, 'modules/Service.js'));
        const otherContainer = new TeqFw_Di_Container(config);
        assert.equal((await otherContainer.get('Root_Service')).provider, 'root-extra');
    });
});
