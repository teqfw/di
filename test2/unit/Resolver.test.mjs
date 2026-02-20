import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import TeqFw_Di_Resolver from '../../src2/Resolver.mjs';
import DepIdFactory from '../../src2/Dto/DepId.mjs';
import ResolverConfigFactory from '../../src2/Dto/Resolver/Config.mjs';
import TeqFw_Di_Enum_Platform from '../../src2/Enum/Platform.mjs';

const depIdFactory = new DepIdFactory();
const configFactory = new ResolverConfigFactory();

function createDepId(overrides = {}) {
    return depIdFactory.create({
        moduleName: 'Ns_Group_Web_App_Service',
        platform: TeqFw_Di_Enum_Platform.TEQ,
        exportName: null,
        composition: 'A',
        life: null,
        wrappers: [],
        origin: 'unit-test',
        ...overrides,
    });
}

function createConfig(overrides = {}) {
    return configFactory.create({
        namespaces: [
            {prefix: 'Ns_Group_', target: '/lib/group', defaultExt: '.mjs'},
            {prefix: 'Ns_Group_Web_', target: '/lib/group-web', defaultExt: '.mjs'},
        ],
        nodeModulesRoot: '/project/node_modules',
        ...overrides,
    });
}

function createImportDouble() {
    const calls = [];
    const moduleBySpecifier = new Map();
    const errorBySpecifier = new Map();
    const importer = (specifier) => {
        calls.push(specifier);
        if (errorBySpecifier.has(specifier)) throw errorBySpecifier.get(specifier);
        if (moduleBySpecifier.has(specifier)) return moduleBySpecifier.get(specifier);
        throw new Error(`Unexpected specifier: ${specifier}`);
    };
    return {
        calls,
        importer,
        setModule(specifier, namespace) {
            moduleBySpecifier.set(specifier, namespace);
        },
        setError(specifier, error) {
            errorBySpecifier.set(specifier, error);
        },
    };
}

function createResolver(config, importer) {
    const resolver = new TeqFw_Di_Resolver({config, importFn: importer});
    assert.equal(typeof resolver.resolve, 'function');
    return resolver;
}

