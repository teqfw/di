import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import TeqFw_Di_Container from '../../src2/Container.mjs';
import TeqFw_Di_Enum_Composition from '../../src2/Enum/Composition.mjs';
import TeqFw_Di_Enum_Platform from '../../src2/Enum/Platform.mjs';

/**
 * @param {Partial<TeqFw_Di_DepId$DTO>} [patch]
 * @returns {TeqFw_Di_DepId$DTO}
 */
function createDepId(patch = {}) {
    return /** @type {TeqFw_Di_DepId$DTO} */ ({
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
    });
});
