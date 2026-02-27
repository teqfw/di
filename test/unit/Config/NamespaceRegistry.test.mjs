import assert from 'node:assert/strict';
import path from 'node:path';
import {describe, it} from 'node:test';

import TeqFw_Di_Config_NamespaceRegistry from '../../../src/Config/NamespaceRegistry.mjs';

/**
 * @param {Record<string, unknown>} value
 * @returns {string}
 */
function toJson(value) {
    return JSON.stringify(value, null, 2);
}

/**
 * @param {{files: Record<string, string>, extraDirs?: string[]}} input
 * @returns {{readFile(path: string): Promise<string>, stat(path: string): Promise<{isDirectory(): boolean}>, realpath(path: string): Promise<string>}}
 */
function createMockFs(input) {
    const files = new Map(Object.entries(input.files).map(([name, content]) => [path.resolve(name), content]));
    const dirs = new Set((input.extraDirs ?? []).map((one) => path.resolve(one)));

    for (const name of files.keys()) {
        let cursor = path.dirname(name);
        while (true) {
            dirs.add(cursor);
            const parent = path.dirname(cursor);
            if (parent === cursor) break;
            cursor = parent;
        }
    }

    /**
     * @param {string} absPath
     * @returns {Error}
     */
    const createNotFound = function (absPath) {
        const error = new Error(`ENOENT: ${absPath}`);
        // @ts-ignore
        error.code = 'ENOENT';
        return error;
    };

    return {
        async readFile(fileAbs) {
            const key = path.resolve(fileAbs);
            if (!files.has(key)) throw createNotFound(key);
            return files.get(key);
        },
        async stat(absPath) {
            const key = path.resolve(absPath);
            if (dirs.has(key)) return {isDirectory: () => true};
            if (files.has(key)) return {isDirectory: () => false};
            throw createNotFound(key);
        },
        async realpath(absPath) {
            const key = path.resolve(absPath);
            if (dirs.has(key) || files.has(key)) return key;
            throw createNotFound(key);
        },
    };
}

describe('TeqFw_Di_Config_NamespaceRegistry', () => {
    it('builds registry for root and dependencies, normalizes ext, and sorts by descending prefix length', async () => {
        const appRoot = '/app';
        const fs = createMockFs({
            files: {
                '/app/package.json': toJson({
                    dependencies: {'dep-a': '1.0.0', 'dep-b': '1.0.0'},
                    teqfw: {
                        namespaces: [
                            {prefix: 'App_', path: './root', ext: 'js'},
                            {prefix: 'App_Long_', path: './root/long'},
                        ],
                    },
                }),
                '/app/node_modules/dep-a/package.json': toJson({
                    dependencies: {'dep-c': '1.0.0'},
                    teqfw: {namespaces: [{prefix: 'DepA_', path: './src', ext: '.mjs'}]},
                }),
                '/app/node_modules/dep-b/package.json': toJson({
                    dependencies: {},
                    teqfw: {namespaces: [{prefix: 'Dep_', path: './lib'}]},
                }),
                '/app/node_modules/dep-c/package.json': toJson({
                    dependencies: {},
                    teqfw: {namespaces: [{prefix: 'DepC_', path: './pkg', ext: 'js'}]},
                }),
            },
            extraDirs: [
                '/app/root',
                '/app/root/long',
                '/app/node_modules/dep-a/src',
                '/app/node_modules/dep-b/lib',
                '/app/node_modules/dep-c/pkg',
            ],
        });
        const registry = new TeqFw_Di_Config_NamespaceRegistry({fs, path, appRoot});

        const result = await registry.build();

        assert.deepStrictEqual(result, [
            {prefix: 'App_Long_', dirAbs: '/app/root/long', ext: '.mjs'},
            {prefix: 'DepA_', dirAbs: '/app/node_modules/dep-a/src', ext: '.mjs'},
            {prefix: 'DepC_', dirAbs: '/app/node_modules/dep-c/pkg', ext: '.js'},
            {prefix: 'App_', dirAbs: '/app/root', ext: '.js'},
            {prefix: 'Dep_', dirAbs: '/app/node_modules/dep-b/lib', ext: '.mjs'},
        ]);
    });

    it('fails for duplicate canonical prefix', async () => {
        const appRoot = '/app';
        const fs = createMockFs({
            files: {
                '/app/package.json': toJson({
                    dependencies: {'dep-a': '1.0.0'},
                    teqfw: {namespaces: [{prefix: 'App_', path: './src'}]},
                }),
                '/app/node_modules/dep-a/package.json': toJson({
                    dependencies: {},
                    teqfw: {namespaces: [{prefix: 'App_', path: './lib'}]},
                }),
            },
            extraDirs: ['/app/src', '/app/node_modules/dep-a/lib'],
        });
        const registry = new TeqFw_Di_Config_NamespaceRegistry({fs, path, appRoot});

        await assert.rejects(() => registry.build(), /Duplicate namespace prefix/);
    });

    it('fails for invalid prefix format without trailing underscore', async () => {
        const appRoot = '/app';
        const fs = createMockFs({
            files: {
                '/app/package.json': toJson({
                    dependencies: {},
                    teqfw: {namespaces: [{prefix: 'App', path: './src'}]},
                }),
            },
            extraDirs: ['/app/src'],
        });
        const registry = new TeqFw_Di_Config_NamespaceRegistry({fs, path, appRoot});

        await assert.rejects(() => registry.build(), /Namespace prefix is invalid/);
    });

    it('fails when namespace path resolves outside package root', async () => {
        const appRoot = '/app';
        const fs = createMockFs({
            files: {
                '/app/package.json': toJson({
                    dependencies: {},
                    teqfw: {namespaces: [{prefix: 'App_', path: '../outside'}]},
                }),
            },
            extraDirs: ['/outside'],
        });
        const registry = new TeqFw_Di_Config_NamespaceRegistry({fs, path, appRoot});

        await assert.rejects(() => registry.build(), /outside package root/);
    });

    it('fails when namespace directory does not exist', async () => {
        const appRoot = '/app';
        const fs = createMockFs({
            files: {
                '/app/package.json': toJson({
                    dependencies: {},
                    teqfw: {namespaces: [{prefix: 'App_', path: './missing'}]},
                }),
            },
        });
        const registry = new TeqFw_Di_Config_NamespaceRegistry({fs, path, appRoot});

        await assert.rejects(() => registry.build(), /does not point to existing directory/);
    });

    it('returns immutable registry entries and immutable array', async () => {
        const appRoot = '/app';
        const fs = createMockFs({
            files: {
                '/app/package.json': toJson({
                    dependencies: {},
                    teqfw: {namespaces: [{prefix: 'App_', path: './src'}]},
                }),
            },
            extraDirs: ['/app/src'],
        });
        const registry = new TeqFw_Di_Config_NamespaceRegistry({fs, path, appRoot});

        const result = await registry.build();

        assert.equal(Object.isFrozen(result), true);
        assert.equal(Object.isFrozen(result[0]), true);
        assert.throws(() => {
            // @ts-ignore
            result.push({prefix: 'X_', dirAbs: '/x', ext: '.mjs'});
        });
        assert.throws(() => {
            // @ts-ignore
            result[0].ext = '.js';
        });
    });
});
