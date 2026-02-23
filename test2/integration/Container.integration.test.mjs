import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

import TeqFw_Di_Container from '../../src2/Container.mjs';
import TeqFw_Di_Dto_DepId from '../../src2/Dto/DepId.mjs';
import TeqFw_Di_Dto_Resolver_Config from '../../src2/Dto/Resolver/Config.mjs';
import TeqFw_Di_Enum_Composition from '../../src2/Enum/Composition.mjs';
import TeqFw_Di_Enum_Life from '../../src2/Enum/Life.mjs';
import TeqFw_Di_Enum_Platform from '../../src2/Enum/Platform.mjs';
import TeqFw_Di_Resolver from '../../src2/Resolver.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../_data/integration/modules');

const depIdFactory = new TeqFw_Di_Dto_DepId();
const resolverConfigFactory = new TeqFw_Di_Dto_Resolver_Config();

/**
 * @param {string} filePath
 * @returns {string}
 */
function npmModuleName(filePath) {
    return pathToFileURL(filePath).href;
}

/**
 * @param {Record<string, TeqFw_Di_DepId$DTO>} map
 * @returns {TeqFw_Di_Def_Parser}
 */
function createParser(map) {
    return /** @type {TeqFw_Di_Def_Parser} */ ({
        parse(cdc) {
            if (!(cdc in map)) throw new Error(`Unknown CDC: ${cdc}`);
            return map[cdc];
        },
    });
}

describe('Integration: Container + Resolver', () => {
    it('longest-prefix namespace resolution (Resolver)', async () => {
        const shortTarget = npmModuleName(path.join(DATA_DIR, 'teq/short'));
        const longTarget = npmModuleName(path.join(DATA_DIR, 'teq/long'));
        const config = resolverConfigFactory.create({
            namespaces: [
                {prefix: 'Ns_', target: shortTarget, defaultExt: '.mjs'},
                {prefix: 'Ns_Long_', target: longTarget, defaultExt: '.mjs'},
            ],
        });
        const resolver = new TeqFw_Di_Resolver({config});
        const depId = depIdFactory.create({
            platform: TeqFw_Di_Enum_Platform.TEQ,
            moduleName: 'Ns_Long_Service',
            composition: TeqFw_Di_Enum_Composition.AS_IS,
            life: null,
            exportName: null,
            wrappers: [],
            origin: 'root',
        }, {immutable: true});

        const namespace = await resolver.resolve(depId);

        assert.equal(namespace.tag, 'long');
    });

    it('composition modes (AS_IS and FACTORY)', async () => {
        const asIsDep = depIdFactory.create({
            platform: TeqFw_Di_Enum_Platform.NPM,
            moduleName: npmModuleName(path.join(DATA_DIR, 'container/AsIs.mjs')),
            exportName: 'value',
            composition: TeqFw_Di_Enum_Composition.AS_IS,
            life: null,
            wrappers: [],
            origin: 'asIs',
        }, {immutable: true});
        const childDep = depIdFactory.create({
            platform: TeqFw_Di_Enum_Platform.NPM,
            moduleName: npmModuleName(path.join(DATA_DIR, 'container/Child.mjs')),
            exportName: 'value',
            composition: TeqFw_Di_Enum_Composition.AS_IS,
            life: null,
            wrappers: [],
            origin: 'child',
        }, {immutable: true});
        const factoryDep = depIdFactory.create({
            platform: TeqFw_Di_Enum_Platform.NPM,
            moduleName: npmModuleName(path.join(DATA_DIR, 'container/Factory.mjs')),
            exportName: 'default',
            composition: TeqFw_Di_Enum_Composition.FACTORY,
            life: TeqFw_Di_Enum_Life.TRANSIENT,
            wrappers: [],
            origin: 'factory',
        }, {immutable: true});

        const container = new TeqFw_Di_Container();
        container.setParser(createParser({
            asIs: asIsDep,
            factory: factoryDep,
            child: childDep,
        }));

        const asIs = await container.get('asIs');
        const factory = await container.get('factory');

        assert.equal(asIs.mode, 'as-is');
        assert.deepStrictEqual(factory, {mode: 'factory', child: 7});
    });

    it('lifecycle + factory (singleton reuse)', async () => {
        const singletonDep = depIdFactory.create({
            platform: TeqFw_Di_Enum_Platform.NPM,
            moduleName: npmModuleName(path.join(DATA_DIR, 'container/WrappedSingleton.mjs')),
            exportName: 'default',
            composition: TeqFw_Di_Enum_Composition.FACTORY,
            life: TeqFw_Di_Enum_Life.SINGLETON,
            wrappers: [],
            origin: 'singleton',
        }, {immutable: true});
        const container = new TeqFw_Di_Container();
        container.setParser(createParser({singleton: singletonDep}));

        const first = await container.get('singleton');
        const second = await container.get('singleton');

        assert.strictEqual(first, second);
    });

    it('mixed platform graphs (node + npm)', async () => {
        const rootDep = depIdFactory.create({
            platform: TeqFw_Di_Enum_Platform.NPM,
            moduleName: npmModuleName(path.join(DATA_DIR, 'container/MixedRoot.mjs')),
            exportName: 'default',
            composition: TeqFw_Di_Enum_Composition.FACTORY,
            life: TeqFw_Di_Enum_Life.TRANSIENT,
            wrappers: [],
            origin: 'mixedRoot',
        }, {immutable: true});
        const nodePathDep = depIdFactory.create({
            platform: TeqFw_Di_Enum_Platform.NODE,
            moduleName: 'path',
            exportName: null,
            composition: TeqFw_Di_Enum_Composition.AS_IS,
            life: null,
            wrappers: [],
            origin: 'nodePath',
        }, {immutable: true});
        const npmChildDep = depIdFactory.create({
            platform: TeqFw_Di_Enum_Platform.NPM,
            moduleName: npmModuleName(path.join(DATA_DIR, 'container/NpmChild.mjs')),
            exportName: null,
            composition: TeqFw_Di_Enum_Composition.AS_IS,
            life: null,
            wrappers: [],
            origin: 'npmChild',
        }, {immutable: true});

        const container = new TeqFw_Di_Container();
        container.setParser(createParser({
            mixedRoot: rootDep,
            nodePath: nodePathDep,
            npmChild: npmChildDep,
        }));

        const value = await container.get('mixedRoot');

        assert.equal(value.hasNodeJoin, true);
        assert.equal(value.npmValue, 'npm-child');
    });

    it('wrapper + lifecycle interaction (wrapped once for singleton)', async () => {
        const wrappedSingletonDep = depIdFactory.create({
            platform: TeqFw_Di_Enum_Platform.NPM,
            moduleName: npmModuleName(path.join(DATA_DIR, 'container/WrappedSingleton.mjs')),
            exportName: 'default',
            composition: TeqFw_Di_Enum_Composition.FACTORY,
            life: TeqFw_Di_Enum_Life.SINGLETON,
            wrappers: ['wrap'],
            origin: 'wrappedSingleton',
        }, {immutable: true});
        const container = new TeqFw_Di_Container();
        container.setParser(createParser({wrappedSingleton: wrappedSingletonDep}));

        const first = await container.get('wrappedSingleton');
        const second = await container.get('wrappedSingleton');
        const namespace = await import(npmModuleName(path.join(DATA_DIR, 'container/WrappedSingleton.mjs')));

        assert.strictEqual(first, second);
        assert.equal(first.wrapped, true);
        assert.equal(namespace.wrapCalls(), 1);
    });
});
