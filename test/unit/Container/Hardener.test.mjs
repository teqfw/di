import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import TeqFw_Di_Container_Hardener from '../../../src/Container/Hardener.mjs';

describe('TeqFw_Di_Container_Hardener', () => {
    it('preserves primitives and already frozen values', () => {
        const hardener = new TeqFw_Di_Container_Hardener();
        const frozen = Object.freeze({frozen: true});

        assert.deepStrictEqual(hardener.harden(1), {value: 1, mode: 'primitive'});
        assert.strictEqual(hardener.harden(frozen).value, frozen);
        assert.equal(hardener.harden(frozen).mode, 'already-frozen');
    });

    it('freezes ordinary values', () => {
        const hardener = new TeqFw_Di_Container_Hardener();
        const value = {kind: 'ordinary'};

        const result = hardener.harden(value);

        assert.strictEqual(result.value, value);
        assert.equal(result.mode, 'frozen');
        assert.ok(Object.isFrozen(value));
    });

    it('preserves only the exact registered runtime namespace identity', () => {
        const hardener = new TeqFw_Di_Container_Hardener();
        const namespace = {kind: 'runtime'};
        const lookalike = {kind: 'runtime'};
        hardener.registerRuntimeOwned(namespace);

        assert.equal(hardener.harden(namespace).mode, 'runtime-owned');
        assert.equal(hardener.harden(lookalike).mode, 'frozen');
        assert.ok(Object.isFrozen(lookalike));
    });

    it('uses the configured host hardener as a complete replacement', () => {
        const hardener = new TeqFw_Di_Container_Hardener();
        const value = {kind: 'configured'};
        hardener.setConfigured((received) => received);

        const result = hardener.harden(value);

        assert.strictEqual(result.value, value);
        assert.equal(result.mode, 'configured');
        assert.equal(Object.isFrozen(value), false);
    });
});
