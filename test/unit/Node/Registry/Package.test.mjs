import assert from 'node:assert/strict';
import path from 'node:path';
import {describe, it} from 'node:test';

import PackageRegistry from '../../../../src/Node/Registry/Package.mjs';

function json(value) {
    return JSON.stringify(value);
}

function mockFs(files, realpaths = {}) {
    const content = new Map(Object.entries(files).map(([file, value]) => [path.resolve(file), value]));
    const dirs = new Set();
    for (const file of content.keys()) {
        let cursor = path.dirname(file);
        while (!dirs.has(cursor)) {
            dirs.add(cursor);
            const parent = path.dirname(cursor);
            if (parent === cursor) break;
            cursor = parent;
        }
    }
    return {
        async readFile(file) {
            const key = path.resolve(file);
            if (!content.has(key)) throw new Error('ENOENT ' + key);
            return content.get(key);
        },
        async stat(target) {
            const key = path.resolve(target);
            if (dirs.has(key)) return {isDirectory: () => true};
            if (content.has(key)) return {isDirectory: () => false};
            throw new Error('ENOENT ' + key);
        },
        async realpath(target) {
            const key = path.resolve(target);
            if (realpaths[key]) return path.resolve(realpaths[key]);
            if (dirs.has(key) || content.has(key)) return key;
            throw new Error('ENOENT ' + key);
        },
    };
}

describe('TeqFw_Di_Node_Registry_Package', () => {
    it('builds immutable dependency-first records for scoped, nested, and hoisted runtime dependencies', async () => {
        const fs = mockFs({
            '/app/package.json': json({name: 'app', dependencies: {'z': '1', '@scope/a': '1', 'b': '1'}, devDependencies: {dev: '1'}}),
            '/app/node_modules/@scope/a/package.json': json({name: '@scope/a', dependencies: {nested: '1'}}),
            '/app/node_modules/b/package.json': json({name: 'b', dependencies: {shared: '1'}, peerDependencies: {peer: '1'}}),
            '/app/node_modules/z/package.json': json({name: 'z', dependencies: {}, optionalDependencies: {optional: '1'}}),
            '/app/node_modules/@scope/a/node_modules/nested/package.json': json({name: 'nested', dependencies: {}}),
            '/app/node_modules/shared/package.json': json({name: 'shared', dependencies: {}}),
        });
        const records = await new PackageRegistry({fs, path, appRoot: '/app'}).build();

        assert.deepStrictEqual(records.map((item) => item.name), ['nested', '@scope/a', 'shared', 'b', 'z', 'app']);
        assert.equal(records.at(-1).rootAbs, '/app');
        assert.equal(records.at(-1).rootReal, '/app');
        assert.deepStrictEqual(records.find((item) => item.name === '@scope/a').dependencies, ['/app/node_modules/@scope/a/node_modules/nested']);
        assert.deepStrictEqual(records.find((item) => item.name === 'app').dependencies, [
            '/app/node_modules/@scope/a',
            '/app/node_modules/b',
            '/app/node_modules/z',
        ]);
        assert.equal(records.some((item) => item.name === 'dev'), false);
        assert.equal(Object.isFrozen(records), true);
        assert.equal(Object.isFrozen(records[0]), true);
        assert.equal(Object.isFrozen(records[0].packageJson), true);
        assert.equal(Object.isFrozen(records[0].dependencies), true);
        assert.throws(() => { records.push({}); });
        assert.throws(() => { records[0].packageJson.name = 'changed'; });
        assert.throws(() => { records[0].dependencies.push('/changed'); });
    });

    it('deduplicates canonical package roots through symlinks', async () => {
        const fs = mockFs({
            '/app/package.json': json({name: 'app', dependencies: {a: '1', alias: '1'}}),
            '/app/node_modules/a/package.json': json({name: 'a', dependencies: {}}),
            '/app/node_modules/alias/package.json': json({name: 'alias', dependencies: {}}),
            '/app/node_modules/a/node_modules/app/package.json': json({name: 'app', dependencies: {}}),
        }, {
            '/app/node_modules/alias': '/store/a',
            '/app/node_modules/a': '/store/a',
        });
        const records = await new PackageRegistry({fs, path, appRoot: '/app'}).build();

        assert.deepStrictEqual(records.map((item) => item.name), ['a', 'app']);
        assert.deepStrictEqual(records[1].dependencies, ['/store/a']);
    });

    it('orders a shared dependency before each consumer and keeps one graph node', async () => {
        const records = await new PackageRegistry({
            fs: mockFs({
                '/app/package.json': json({name: 'app', dependencies: {a: '1', b: '1'}}),
                '/app/node_modules/a/package.json': json({name: 'a', dependencies: {shared: '1'}}),
                '/app/node_modules/b/package.json': json({name: 'b', dependencies: {shared: '1'}}),
                '/app/node_modules/shared/package.json': json({name: 'shared', dependencies: {}}),
            }),
            path,
            appRoot: '/app',
        }).build();

        assert.deepStrictEqual(records.map((item) => item.name), ['shared', 'a', 'b', 'app']);
        assert.equal(records.filter((item) => item.name === 'shared').length, 1);
        assert.deepStrictEqual(records.find((item) => item.name === 'a').dependencies, ['/app/node_modules/shared']);
        assert.deepStrictEqual(records.find((item) => item.name === 'b').dependencies, ['/app/node_modules/shared']);

        for (const record of records) {
            const recordIndex = records.indexOf(record);
            for (const dependencyRoot of record.dependencies) {
                const dependencyIndex = records.findIndex((item) => item.rootReal === dependencyRoot);
                assert.ok(dependencyIndex >= 0);
                assert.ok(dependencyIndex < recordIndex);
            }
        }
    });

    it('fails with the complete cycle when a package dependency has no startup order', async () => {
        const registry = new PackageRegistry({
            fs: mockFs({
                '/app/package.json': json({name: 'app', dependencies: {a: '1'}}),
                '/app/node_modules/a/package.json': json({name: 'a', dependencies: {app: '1'}}),
                '/app/node_modules/a/node_modules/app/package.json': json({name: 'app', dependencies: {a: '1'}}),
            }, {
                '/app/node_modules/a/node_modules/app': '/app',
            }),
            path,
            appRoot: '/app',
        });

        await assert.rejects(
            () => registry.build(),
            /Cyclic package dependency detected: \/app -> \/app\/node_modules\/a -> \/app\./,
        );
    });

    it('fails for missing dependencies and invalid package metadata', async () => {
        const missing = new PackageRegistry({
            fs: mockFs({'/app/package.json': json({name: 'app', dependencies: {missing: '1'}})}),
            path,
            appRoot: '/app',
        });
        const invalidJson = new PackageRegistry({
            fs: mockFs({'/app/package.json': '{'}),
            path,
            appRoot: '/app',
        });
        const invalidDependencies = new PackageRegistry({
            fs: mockFs({'/app/package.json': json({name: 'app', dependencies: []})}),
            path,
            appRoot: '/app',
        });

        await assert.rejects(() => missing.build(), /Installed dependency is not found/);
        await assert.rejects(() => invalidJson.build(), /Invalid package metadata/);
        await assert.rejects(() => invalidDependencies.build(), /Invalid dependency metadata/);
    });
});
