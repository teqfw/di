import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import TeqFw_Di_Container_Producer from '../../../src/Container/Producer.mjs';

describe('TeqFw_Di_Container_Producer', () => {
    it('dispatches callable and constructable producers with synchronous results', () => {
        const producer = new TeqFw_Di_Container_Producer();
        class Constructed {
            constructor(/** @type {Record<string, unknown>} */ deps) {
                this.kind = deps.kind;
            }
        }

        assert.deepEqual(producer.produce((/** @type {Record<string, unknown>} */ deps) => ({kind: deps.kind}), {kind: 'call'}), {kind: 'call'});
        assert.equal((/** @type {{kind: string}} */ (producer.produce(Constructed, {kind: 'new'}))).kind, 'new');
        assert.throws(() => producer.produce(() => Promise.resolve(), {}), /synchronously/);
    });
});
