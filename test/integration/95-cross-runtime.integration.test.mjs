import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import test from 'node:test';

import TeqFw_Di_Container from '../../src/Container.mjs';

const FIXTURE_DIR = pathToFileURL(path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture') + path.sep).href;

test('Integration 95: cross-runtime resolution contract', async () => {
    const sharedState = /** @type {any} */ (globalThis);
    sharedState.__teqfwDiCrossRuntime = {queue: []};
    const container = new TeqFw_Di_Container({
        introspection: true,
        namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}],
        preprocessors: ['Fx_CrossRuntimePolicy__Alias$'],
        postprocessors: ['Fx_CrossRuntimePolicy__Adapt$'],
    });

    const root = /** @type {any} */ (await container.get('Fx_CrossRuntimeRoot$'));
    const observation = /** @type {any} */ (container.getIntrospection());

    assert.ok(Object.isFrozen(root));
    assert.ok(Object.isFrozen(root.deferred));
    assert.notStrictEqual(root.directA, root.directB);
    assert.ok(root.directA.adapted && Object.isFrozen(root.directA));
    assert.strictEqual(root.singletonA, root.singletonB);
    assert.ok(root.singletonA.wrapped);
    assert.notStrictEqual(root.transientA, root.transientB);
    assert.equal(root.alias.kind, 'singleton');
    assert.ok(root.alias.adapted && Object.isFrozen(root.alias));
    assert.equal(/** @type {any[]} */ (observation.explanation.resolutions).find((one) => one.requested.address === 'Fx_CrossRuntimeAlias').effective.address, 'Fx_CrossRuntimeSingleton');

    const providerRequest = root.deferred.resolve();
    const queuedGetRequest = container.get('Fx_CrossRuntimeLater$');
    const [provided, queuedGet] = await Promise.all([providerRequest, queuedGetRequest]);
    const providedAgain = await root.deferred.resolve();

    assert.strictEqual(provided, providedAgain);
    assert.ok(provided.adapted && Object.isFrozen(provided));
    assert.ok(queuedGet.adapted && Object.isFrozen(queuedGet));
    assert.deepEqual(sharedState.__teqfwDiCrossRuntime.queue, ['provider', 'get']);
});
