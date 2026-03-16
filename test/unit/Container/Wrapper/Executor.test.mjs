import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import TeqFw_Di_Container_Wrapper_Executor from '../../../../src/Container/Wrapper/Executor.mjs';

/**
 * @param {Partial<TeqFw_Di_DepId$DTO>} [patch]
 * @returns {TeqFw_Di_DepId$DTO}
 */
function createDepId(patch = {}) {
    return /** @type {TeqFw_Di_DepId$DTO} */ ({
        moduleName: 'App_Module',
        platform: 'teq',
        exportName: 'default',
        composition: 'F',
        life: 'T',
        wrappers: [],
        origin: 'unit-test',
        ...patch,
    });
}

describe('TeqFw_Di_Container_Wrapper_Executor', () => {
    it('single wrapper', () => {
        const executor = new TeqFw_Di_Container_Wrapper_Executor();
        const depId = createDepId({wrappers: ['log']});
        const namespace = {
            log: (value) => `${String(value)}!`,
        };

        const result = executor.execute(depId, 'ok', namespace);

        assert.equal(result, 'ok!');
    });

    it('multiple wrappers preserve declaration order', () => {
        const executor = new TeqFw_Di_Container_Wrapper_Executor();
        const depId = createDepId({wrappers: ['w1', 'w2']});
        const namespace = {
            w1: (value) => `${String(value)}A`,
            w2: (value) => `${String(value)}B`,
        };

        const result = executor.execute(depId, 'X', namespace);

        assert.equal(result, 'XAB');
    });

    it('Promise rejection', () => {
        const executor = new TeqFw_Di_Container_Wrapper_Executor();
        const depId = createDepId({wrappers: ['asyncWrap']});
        const namespace = {
            asyncWrap: () => Promise.resolve('bad'),
        };

        assert.throws(() => executor.execute(depId, 'X', namespace), Error);
    });

    it('wrapper result may be proxy that throws on `.then` access', () => {
        const executor = new TeqFw_Di_Container_Wrapper_Executor();
        const depId = createDepId({wrappers: ['protect']});
        const proxy = new Proxy({ok: true}, {
            get(target, prop, receiver) {
                if (prop === 'then') throw new Error('then access denied');
                return Reflect.get(target, prop, receiver);
            }
        });
        const namespace = {
            protect: () => proxy,
        };

        const result = executor.execute(depId, 'X', namespace);

        assert.equal(result, proxy);
    });

    it('missing wrapper error', () => {
        const executor = new TeqFw_Di_Container_Wrapper_Executor();
        const depId = createDepId({wrappers: ['missing']});
        const namespace = {};

        assert.throws(() => executor.execute(depId, 'X', namespace), Error);
    });

    it('does not pre-validate namespace shape and fails at point of use', () => {
        const executor = new TeqFw_Di_Container_Wrapper_Executor();
        const depId = createDepId({wrappers: ['w1']});
        assert.throws(() => executor.execute(depId, 'X', null), TypeError);
        assert.throws(() => executor.execute(depId, 'X', 'bad'), TypeError);
    });
});