describe('TeqFw_Di_Resolver', () => {
    describe('async contract', () => {
        it('resolve returns Promise and resolves asynchronously', async () => {
            const io = createImportDouble();
            const specifier = '/lib/group-web/App/Service.mjs';
            const namespace = {};
            io.setModule(specifier, namespace);
            const resolver = createResolver(createConfig(), io.importer);
            const promise = resolver.resolve(createDepId());
            assert.ok(promise instanceof Promise);
            let settled = false;
            promise.then(() => {
                settled = true;
            });
            assert.equal(settled, false);
            const result = await promise;
            assert.strictEqual(result, namespace);
        });

        it('resolve rejects asynchronously', async () => {
            const io = createImportDouble();
            const specifier = '/lib/group-web/App/Service.mjs';
            const failure = new Error('import failed');
            io.setError(specifier, failure);
            const resolver = createResolver(createConfig(), io.importer);
            const promise = resolver.resolve(createDepId());
            assert.ok(promise instanceof Promise);
            let settled = false;
            promise.catch(() => {
                settled = true;
            });
            assert.equal(settled, false);
            await assert.rejects(promise, (error) => {
                assert.strictEqual(error, failure);
                return true;
            });
        });
    });

    describe('platform handling', () => {
        it('derives node specifier with node scheme', async () => {
            const io = createImportDouble();
            const namespace = {};
            io.setModule('node:fs', namespace);
            const resolver = createResolver(createConfig(), io.importer);
            const result = await resolver.resolve(createDepId({platform: TeqFw_Di_Enum_Platform.NODE, moduleName: 'fs'}));
            assert.deepStrictEqual(io.calls, ['node:fs']);
            assert.strictEqual(result, namespace);
        });

        it('derives npm specifier from moduleName deterministically', async () => {
            const io = createImportDouble();
            const namespace = {};
            io.setModule('@scope/pkg', namespace);
            const resolver = createResolver(createConfig({nodeModulesRoot: '/custom/root/node_modules'}), io.importer);
            const result = await resolver.resolve(createDepId({platform: TeqFw_Di_Enum_Platform.NPM, moduleName: '@scope/pkg'}));
            assert.deepStrictEqual(io.calls, ['@scope/pkg']);
            assert.strictEqual(result, namespace);
        });

        it('derives teq specifier with longest prefix and default extension', async () => {
            const io = createImportDouble();
            const namespace = {};
            const specifier = '/lib/group-web/App/Dto/Config.mjs';
            io.setModule(specifier, namespace);
            const resolver = createResolver(createConfig(), io.importer);
            const result = await resolver.resolve(createDepId({moduleName: 'Ns_Group_Web_App_Dto_Config'}));
            assert.deepStrictEqual(io.calls, [specifier]);
            assert.strictEqual(result, namespace);
        });
    });

    describe('longest prefix match', () => {
        it('selects longest matching namespace prefix', async () => {
            const io = createImportDouble();
            io.setModule('/lib/group-web/App/Dto/Config.mjs', {});
            const resolver = createResolver(createConfig(), io.importer);
            await resolver.resolve(createDepId({moduleName: 'Ns_Group_Web_App_Dto_Config'}));
            assert.deepStrictEqual(io.calls, ['/lib/group-web/App/Dto/Config.mjs']);
        });

        it('rejects when no namespace prefix matches teq moduleName', async () => {
            const io = createImportDouble();
            const resolver = createResolver(createConfig(), io.importer);
            await assert.rejects(resolver.resolve(createDepId({moduleName: 'Unknown_Module'})), Error);
            assert.deepStrictEqual(io.calls, []);
        });

        it('is deterministic for identical-length prefix candidates', async () => {
            const io = createImportDouble();
            const config = createConfig({
                namespaces: [
                    {prefix: 'Ns_App_', target: '/first', defaultExt: '.mjs'},
                    {prefix: 'Ns_App_', target: '/second', defaultExt: '.mjs'},
                ],
            });
            io.setModule('/first/Service.mjs', {});
            io.setModule('/first/Repo.mjs', {});
            const resolver = createResolver(config, io.importer);
            await resolver.resolve(createDepId({moduleName: 'Ns_App_Service'}));
            await resolver.resolve(createDepId({moduleName: 'Ns_App_Repo'}));
            assert.deepStrictEqual(io.calls, ['/first/Service.mjs', '/first/Repo.mjs']);
        });
    });

    describe('specifier derivation determinism', () => {
        it('does not normalize path separators and appends extension exactly once', async () => {
            const io = createImportDouble();
            const config = createConfig({
                namespaces: [{prefix: 'Ns_Core_', target: '.\\pkg\\core', defaultExt: '.mjs'}],
            });
            const depId = createDepId({moduleName: 'Ns_Core_Service', platform: TeqFw_Di_Enum_Platform.TEQ});
            const expected = '.\\pkg\\core/Service.mjs';
            io.setModule(expected, {});
            const resolver = createResolver(config, io.importer);
            await resolver.resolve(depId);
            assert.deepStrictEqual(io.calls, [expected]);
        });
    });

    describe('caching', () => {
        it('caches by (platform, moduleName) and keeps namespace identity', async () => {
            const io = createImportDouble();
            const namespace = {tag: 'same-ref'};
            io.setModule('/lib/group-web/App/Service.mjs', namespace);
            io.setModule('node:Ns_Group_Web_App_Service', {kind: 'node'});
            io.setModule('/lib/group-web/App/Repo.mjs', {kind: 'repo'});
            const resolver = createResolver(createConfig(), io.importer);
            const base = createDepId({moduleName: 'Ns_Group_Web_App_Service'});
            const first = await resolver.resolve(base);
            const second = await resolver.resolve(depIdFactory.create({...base, exportName: 'missing'}));
            const third = await resolver.resolve(createDepId({moduleName: 'Ns_Group_Web_App_Service', platform: TeqFw_Di_Enum_Platform.NODE}));
            const fourth = await resolver.resolve(createDepId({moduleName: 'Ns_Group_Web_App_Repo'}));
            assert.strictEqual(first, namespace);
            assert.strictEqual(second, namespace);
            assert.strictEqual(first, second);
            assert.notStrictEqual(third, namespace);
            assert.ok(fourth);
            assert.deepStrictEqual(io.calls, ['/lib/group-web/App/Service.mjs', 'node:Ns_Group_Web_App_Service', '/lib/group-web/App/Repo.mjs']);
        });
    });

    describe('error propagation', () => {
        it('rejects with the original import error instance', async () => {
            const io = createImportDouble();
            const failure = new TypeError('native import failure');
            io.setError('/lib/group-web/App/Service.mjs', failure);
            const resolver = createResolver(createConfig(), io.importer);
            await assert.rejects(resolver.resolve(createDepId()), (error) => {
                assert.strictEqual(error, failure);
                return true;
            });
        });
    });

    describe('responsibility boundary', () => {
        it('does not validate export presence or inspect namespace', async () => {
            const io = createImportDouble();
            const namespace = Object.create(null);
            Object.defineProperty(namespace, 'danger', {
                get() {
                    throw new Error('namespace inspected');
                },
            });
            io.setModule('/lib/group-web/App/Service.mjs', namespace);
            const resolver = createResolver(createConfig(), io.importer);
            const result = await resolver.resolve(createDepId({exportName: 'missingExport'}));
            assert.strictEqual(result, namespace);
        });
    });

    describe('configuration immutability after start', () => {
        it('uses initial configuration snapshot after first resolution attempt', async () => {
            const io = createImportDouble();
            const config = createConfig();
            io.setModule('/lib/group-web/App/Service.mjs', {});
            io.setModule('/lib/group-web/App/Repo.mjs', {});
            const resolver = createResolver(config, io.importer);
            await resolver.resolve(createDepId({moduleName: 'Ns_Group_Web_App_Service'}));
            config.namespaces[1].target = '/hijacked';
            config.namespaces.push({prefix: 'Ns_New_', target: '/new', defaultExt: '.mjs'});
            await resolver.resolve(createDepId({moduleName: 'Ns_Group_Web_App_Repo'}));
            await assert.rejects(resolver.resolve(createDepId({moduleName: 'Ns_New_Service'})), Error);
            assert.deepStrictEqual(io.calls, ['/lib/group-web/App/Service.mjs', '/lib/group-web/App/Repo.mjs']);
        });
    });

    describe('determinism smoke tests', () => {
        it('resolution order does not affect outcomes of independent depIds', async () => {
            const ioA = createImportDouble();
            const ioB = createImportDouble();
            ioA.setModule('/lib/group-web/App/Service.mjs', {v: 'service'});
            ioA.setModule('/lib/group-web/App/Repo.mjs', {v: 'repo'});
            ioB.setModule('/lib/group-web/App/Service.mjs', {v: 'service'});
            ioB.setModule('/lib/group-web/App/Repo.mjs', {v: 'repo'});
            const resolverA = createResolver(createConfig(), ioA.importer);
            const resolverB = createResolver(createConfig(), ioB.importer);
            const depService = createDepId({moduleName: 'Ns_Group_Web_App_Service'});
            const depRepo = createDepId({moduleName: 'Ns_Group_Web_App_Repo'});
            const [a1, a2] = await Promise.all([resolverA.resolve(depService), resolverA.resolve(depRepo)]);
            const [b2, b1] = await Promise.all([resolverB.resolve(depRepo), resolverB.resolve(depService)]);
            assert.equal(a1.v, b1.v);
            assert.equal(a2.v, b2.v);
            assert.deepStrictEqual(ioA.calls.sort(), ['/lib/group-web/App/Repo.mjs', '/lib/group-web/App/Service.mjs']);
            assert.deepStrictEqual(ioB.calls.sort(), ['/lib/group-web/App/Repo.mjs', '/lib/group-web/App/Service.mjs']);
        });
    });
});
