import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

import TeqFw_Di_Container from '../../src/Container.mjs';
import {Factory as TeqFw_Di_Dto_DepId_Factory} from '../../src/Dto/DepId.mjs';
import TeqFw_Di_Enum_Composition from '../../src/Enum/Composition.mjs';
import TeqFw_Di_Enum_Life from '../../src/Enum/Life.mjs';
import TeqFw_Di_Enum_Platform from '../../src/Enum/Platform.mjs';

const depIdFactory = new TeqFw_Di_Dto_DepId_Factory();

/**
 * @param {Partial<TeqFw_Di_DepId$DTO>} [patch]
 * @returns {TeqFw_Di_DepId$DTO}
 */
function createDepId(patch = {}) {
    return depIdFactory.create({
        moduleName: 'path',
        platform: TeqFw_Di_Enum_Platform.NODE,
        exportName: null,
        composition: TeqFw_Di_Enum_Composition.AS_IS,
        life: null,
        wrappers: [],
        origin: 'unit-test',
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
        container.addPreprocess((depId) => createDepId({...depId, moduleName: 'TestSample_NamedOnly'}));
        container.addPostprocess(() => ({order: [1]}));
        container.addPostprocess((value) => ({order: [...value.order, 2]}));

        const value = await container.get('TestSample_Empty$');

        assert.deepStrictEqual(value.order, [1, 2]);
        assert.ok(Object.isFrozen(value));
    });

    it('configuration is locked after first get', async () => {
        const container = new TeqFw_Di_Container();
        const dataDir = pathToFileURL(path.resolve('test/fixtures/deps')).href;
        container.addNamespaceRoot('TestSample_', dataDir, '.mjs');

        await container.get('TestSample_Empty$');

        assert.throws(() => container.addPreprocess((depId) => depId), Error);
        assert.throws(() => container.addPostprocess((value) => value), Error);
        assert.throws(() => container.enableLogging(), Error);
        assert.throws(() => container.enableTestMode(), Error);
        assert.throws(() => container.addNamespaceRoot('Ns_', '/x', '.mjs'), Error);
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

    it('register throws if test mode is disabled', () => {
        const container = new TeqFw_Di_Container();
        assert.throws(() => container.register('node:path', {mock: true}), /test mode is disabled/);
    });

    it('registered mock bypasses resolver, instantiation and lifecycle but keeps freeze', async () => {
        const container = new TeqFw_Di_Container();
        const dataDir = pathToFileURL(path.resolve('test/fixtures/deps')).href;
        container.addNamespaceRoot('TestSample_', dataDir, '.mjs');
        container.enableTestMode();
        container.register('TestSample_Empty$', {kind: 'mock'});

        const value = await container.get('TestSample_Empty$');

        assert.deepStrictEqual(value, {kind: 'mock'});
        assert.equal(Object.isFrozen(value), true);
    });

    it('failed state blocks subsequent get calls', async () => {
        const container = new TeqFw_Di_Container();
        const dataDir = pathToFileURL(path.resolve('test/fixtures/deps')).href;
        container.addNamespaceRoot('TestSample_', dataDir, '.mjs');

        await assert.rejects(container.get('TestSample_Missing$'));
        await assert.rejects(container.get('x'), /failed state/);
        assert.throws(() => container.addPreprocess((depId) => depId), /locked/);
    });

    it('preprocess runs before mock lookup', async () => {
        const container = new TeqFw_Di_Container();
        const dataDir = pathToFileURL(path.resolve('test/fixtures/deps')).href;
        container.addNamespaceRoot('TestSample_', dataDir, '.mjs');
        container.enableTestMode();
        container.register('TestSample_Empty$', {mocked: true});
        container.addPreprocess((depId) => createDepId({
            ...depId,
            moduleName: 'TestSample_NamedOnly',
        }));

        const value = await container.get('TestSample_Empty$');

        assert.notDeepStrictEqual(value, {mocked: true});
        assert.equal(typeof value.start, 'function');
    });
});
