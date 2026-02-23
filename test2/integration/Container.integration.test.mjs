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

        /** @type {string[]} */
        const logs = [];
        const previous = console.debug;
        console.debug = (...args) => logs.push(args.join(' '));
        try {
            const value = await container.get('loggingRoot');
            assert.deepStrictEqual(value, {mode: 'as-is'});
        } finally {
            console.debug = previous;
        }
        assert.ok(logs.length > 0);
    });
});
