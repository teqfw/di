import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {describe, it} from 'node:test';

import TeqFw_Di_Node_Registry_Namespace from '../../src/Node/Registry/Namespace.mjs';
import TeqFw_Di_Node_Registry_Package from '../../src/Node/Registry/Package.mjs';
import TeqFw_Di_Container from '../../src/Container.mjs';

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
    it('builds registry and drives real container namespace resolution', async (t) => {
        const appRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'teqfw-di-registry-'));
        t.after(async () => {
            await fs.rm(appRoot, {recursive: true, force: true});
        });

        await writeJson(path.join(appRoot, 'package.json'), {
            name: 'app-root',
            version: '1.0.0',
            dependencies: {'dep-long': '1.0.0', 'dep-side': '1.0.0'},
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
import {fileURLToPath} from 'node:url';
export const provider = 'dep-long';
export const fileAbs = fileURLToPath(import.meta.url);
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
        const legacyNamespaceRegistry = await import("@teqfw/di/src/Config/NamespaceRegistry.mjs");
        assert.equal(legacyNamespaceRegistry.default, publicNamespaceRegistry.default);
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

        const container = new TeqFw_Di_Container();
        const applied = [];
        const addNamespaceRoot = container.addNamespaceRoot;
        container.addNamespaceRoot = function (prefix, target, defaultExt) {
            applied.push({prefix, dirAbs: target, ext: defaultExt});
            return addNamespaceRoot.call(this, prefix, target, defaultExt);
        };

        for (const entry of registry) {
            container.addNamespaceRoot(entry.prefix, entry.dirAbs, entry.ext);
        }

        assert.deepStrictEqual(applied, registry);

        const resolved = await container.get('App_Long_Service');
        assert.equal(resolved.provider, 'dep-long');
        assert.equal(path.resolve(resolved.fileAbs), path.join(depLongRoot, 'modules/Service.js'));
        assert.equal((await container.get('Root_Service')).provider, 'root-extra');
    });
});
