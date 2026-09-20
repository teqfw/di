import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import TeqFw_Di_Container_ModuleLoader from '../../../src/Container/ModuleLoader.mjs';

describe('TeqFw_Di_Container_ModuleLoader', () => {
    it('converges native loads and evicts rejected promises', async () => {
        /** @type {string[]} */
        const calls = [];
        const namespace = {value: 1};
        const loader = new TeqFw_Di_Container_ModuleLoader({
            importFn: async (specifier) => {
                calls.push(specifier);
                return namespace;
            },
        });
        const route = {key: 'teq::App_Service', specifier: '/App/Service.mjs'};

        assert.equal(loader.status(route), 'miss');
        const [first, second] = await Promise.all([loader.load(route), loader.load(route)]);
        assert.strictEqual(first, namespace);
        assert.strictEqual(second, namespace);
        assert.deepEqual(calls, ['/App/Service.mjs']);
        assert.equal(loader.status(route), 'hit');

        const failure = new Error('load failed');
        let failCalls = 0;
        const failing = new TeqFw_Di_Container_ModuleLoader({
            importFn: async () => {
                failCalls += 1;
                throw failure;
            },
        });
        await assert.rejects(failing.load({key: 'bad', specifier: 'bad'}), (error) => error === failure);
        assert.equal(failing.status({key: 'bad', specifier: 'bad'}), 'miss');
        await assert.rejects(failing.load({key: 'bad', specifier: 'bad'}), (error) => error === failure);
        assert.equal(failCalls, 2);
    });
});
