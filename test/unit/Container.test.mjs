import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import Container from '../../src/Container.mjs';

describe('TeqFw_Di_Container', () => {
    it('exposes only resolution, observation and test-substitution methods', () => {
        assert.deepEqual(Object.keys(new Container()).sort(), [
            'enableTestMode', 'get', 'getIntrospection', 'register',
        ]);
    });

    it('requires test mode before registration', () => {
        assert.throws(() => new Container().register('App_Value$', {}), /test mode is disabled/);
    });

    it('resolves an explicit substitution asynchronously without a module route', async () => {
        const container = new Container();
        container.enableTestMode();
        const mock = {kind: 'test-only'};
        container.register('App_Value$', mock);
        const pending = container.get('App_Value$');
        assert.ok(pending instanceof Promise);
        assert.strictEqual(await pending, mock);
        assert.ok(Object.isFrozen(mock));
    });

    it('locks test setup synchronously when preparation starts', async () => {
        const container = new Container();
        container.enableTestMode();
        container.register('App_Value$', {});
        const pending = container.get('App_Value$');
        assert.throws(() => container.enableTestMode(), /locked/);
        assert.throws(() => container.register('App_Value$', {}), /locked/);
        await pending;
    });

    it('reuses a substituted Singleton in later sequential entries', async () => {
        const container = new Container();
        container.enableTestMode();
        container.register('App_Value$', {});
        assert.strictEqual(await container.get('App_Value$'), await container.get('App_Value$'));
    });

    it('retains Running after a parsing failure', async () => {
        const container = new Container();
        container.enableTestMode();
        container.register('App_Value$', {ok: true});
        await assert.rejects(container.get('teq:App_Value$'));
        assert.deepEqual(await container.get('App_Value$'), {ok: true});
    });

    it('retains independent completed entry observations', async () => {
        const container = new Container({introspection: true});
        container.enableTestMode();
        container.register('App_Value$', {});
        await container.get('App_Value$');
        await container.get('App_Value$');
        const observation = /** @type {any} */ (container.getIntrospection());
        assert.equal(observation.entries.length, 2);
        assert.equal(observation.entries[1].explanation.resolutions[0].cache, 'hit');
    });
});
