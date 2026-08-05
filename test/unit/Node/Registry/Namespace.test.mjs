import assert from 'node:assert/strict';
import path from 'node:path';
import {describe, it} from 'node:test';

import TeqFw_Di_Node_Registry_Namespace from '../../../../src/Node/Registry/Namespace.mjs';

/**
 * @param {Record<string, unknown>} value
 * @returns {string}
 */
function toJson(value) {
    return JSON.stringify(value, null, 2);
}

/**
 * Builds an in-memory fake for the `node:fs/promises` subset used by the registry.
 *
 * @param {{files: Record<string, string>, extraDirs?: string[]}} input
 * @returns {typeof import('node:fs/promises')}
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

    return /** @type {typeof import('node:fs/promises')} */ (/** @type {unknown} */ ({
        async readFile(/** @type {string} */ fileAbs) {
            const key = path.resolve(fileAbs);
            if (!files.has(key)) throw createNotFound(key);
            return /** @type {string} */ (files.get(key));
        },
        async stat(/** @type {string} */ absPath) {
            const key = path.resolve(absPath);
            if (dirs.has(key)) return {isDirectory: () => true};
            if (files.has(key)) return {isDirectory: () => false};
            throw createNotFound(key);
        },
        async realpath(/** @type {string} */ absPath) {
            const key = path.resolve(absPath);
            if (dirs.has(key) || files.has(key)) return key;
            throw createNotFound(key);
        },
    }));
}

