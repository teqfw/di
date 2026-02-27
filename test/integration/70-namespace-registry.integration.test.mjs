import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {describe, it} from 'node:test';

import TeqFw_Di_Config_NamespaceRegistry from '../../src/Config/NamespaceRegistry.mjs';
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
            teqfw: {
                namespaces: [
                    {prefix: 'App_', path: './src-short', ext: '.mjs'},
                ],
            },
        });

        await writeText(path.join(appRoot, 'src-short/Long/Service.mjs'), `
export const provider = 'root-short';
export const fileAbs = ${JSON.stringify(path.join(appRoot, 'src-short/Long/Service.mjs'))};
`);

        const depLongRoot = path.join(appRoot, 'node_modules/dep-long');
        await writeJson(path.join(depLongRoot, 'package.json'), {
            name: 'dep-long',
            version: '1.0.0',
            dependencies: {},
            teqfw: {
                namespaces: [
                    {prefix: 'App_Long_', path: './modules', ext: 'js'},
                ],
            },
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
            teqfw: {
                namespaces: [
                    {prefix: 'Side_', path: './src'},
                ],
            },
        });
        await writeText(path.join(depSideRoot, 'src/Util.mjs'), 'export const marker = "side";\n');

        const registryBuilder = new TeqFw_Di_Config_NamespaceRegistry({fs, path, appRoot});
        const registry = await registryBuilder.build();

        assert.equal(Object.isFrozen(registry), true);
        assert.ok(registry.length >= 3);
        assert.deepStrictEqual(registry.map((entry) => entry.prefix), ['App_Long_', 'Side_', 'App_']);
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
    });
});
