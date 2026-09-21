import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

import TeqFw_Di_Container from '../../src/Container.mjs';
import {Factory as TeqFw_Di_Dto_DepId_Factory} from '../../src/Dto/DepId.mjs';
import TeqFw_Di_Enum_AddressKind from '../../src/Enum/AddressKind.mjs';
import TeqFw_Di_Enum_Lifestyle from '../../src/Enum/Lifestyle.mjs';

const depIdFactory = new TeqFw_Di_Dto_DepId_Factory();

/**
 * @param {Partial<Pick<TeqFw_Di_Dto_DepId, 'addressKind'|'address'|'exportName'|'lifestyle'|'wrappers'>>} [patch]
 * @returns {TeqFw_Di_Dto_DepId}
 */
function createDepId(patch = {}) {
    return depIdFactory.create({
        addressKind: TeqFw_Di_Enum_AddressKind.NODE,
        address: 'path',
        exportName: null,
        lifestyle: TeqFw_Di_Enum_Lifestyle.DIRECT,
        wrappers: [],
        ...patch,
    });
}

describe('TeqFw_Di_Container', () => {
    it('exposes required public methods', () => {
        const container = new TeqFw_Di_Container();
        assert.equal(typeof container.get, 'function');
        assert.equal(typeof container.addPreprocess, 'function');
        assert.equal(typeof container.addPostprocess, 'function');
        assert.equal(typeof container.addNamespaceRoot, 'function');
        assert.equal(typeof container.enableLogging, 'function');
        assert.equal('enableIntrospection' in container, false);
        assert.equal(typeof container.getIntrospection, 'function');
        assert.equal(typeof container.enableTestMode, 'function');
        assert.equal(typeof container.register, 'function');
    });

    it('get is asynchronous and resolves value', async () => {
        const container = new TeqFw_Di_Container();
        const dataDir = pathToFileURL(path.resolve('test/fixtures/deps')).href;
        container.addNamespaceRoot('TestSample_', dataDir, '.mjs');

        const promise = container.get('TestSample_Empty$');
        assert.ok(promise instanceof Promise);
        const value = await promise;

        assert.equal(typeof value, 'object');
        assert.equal(typeof value.start, 'function');
    });

    it('namespace roots are accumulated and used on first get only', async () => {
        const dataDir = pathToFileURL(path.resolve('test/integration/fixture')).href;
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', dataDir, '.mjs');
        container.addNamespaceRoot('Fx_Graph_', dataDir, '.mjs');

        const value = await container.get('Fx_Graph_Root$');

        assert.equal(value.name, 'root');
        assert.throws(() => container.addNamespaceRoot('Fx_After_', '/after', '.mjs'), Error);
    });

    it('preprocess and postprocess execute in registration order', async () => {
        const container = new TeqFw_Di_Container();
        const dataDir = pathToFileURL(path.resolve('test/fixtures/deps')).href;
        container.addNamespaceRoot('TestSample_', dataDir, '.mjs');
        container.addPreprocess((depId, _context) => createDepId({...depId, address: 'TestSample_NamedOnly'}));
        /** @type {TeqFw_Di_Container_ResolutionContext|undefined} */
        let context;
        container.addPostprocess((_value, receivedContext) => {
            context = receivedContext;
            return {order: [1]};
        });
        container.addPostprocess((value, _context) => ({
            order: [...(/** @type {{order: number[]}} */ (value)).order, 2],
        }));

        const value = await container.get('TestSample_Empty$');

        assert.deepStrictEqual(value.order, [1, 2]);
        assert.ok(Object.isFrozen(value));
        assert.equal(context?.depId.address, 'TestSample_NamedOnly');
        assert.ok(Object.isFrozen(context));
        assert.ok(Object.isFrozen(context?.depId));
    });

    it('configuration is locked after first get', async () => {
        const container = new TeqFw_Di_Container();
        const dataDir = pathToFileURL(path.resolve('test/fixtures/deps')).href;
        container.addNamespaceRoot('TestSample_', dataDir, '.mjs');

        await container.get('TestSample_Empty$');

        assert.throws(() => container.addPreprocess((depId) => depId), Error);
        assert.throws(() => container.addPostprocess((value) => value), Error);
        assert.throws(() => container.setHardener((value) => value), Error);
        assert.throws(() => container.enableLogging(), Error);
        assert.throws(() => container.enableTestMode(), Error);
        assert.throws(() => container.addNamespaceRoot('Ns_', '/x', '.mjs'), Error);
        assert.throws(() => container.register('node:path', {mock: true}), Error);
    });

    it('locks configuration when the first resolution begins', async () => {
        const container = new TeqFw_Di_Container();
        const dataDir = pathToFileURL(path.resolve('test/fixtures/deps')).href;
        container.addNamespaceRoot('TestSample_', dataDir, '.mjs');
        container.enableTestMode();

        const pending = container.get('TestSample_Empty$');

        assert.throws(() => container.addPostprocess((value) => value), /locked/);
        assert.throws(() => container.enableTestMode(), /locked/);
        assert.throws(() => container.register('TestSample_Empty$', {mock: true}), /locked/);
        const value = await pending;

        assert.equal(typeof value.start, 'function');
    });

    it('enableLogging does not alter get result', async () => {
        const container = new TeqFw_Di_Container();
        const dataDir = pathToFileURL(path.resolve('test/fixtures/deps')).href;
        container.addNamespaceRoot('TestSample_', dataDir, '.mjs');
        container.enableLogging();
        const value = await container.get('TestSample_Empty$');
        assert.equal(typeof value, 'object');
    });

    it('enableLogging throws after first get', async () => {
        const container = new TeqFw_Di_Container();
        const dataDir = pathToFileURL(path.resolve('test/fixtures/deps')).href;
        container.addNamespaceRoot('TestSample_', dataDir, '.mjs');
        await container.get('TestSample_Empty$');
        assert.throws(() => container.enableLogging(), /locked/);
    });

    it('preserves entry provenance in diagnostics for sequential entries', async () => {
        const container = new TeqFw_Di_Container();
        const dataDir = pathToFileURL(path.resolve('test/fixtures/deps')).href;
        container.addNamespaceRoot('TestSample_', dataDir, '.mjs');
        /** @type {string[]} */
        const messages = [];
        const debug = console.debug;
        console.debug = (message) => messages.push(String(message));
        try {
            container.enableLogging();
            await container.get('TestSample_Empty$');
            await container.get('TestSample_NamedOnly');
        } finally {
            console.debug = debug;
        }

        assert.ok(messages.some((message) => message.includes("Container.entry: id='entry-0' specifier='TestSample_Empty$'")));
        assert.ok(messages.some((message) => message.includes("Container.entry: id='entry-1' specifier='TestSample_NamedOnly'")));
    });

    it('register throws if test mode is disabled', () => {
        const container = new TeqFw_Di_Container();
        assert.throws(() => container.register('node:path', {mock: true}), /test mode is disabled/);
    });

    it('registered mock replaces acquisition while preserving the output boundary', async () => {
        const container = new TeqFw_Di_Container();
        const dataDir = pathToFileURL(path.resolve('test/fixtures/deps')).href;
        container.addNamespaceRoot('TestSample_', dataDir, '.mjs');
        container.enableTestMode();
        container.register('TestSample_Empty$', {kind: 'mock'});

        const value = await container.get('TestSample_Empty$');

        assert.deepStrictEqual(value, {kind: 'mock'});
        assert.equal(Object.isFrozen(value), true);
    });

    it('keeps Running after an entry resolution failure', async () => {
        const container = new TeqFw_Di_Container();
        const dataDir = pathToFileURL(path.resolve('test/fixtures/deps')).href;
        container.addNamespaceRoot('TestSample_', dataDir, '.mjs');

        await assert.rejects(container.get('TestSample_Missing$'));
        const value = await container.get('TestSample_Empty$');
        assert.equal(typeof value.start, 'function');
        assert.throws(() => container.addPreprocess((depId) => depId), /locked/);
    });

    it('rejects concurrent public entries while an entry is active', async () => {
        const container = new TeqFw_Di_Container();
        const dataDir = pathToFileURL(path.resolve('test/fixtures/deps')).href;
        container.addNamespaceRoot('TestSample_', dataDir, '.mjs');

        const first = container.get('TestSample_Empty$');
        await assert.rejects(container.get('TestSample_Empty$'), /concurrent|re-entrant|busy/i);
        await first;
    });

    it('accepts sequential public entries after the Container is Running', async () => {
        const container = new TeqFw_Di_Container();
        const dataDir = pathToFileURL(path.resolve('test/fixtures/deps')).href;
        container.addNamespaceRoot('TestSample_', dataDir, '.mjs');

        const first = await container.get('TestSample_Empty$');
        const second = await container.get('TestSample_Empty$');
        assert.strictEqual(first, second);
    });

    it('rejects a re-entrant public entry from an active resolution', async () => {
        const container = new TeqFw_Di_Container();
        const dataDir = pathToFileURL(path.resolve('test/fixtures/deps')).href;
        container.addNamespaceRoot('TestSample_', dataDir, '.mjs');
        /** @type {Promise<unknown>|undefined} */
        let reentrant;
        container.addPostprocess((value) => {
            reentrant = container.get('TestSample_Empty$');
            return value;
        });

        await container.get('TestSample_Empty$');
        await assert.rejects(/** @type {Promise<unknown>} */ (reentrant), /concurrent|re-entrant|busy/i);
    });

    it('finalizes registered substitutions through the configured preprocessing policy', async () => {
        const container = new TeqFw_Di_Container();
        const dataDir = pathToFileURL(path.resolve('test/fixtures/deps')).href;
        container.addNamespaceRoot('TestSample_', dataDir, '.mjs');
        container.enableTestMode();
        container.register('TestSample_Empty$', {mocked: true});
        container.addPreprocess((depId, _context) => createDepId({
            ...depId,
            address: 'TestSample_NamedOnly',
        }));

        const value = await container.get('TestSample_Empty$');

        assert.deepStrictEqual(value, {mocked: true});
        assert.equal(Object.isFrozen(value), true);
    });
});
