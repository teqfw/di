import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {describe, it} from 'node:test';
import PackageRegistry from '../../../../src/Node/Registry/Package.mjs';

/** @param {string} root @param {Record<string, unknown>} data */
async function manifest(root, data) {
    await fs.mkdir(root, {recursive: true});
    await fs.writeFile(path.join(root, 'package.json'), JSON.stringify(data));
}

describe('TeqFw_Di_Node_Registry_Package', () => {
    it('discovers only immediate TeqFW packages and orders installed runtime and development edges', async (t) => {
        const base = await fs.mkdtemp(path.join(os.tmpdir(), 'di-packages-'));
        t.after(() => fs.rm(base, {recursive: true, force: true}));
        const appRoot = path.join(base, 'app');
        const modules = path.join(appRoot, 'node_modules');
        await manifest(appRoot, {name: 'host', dependencies: {a: '*', typescript: '*', missing: '*'}, devDependencies: {'@s/tool': '*', absent: '*'}});
        await manifest(path.join(modules, 'a'), {name: 'a', teqfw: {}, dependencies: {shared: '*', nested: '*'}, devDependencies: {shared: '*'}});
        await manifest(path.join(modules, '@s/tool'), {name: '@s/tool', teqfw: {fw: {cli: {plugin: 'Tool$'}}}, devDependencies: {shared: '*'}});
        await manifest(path.join(modules, 'shared'), {name: 'shared', teqfw: {}});
        await manifest(path.join(modules, 'undeclared'), {name: 'undeclared', teqfw: {}});
        await manifest(path.join(modules, 'typescript'), {name: 'typescript', devDependencies: {typescript: '*'}});
        await manifest(path.join(modules, 'a/node_modules/nested'), {name: 'nested', teqfw: {}});
        await manifest(path.join(base, 'node_modules/ancestor'), {name: 'ancestor', teqfw: {}});
        await fs.symlink(path.join(modules, 'shared'), path.join(modules, 'shared-alias'), 'dir');
        const registry = new PackageRegistry({fs, path, appRoot});
        const records = await registry.build();
        assert.deepEqual(await registry.build(), records);
        assert.deepEqual(records.map((x) => x.name), ['shared', '@s/tool', 'a', 'host', 'undeclared']);
        assert.deepEqual(records.find((x) => x.name === 'host')?.dependencies, [path.join(modules, '@s/tool'), path.join(modules, 'a')]);
        assert.deepEqual(records.find((x) => x.name === 'a')?.dependencies, [path.join(modules, 'shared')]);
        assert.equal(records.filter((x) => x.name === 'shared').length, 1);
        for (const record of records) {
            assert.ok(Object.isFrozen(record) && Object.isFrozen(record.dependencies) && Object.isFrozen(record.packageJson));
            for (const dep of record.dependencies) assert.ok(records.findIndex((x) => x.rootReal === dep) < records.indexOf(record));
        }
        assert.ok(Object.isFrozen(records));
    });

    it('ignores same-physical self edges and rejects cycles between distinct participants', async (t) => {
        const appRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'di-cycles-'));
        t.after(() => fs.rm(appRoot, {recursive: true, force: true}));
        const modules = path.join(appRoot, 'node_modules');
        await manifest(appRoot, {name: 'host', dependencies: {a: '*'}});
        await manifest(path.join(modules, 'a'), {name: 'a', teqfw: {}, dependencies: {a: '*', alias: '*'}});
        await fs.symlink(path.join(modules, 'a'), path.join(modules, 'alias'), 'dir');
        const registry = new PackageRegistry({fs, path, appRoot});
        assert.deepEqual((await registry.build()).find((x) => x.name === 'a')?.dependencies, []);
        await manifest(path.join(modules, 'a'), {name: 'a', teqfw: {}, dependencies: {b: '*'}});
        await manifest(path.join(modules, 'b'), {name: 'b', teqfw: {}, devDependencies: {a: '*'}});
        await assert.rejects(() => registry.build(), /Cyclic package dependency detected: .*a -> .*b -> .*a\./);
    });

    it('includes an unmarked host with no node_modules and rejects invalid participant metadata', async (t) => {
        const appRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'di-host-'));
        t.after(() => fs.rm(appRoot, {recursive: true, force: true}));
        await manifest(appRoot, {name: 'host'});
        const registry = new PackageRegistry({fs, path, appRoot});
        assert.deepEqual((await registry.build()).map((x) => x.name), ['host']);
        await manifest(path.join(appRoot, 'node_modules/bad'), {name: 'bad', teqfw: null});
        await assert.rejects(() => registry.build(), /Invalid TeqFW metadata/);
        await manifest(path.join(appRoot, 'node_modules/bad'), {name: 'bad', teqfw: {}, devDependencies: []});
        await assert.rejects(() => registry.build(), /Invalid dependency metadata/);
    });
});
