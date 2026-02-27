import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

import TeqFw_Di_Container from '../../src/Container.mjs';
import TeqFw_Di_Dto_DepId from '../../src/Dto/DepId.mjs';
import TeqFw_Di_Enum_Composition from '../../src/Enum/Composition.mjs';
import TeqFw_Di_Enum_Life from '../../src/Enum/Life.mjs';
import TeqFw_Di_Enum_Platform from '../../src/Enum/Platform.mjs';

const depIdFactory = new TeqFw_Di_Dto_DepId();

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
    }, {immutable: true});
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
        /** @type {TeqFw_Di_Def_Parser} */
        const parser = /** @type {TeqFw_Di_Def_Parser} */ ({
            parse() {
                return createDepId({moduleName: 'path'});
            },
        });
        container.setParser(parser);

        const promise = container.get('any');
        assert.ok(promise instanceof Promise);
        const value = await promise;

        assert.equal(typeof value, 'object');
        assert.equal(typeof value.join, 'function');
    });

    it('setParser before first get is applied', async () => {
        const container = new TeqFw_Di_Container();
        let calls = 0;
        /** @type {TeqFw_Di_Def_Parser} */
        const parser = /** @type {TeqFw_Di_Def_Parser} */ ({
            parse() {
                calls += 1;
                return createDepId({moduleName: 'path'});
            },
        });
        container.setParser(parser);

        await container.get('custom');
        assert.equal(calls, 1);
    });

    it('setParser does not pre-validate parser shape (fail at point of use)', async () => {
        const container = new TeqFw_Di_Container();
        container.setParser(/** @type {any} */ ({}));
        await assert.rejects(container.get('x'));
    });

    it('namespace roots are accumulated and used on first get only', async () => {
        const dataDir = pathToFileURL(path.resolve('test/_data/integration/modules/teq')).href;
        const shortTarget = `${dataDir}/short`;
        const longTarget = `${dataDir}/long`;
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Ns_', shortTarget, '.mjs');
        container.addNamespaceRoot('Ns_Long_', longTarget, '.mjs');
        /** @type {TeqFw_Di_Def_Parser} */
        const parser = /** @type {TeqFw_Di_Def_Parser} */ ({
            parse() {
                return createDepId({
                    platform: TeqFw_Di_Enum_Platform.TEQ,
                    moduleName: 'Ns_Long_Service',
                    origin: 'teq-cdc',
                });
            },
        });
        container.setParser(parser);

        const value = await container.get('teq');

        assert.equal(value.tag, 'long');
        assert.throws(() => container.addNamespaceRoot('Ns_After_', '/after', '.mjs'), Error);
    });

    it('preprocess and postprocess execute in registration order', async () => {
        const container = new TeqFw_Di_Container();
        /** @type {TeqFw_Di_Def_Parser} */
        const parser = /** @type {TeqFw_Di_Def_Parser} */ ({
            parse() {
                return createDepId({moduleName: 'path'});
            },
        });
        container.setParser(parser);
        container.addPreprocess((depId) => createDepId({...depId, moduleName: 'path/posix'}));
        container.addPostprocess(() => ({order: [1]}));
        container.addPostprocess((value) => ({order: [...value.order, 2]}));

        const value = await container.get('x');

        assert.deepStrictEqual(value.order, [1, 2]);
        assert.ok(Object.isFrozen(value));
    });

    it('configuration is locked after first get', async () => {
        const container = new TeqFw_Di_Container();
        /** @type {TeqFw_Di_Def_Parser} */
        const parser = /** @type {TeqFw_Di_Def_Parser} */ ({
            parse() {
                return createDepId({moduleName: 'path'});
            },
        });
        container.setParser(parser);

        await container.get('x');

        assert.throws(() => container.addPreprocess((depId) => depId), Error);
        assert.throws(() => container.addPostprocess((value) => value), Error);
        assert.throws(() => container.setParser(parser), Error);
        assert.throws(() => container.enableLogging(), Error);
        assert.throws(() => container.enableTestMode(), Error);
        assert.throws(() => container.addNamespaceRoot('Ns_', '/x', '.mjs'), Error);
    });

    it('enableLogging does not alter get result', async () => {
        const container = new TeqFw_Di_Container();
        /** @type {TeqFw_Di_Def_Parser} */
        const parser = /** @type {TeqFw_Di_Def_Parser} */ ({
            parse() {
                return createDepId({moduleName: 'path'});
            },
        });
        container.setParser(parser);
        container.enableLogging();
        const value = await container.get('x');
        assert.equal(typeof value, 'object');
    });

    it('enableLogging throws after first get', async () => {
        const container = new TeqFw_Di_Container();
        /** @type {TeqFw_Di_Def_Parser} */
        const parser = /** @type {TeqFw_Di_Def_Parser} */ ({
            parse() {
                return createDepId({moduleName: 'path'});
            },
        });
        container.setParser(parser);
        await container.get('x');
        assert.throws(() => container.enableLogging(), /locked/);
    });

    it('register throws if test mode is disabled', () => {
        const container = new TeqFw_Di_Container();
        assert.throws(() => container.register('node:path', {mock: true}), /test mode is disabled/);
    });

    it('registered mock bypasses resolver, instantiation and lifecycle but keeps freeze', async () => {
        const container = new TeqFw_Di_Container();
        /** @type {TeqFw_Di_Def_Parser} */
        const parser = /** @type {TeqFw_Di_Def_Parser} */ ({
            parse(cdc) {
                if (cdc === 'registered' || cdc === 'root') {
                    return createDepId({
                        platform: TeqFw_Di_Enum_Platform.NODE,
                        moduleName: 'path',
                        exportName: 'default',
                        composition: TeqFw_Di_Enum_Composition.FACTORY,
                        life: TeqFw_Di_Enum_Life.SINGLETON,
                        wrappers: [],
                        origin: cdc,
                    });
                }
                throw new Error(`Unexpected CDC: ${cdc}`);
            },
        });
        container.setParser(parser);
        container.enableTestMode();
        container.register('registered', {kind: 'mock'});

        const value = await container.get('root');

        assert.deepStrictEqual(value, {kind: 'mock'});
        assert.equal(Object.isFrozen(value), true);
    });

    it('failed state blocks subsequent get calls', async () => {
        const container = new TeqFw_Di_Container();
        let calls = 0;
        /** @type {TeqFw_Di_Def_Parser} */
        const parser = /** @type {TeqFw_Di_Def_Parser} */ ({
            parse() {
                calls += 1;
                throw new Error('parse failed');
            },
        });
        container.setParser(parser);

        await assert.rejects(container.get('x'), /parse failed/);
        await assert.rejects(container.get('x'), /failed state/);
        assert.equal(calls, 1);
        assert.throws(() => container.addPreprocess((depId) => depId), /locked/);
    });

    it('preprocess runs before mock lookup', async () => {
        const container = new TeqFw_Di_Container();
        /** @type {TeqFw_Di_Def_Parser} */
        const parser = /** @type {TeqFw_Di_Def_Parser} */ ({
            parse(cdc) {
                if (cdc === 'registered' || cdc === 'root') {
                    return createDepId({
                        platform: TeqFw_Di_Enum_Platform.NODE,
                        moduleName: 'path',
                        exportName: 'default',
                        composition: TeqFw_Di_Enum_Composition.FACTORY,
                        life: TeqFw_Di_Enum_Life.SINGLETON,
                        wrappers: [],
                        origin: cdc,
                    });
                }
                throw new Error(`Unexpected CDC: ${cdc}`);
            },
        });
        container.setParser(parser);
        container.enableTestMode();
        container.register('registered', {mocked: true});
        container.addPreprocess((depId) => createDepId({
            ...depId,
            exportName: null,
            composition: TeqFw_Di_Enum_Composition.AS_IS,
            life: null,
        }));

        const value = await container.get('root');

        assert.notDeepStrictEqual(value, {mocked: true});
        assert.equal(typeof value.dirname, 'function');
    });
});