describe('TeqFw_Di_Node_Registry_Namespace', () => {
    it('builds registry for root and dependencies, normalizes ext, and sorts by descending prefix length', async () => {
        const appRoot = '/app';
        const fs = createMockFs({
            files: {
                '/app/package.json': toJson({
                    name: "package",
                    dependencies: {'dep-a': '1.0.0', 'dep-b': '1.0.0'},
                    teqfw: {fw: {di: {namespaces: [{prefix: 'App_', path: './root', ext: 'js'}, {prefix: 'App_Shared_', path: './shared'}]}}, namespaces: [{prefix: 'Legacy_', path: './legacy'}]},
                }),
                '/app/node_modules/dep-a/package.json': toJson({
                    name: "package",
                    dependencies: {'dep-c': '1.0.0'},
                    teqfw: {fw: {di: {namespaces: [{prefix: 'DepA_', path: './src', ext: '.mjs'}]}}},
                }),
                '/app/node_modules/dep-b/package.json': toJson({
                    name: "package",
                    dependencies: {},
                    teqfw: {fw: {di: {namespaces: [{prefix: 'Dep_', path: './lib'}]}}},
                }),
                '/app/node_modules/dep-c/package.json': toJson({
                    name: "package",
                    dependencies: {},
                    teqfw: {fw: {di: {namespaces: [{prefix: 'DepC_', path: './pkg', ext: 'js'}]}}},
                }),
            },
            extraDirs: [
                '/app/root',
                '/app/root/long',
                '/app/shared',
                '/app/node_modules/dep-a/src',
                '/app/node_modules/dep-b/lib',
                '/app/node_modules/dep-c/pkg',
            ],
        });
        const registry = new TeqFw_Di_Node_Registry_Namespace({fs, path, appRoot});

        const result = await registry.build();

        assert.deepStrictEqual(result, [
            {prefix: 'App_Shared_', dirAbs: '/app/shared', ext: '.mjs'},
            {prefix: 'DepA_', dirAbs: '/app/node_modules/dep-a/src', ext: '.mjs'},
            {prefix: 'DepC_', dirAbs: '/app/node_modules/dep-c/pkg', ext: '.js'},
            {prefix: 'App_', dirAbs: '/app/root', ext: '.js'},
            {prefix: 'Dep_', dirAbs: '/app/node_modules/dep-b/lib', ext: '.mjs'},
        ]);
        assert.equal(result.some((entry) => entry.prefix === 'Legacy_'), false);
    });

    it('fails for duplicate canonical prefix', async () => {
        const appRoot = '/app';
        const fs = createMockFs({
            files: {
                '/app/package.json': toJson({
                    name: "package",
                    dependencies: {'dep-a': '1.0.0'},
                    teqfw: {fw: {di: {namespaces: [{prefix: 'App_', path: './src'}]}}},
                }),
                '/app/node_modules/dep-a/package.json': toJson({
                    name: "@scope/dep-a",
                    dependencies: {},
                    teqfw: {fw: {di: {namespaces: [{prefix: 'App_', path: './lib'}]}}},
                }),
            },
            extraDirs: ['/app/src', '/app/node_modules/dep-a/lib'],
        });
        const registry = new TeqFw_Di_Node_Registry_Namespace({fs, path, appRoot});

        await assert.rejects(() => registry.build(), /Duplicate DI namespace prefix.*package 'package'.*package '@scope\/dep-a'/);
    });

    it('fails for invalid prefix format without trailing underscore', async () => {
        const appRoot = '/app';
        const fs = createMockFs({
            files: {
                '/app/package.json': toJson({
                    name: "package",
                    dependencies: {},
                    teqfw: {fw: {di: {namespaces: [{prefix: 'App', path: './src'}]}}},
                }),
            },
            extraDirs: ['/app/src'],
        });
        const registry = new TeqFw_Di_Node_Registry_Namespace({fs, path, appRoot});

        await assert.rejects(() => registry.build(), /DI namespace prefix.*invalid/);
    });

    it('rejects an absolute namespace path with publisher attribution', async () => {
        const fs = createMockFs({
            files: {'/app/package.json': toJson({name: 'package', dependencies: {}, teqfw: {fw: {di: {namespaces: [{prefix: 'App_', path: '/outside'}]}}}})},
            extraDirs: ['/outside'],
        });
        const registry = new TeqFw_Di_Node_Registry_Namespace({fs, path, appRoot: '/app'});

        await assert.rejects(() => registry.build(), /package 'package'.*relative path/);
    });

    it('fails when namespace path resolves lexically escapes', async () => {
        const appRoot = '/app';
        const fs = createMockFs({
            files: {
                '/app/package.json': toJson({
                    name: "package",
                    dependencies: {},
                    teqfw: {fw: {di: {namespaces: [{prefix: 'App_', path: '../outside'}]}}},
                }),
            },
            extraDirs: ['/outside'],
        });
        const registry = new TeqFw_Di_Node_Registry_Namespace({fs, path, appRoot});

        await assert.rejects(() => registry.build(), /lexically escapes/);
    });

    it('fails when namespace directory does not exist', async () => {
        const appRoot = '/app';
        const fs = createMockFs({
            files: {
                '/app/package.json': toJson({
                    name: "package",
                    dependencies: {},
                    teqfw: {fw: {di: {namespaces: [{prefix: 'App_', path: './missing'}]}}},
                }),
            },
        });
        const registry = new TeqFw_Di_Node_Registry_Namespace({fs, path, appRoot});

        await assert.rejects(() => registry.build(), /existing directory/);
    });

    it('returns immutable registry entries and immutable array', async () => {
        const appRoot = '/app';
        const fs = createMockFs({
            files: {
                '/app/package.json': toJson({
                    name: "package",
                    dependencies: {},
                    teqfw: {fw: {di: {namespaces: [{prefix: 'App_', path: './src'}]}}},
                }),
            },
            extraDirs: ['/app/src'],
        });
        const registry = new TeqFw_Di_Node_Registry_Namespace({fs, path, appRoot});

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

    it('uses legacy arrays only when canonical metadata is absent', async () => {
        const fs = createMockFs({
            files: {
                '/app/package.json': toJson({name: 'package', dependencies: {dual: '1.0.0'}, teqfw: {namespaces: [{prefix: 'Legacy_', path: './legacy'}, {prefix: 'Legacy_Shared_', path: './legacy-shared'}]}}),
                '/app/node_modules/dual/package.json': toJson({name: 'dual', dependencies: {}, teqfw: {fw: {di: {namespaces: []}}, namespaces: [{prefix: 'Ignored_', path: './ignored'}]}}),
            },
            extraDirs: ['/app/legacy', '/app/legacy-shared', '/app/node_modules/dual/ignored'],
        });
        const result = await new TeqFw_Di_Node_Registry_Namespace({fs, path, appRoot: '/app'}).build();
        assert.deepStrictEqual(result, [
            {prefix: 'Legacy_Shared_', dirAbs: '/app/legacy-shared', ext: '.mjs'},
            {prefix: 'Legacy_', dirAbs: '/app/legacy', ext: '.mjs'},
        ]);
    });

    it('rejects malformed selected declaration arrays and identifies invalid entry indexes', async () => {
        const registry = new TeqFw_Di_Node_Registry_Namespace({fs: createMockFs({
            files: {'/app/package.json': toJson({name: 'package', dependencies: {}, teqfw: {fw: {di: {namespaces: [{prefix: 'App_', path: './src'}, null]}}, namespaces: [{prefix: 'Legacy_', path: './legacy'}]}})},
            extraDirs: ['/app/src', '/app/legacy'],
        }), path, appRoot: '/app'});
        await assert.rejects(() => registry.build(), /canonical namespace declaration at index 1/);
        const malformed = new TeqFw_Di_Node_Registry_Namespace({fs: createMockFs({files: {'/app/package.json': toJson({name: 'package', dependencies: {}, teqfw: {fw: {di: {namespaces: {}}}, namespaces: []}})}}), path, appRoot: '/app'});
        await assert.rejects(() => malformed.build(), /Canonical DI namespaces.*array/);
        const malformedLegacy = new TeqFw_Di_Node_Registry_Namespace({fs: createMockFs({files: {'/app/package.json': toJson({name: 'package', dependencies: {}, teqfw: {namespaces: {}}})}}), path, appRoot: '/app'});
        await assert.rejects(() => malformedLegacy.build(), /Legacy DI namespaces.*array/);
    });

    it('rejects duplicate prefixes within one declaration set', async () => {
        const fs = createMockFs({files: {'/app/package.json': toJson({name: 'package', dependencies: {}, teqfw: {fw: {di: {namespaces: [{prefix: 'App_', path: './one'}, {prefix: 'App_', path: './two'}]}}}})}, extraDirs: ['/app/one', '/app/two']});
        await assert.rejects(() => new TeqFw_Di_Node_Registry_Namespace({fs, path, appRoot: '/app'}).build(), /index 1.*index 0/);
    });

    it('ignores the unsupported singular metadata node', async () => {
        const fs = createMockFs({files: {'/app/package.json': toJson({name: 'package', dependencies: {}, teqfw: {fw: {di: {namespace: {prefix: 'Ignored_', path: './ignored'}}}}})}, extraDirs: ['/app/ignored']});
        const result = await new TeqFw_Di_Node_Registry_Namespace({fs, path, appRoot: '/app'}).build();
        assert.deepStrictEqual(result, []);
    });
});
