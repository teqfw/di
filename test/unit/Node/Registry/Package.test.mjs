import assert from 'node:assert/strict';
import path from 'node:path';
import {describe, it} from 'node:test';

import PackageRegistry from '../../../../src/Node/Registry/Package.mjs';

/**
 * @param {unknown} value
 * @returns {string}
 */
function json(value) {
    return JSON.stringify(value);
}

/**
 * Builds an in-memory fake for the `node:fs/promises` subset used by the registry.
 *
 * @param {Record<string, string>} files
 * @param {Record<string, string>} [realpaths]
 * @returns {typeof import('node:fs/promises')}
 */
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
    return /** @type {typeof import('node:fs/promises')} */ (/** @type {unknown} */ ({
        async readFile(/** @type {string} */ file) {
            const key = path.resolve(file);
            if (!content.has(key)) throw new Error('ENOENT ' + key);
            return /** @type {string} */ (content.get(key));
        },
        async stat(/** @type {string} */ target) {
            const key = path.resolve(target);
            if (dirs.has(key)) return {isDirectory: () => true};
            if (content.has(key)) return {isDirectory: () => false};
            throw new Error('ENOENT ' + key);
        },
        async realpath(/** @type {string} */ target) {
            const key = path.resolve(target);
            if (realpaths[key]) return path.resolve(realpaths[key]);
            if (dirs.has(key) || content.has(key)) return key;
            throw new Error('ENOENT ' + key);
        },
    }));
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

        const last = records.at(-1);
        assert.ok(last);
        assert.equal(last.rootAbs, '/app');
        assert.equal(last.rootReal, '/app');
        const scopeA = records.find((item) => item.name === '@scope/a');
        assert.ok(scopeA);
        assert.deepStrictEqual(scopeA.dependencies, ['/app/node_modules/@scope/a/node_modules/nested']);
        const app = records.find((item) => item.name === 'app');
        assert.ok(app);
        assert.deepStrictEqual(app.dependencies, [
            '/app/node_modules/@scope/a',
            '/app/node_modules/b',
            '/app/node_modules/z',
        ]);
        assert.equal(records.some((item) => item.name === 'dev'), false);
        for (const record of records) {
            const recordIndex = records.indexOf(record);
            for (const dependencyRoot of record.dependencies) {
                const dependencyIndex = records.findIndex((item) => item.rootReal === dependencyRoot);
                assert.ok(dependencyIndex >= 0);
                assert.ok(dependencyIndex < recordIndex);
            }
        }
        assert.equal(Object.isFrozen(records), true);
        assert.equal(Object.isFrozen(records[0]), true);
        assert.equal(Object.isFrozen(records[0].packageJson), true);
        assert.equal(Object.isFrozen(records[0].dependencies), true);
        assert.throws(() => {
            // @ts-ignore intentional mutation of frozen array
            records.push({});
        });
        assert.throws(() => {
            // @ts-ignore intentional mutation of frozen record
            records[0].packageJson.name = 'changed';
        });
        assert.throws(() => {
            // @ts-ignore intentional mutation of frozen array
            records[0].dependencies.push('/changed');
        });
    });

    it('uses ascending dependency package names as the stable tie-breaker', async () => {
        const records = await new PackageRegistry({
            fs: mockFs({
                '/app/package.json': json({name: 'app', dependencies: {zulu: '1', alpha: '1'}}),
                '/app/node_modules/alpha/package.json': json({name: 'alpha', dependencies: {}}),
                '/app/node_modules/zulu/package.json': json({name: 'zulu', dependencies: {}}),
            }),
            path,
            appRoot: '/app',
        }).build();

        assert.deepStrictEqual(records.map((item) => item.name), ['alpha', 'zulu', 'app']);
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

        assert.equal(records.filter((item) => item.name === 'shared').length, 1);
        const a = records.find((item) => item.name === 'a');
        assert.ok(a);
        assert.deepStrictEqual(a.dependencies, ['/app/node_modules/shared']);
        const b = records.find((item) => item.name === 'b');
        assert.ok(b);
        assert.deepStrictEqual(b.dependencies, ['/app/node_modules/shared']);

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
