import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

import TeqFw_Di_Container from '../../src2/Container.mjs';
import TeqFw_Di_Dto_DepId from '../../src2/Dto/DepId.mjs';
import TeqFw_Di_Enum_Composition from '../../src2/Enum/Composition.mjs';
import TeqFw_Di_Enum_Life from '../../src2/Enum/Life.mjs';
import TeqFw_Di_Enum_Platform from '../../src2/Enum/Platform.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../_data/integration/modules');

const depIdFactory = new TeqFw_Di_Dto_DepId();

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

/**
 * @param {boolean} logging
 * @param {TeqFw_Di_DepId$DTO} depId
 * @returns {Promise<unknown>}
 */
async function resolveWithMode(logging, depId) {
    const container = new TeqFw_Di_Container();
    container.setParser(createParser({root: depId}));
    if (logging) container.enableLogging();
    return container.get('root');
}

describe('Integration: Container + Resolver', () => {
    it('resolves teq module with namespace roots configured in container', async () => {
        const shortTarget = npmModuleName(path.join(DATA_DIR, 'teq/short'));
        const longTarget = npmModuleName(path.join(DATA_DIR, 'teq/long'));
        const dep = depIdFactory.create({
            platform: TeqFw_Di_Enum_Platform.TEQ,
            moduleName: 'Ns_Long_Service',
            exportName: null,
            composition: TeqFw_Di_Enum_Composition.AS_IS,
            life: null,
            wrappers: [],
            origin: 'teq-root',
        }, {immutable: true});
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Ns_', shortTarget, '.mjs');
        container.addNamespaceRoot('Ns_Long_', longTarget, '.mjs');
        container.setParser(createParser({teqRoot: dep}));

        const value = await container.get('teqRoot');

        assert.equal(value.tag, 'long');
    });

    it('resolves dependency graph, applies lifecycle and freeze', async () => {
        const rootDep = depIdFactory.create({
            platform: TeqFw_Di_Enum_Platform.NPM,
            moduleName: npmModuleName(path.join(DATA_DIR, 'container/Factory.mjs')),
            exportName: 'default',
            composition: TeqFw_Di_Enum_Composition.FACTORY,
            life: TeqFw_Di_Enum_Life.TRANSIENT,
            wrappers: [],
            origin: 'factory-root',
        }, {immutable: true});
        const childDep = depIdFactory.create({
            platform: TeqFw_Di_Enum_Platform.NPM,
            moduleName: npmModuleName(path.join(DATA_DIR, 'container/Child.mjs')),
            exportName: 'value',
            composition: TeqFw_Di_Enum_Composition.AS_IS,
            life: null,
            wrappers: [],
            origin: 'factory-child',
        }, {immutable: true});
        const container = new TeqFw_Di_Container();
        container.setParser(createParser({factoryRoot: rootDep, child: childDep}));

        const first = await container.get('factoryRoot');
        const second = await container.get('factoryRoot');

        assert.deepStrictEqual(first, {mode: 'factory', child: 7});
        assert.deepStrictEqual(second, {mode: 'factory', child: 7});
        assert.equal(Object.isFrozen(first), true);
        assert.notStrictEqual(first, second);
    });

    it('test mode mock bypass returns frozen mock', async () => {
        const dep = depIdFactory.create({
            platform: TeqFw_Di_Enum_Platform.NPM,
            moduleName: npmModuleName(path.join(DATA_DIR, 'container/Factory.mjs')),
            exportName: 'default',
            composition: TeqFw_Di_Enum_Composition.FACTORY,
            life: TeqFw_Di_Enum_Life.TRANSIENT,
            wrappers: [],
            origin: 'mock-root',
        }, {immutable: true});
        const container = new TeqFw_Di_Container();
        container.setParser(createParser({mockCdc: dep, mockRoot: dep}));
        container.enableTestMode();
        container.register('mockCdc', {mode: 'mock'});

        const value = await container.get('mockRoot');

        assert.deepStrictEqual(value, {mode: 'mock'});
        assert.equal(Object.isFrozen(value), true);
    });

    it('no semantic drift: same instance identity with logging disabled/enabled', async () => {
        const singletonDep = depIdFactory.create({
            platform: TeqFw_Di_Enum_Platform.NPM,
            moduleName: npmModuleName(path.join(DATA_DIR, 'container/WrappedSingleton.mjs')),
            exportName: 'default',
            composition: TeqFw_Di_Enum_Composition.FACTORY,
            life: TeqFw_Di_Enum_Life.SINGLETON,
            wrappers: [],
            origin: 'singleton-root',
        }, {immutable: true});
        const c1 = new TeqFw_Di_Container();
        c1.setParser(createParser({root: singletonDep}));
        const c2 = new TeqFw_Di_Container();
        c2.setParser(createParser({root: singletonDep}));
        c2.enableLogging();

        const [a1, a2] = await Promise.all([c1.get('root'), c1.get('root')]);
        const [b1, b2] = await Promise.all([c2.get('root'), c2.get('root')]);

        assert.strictEqual(a1, a2);
        assert.strictEqual(b1, b2);
        assert.deepStrictEqual(a1, b1);
    });

    it('no semantic drift: same error propagation with logging disabled/enabled', async () => {
        const missing = depIdFactory.create({
            platform: TeqFw_Di_Enum_Platform.NPM,
            moduleName: npmModuleName(path.join(DATA_DIR, 'container/DoesNotExist.mjs')),
            exportName: 'default',
            composition: TeqFw_Di_Enum_Composition.FACTORY,
            life: TeqFw_Di_Enum_Life.TRANSIENT,
            wrappers: [],
            origin: 'missing-root',
        }, {immutable: true});

        await assert.rejects(resolveWithMode(false, missing), /Cannot find module|ERR_MODULE_NOT_FOUND/);
        await assert.rejects(resolveWithMode(true, missing), /Cannot find module|ERR_MODULE_NOT_FOUND/);
    });

    it('no semantic drift: same fail-fast behavior with logging disabled/enabled', async () => {
        const missing = depIdFactory.create({
            platform: TeqFw_Di_Enum_Platform.NPM,
            moduleName: npmModuleName(path.join(DATA_DIR, 'container/DoesNotExist.mjs')),
            exportName: 'default',
            composition: TeqFw_Di_Enum_Composition.FACTORY,
            life: TeqFw_Di_Enum_Life.TRANSIENT,
            wrappers: [],
            origin: 'missing-root',
        }, {immutable: true});
        const disabled = new TeqFw_Di_Container();
        disabled.setParser(createParser({root: missing}));
        const enabled = new TeqFw_Di_Container();
        enabled.setParser(createParser({root: missing}));
        enabled.enableLogging();

        await assert.rejects(disabled.get('root'));
        await assert.rejects(disabled.get('root'), /failed state/);

        await assert.rejects(enabled.get('root'));
        await assert.rejects(enabled.get('root'), /failed state/);
    });

    it('logging mode does not change integration resolution result', async () => {
        const rootDep = depIdFactory.create({
            platform: TeqFw_Di_Enum_Platform.NPM,
            moduleName: npmModuleName(path.join(DATA_DIR, 'container/AsIs.mjs')),
            exportName: 'value',
            composition: TeqFw_Di_Enum_Composition.AS_IS,
            life: null,
            wrappers: [],
            origin: 'logging-root',
        }, {immutable: true});
        const container = new TeqFw_Di_Container();
        container.setParser(createParser({loggingRoot: rootDep}));
        container.enableLogging();
        const value = await container.get('loggingRoot');
        assert.deepStrictEqual(value, {mode: 'as-is'});
    });
});
