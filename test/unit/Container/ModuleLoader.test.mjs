import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import TeqFw_Di_Container_ModuleLoader from '../../../src/Container/ModuleLoader.mjs';

describe('TeqFw_Di_Container_ModuleLoader', () => {
    it('passes each route to the native import boundary', async () => {
        /** @type {string[]} */
        const calls = [];
        const namespace = {value: 1};
        const loader = new TeqFw_Di_Container_ModuleLoader({
            importFn: async (specifier) => {
                calls.push(specifier);
                return namespace;
            },
        });
        const route = {specifier: '/App/Service.mjs'};

        const first = await loader.load(route);
        const second = await loader.load(route);
        assert.strictEqual(first, namespace);
        assert.strictEqual(second, namespace);
        assert.deepEqual(calls, ['/App/Service.mjs', '/App/Service.mjs']);

        const failure = new Error('load failed');
        let failCalls = 0;
        const failing = new TeqFw_Di_Container_ModuleLoader({
            importFn: async () => {
                failCalls += 1;
                throw failure;
            },
        });
        await assert.rejects(failing.load({specifier: 'bad'}), (error) => error === failure);
        await assert.rejects(failing.load({specifier: 'bad'}), (error) => error === failure);
        assert.equal(failCalls, 2);
    });
});
