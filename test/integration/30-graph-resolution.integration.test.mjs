import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

import TeqFw_Di_Container from '@teqfw/di';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURE_DIR = path.resolve(__dirname, './fixture');

describe('Integration 30: graph resolution', () => {
    it('injects a nested __deps__ graph into producers', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');

        const value = await container.get('Fx_GraphRoot$$');

        assert.equal(value.name, 'graph-root');
        assert.equal(value.child.name, 'child');
        assert.equal(value.child.leaf.value, 'leaf-value');
        assert.equal(Object.isFrozen(value), true);
    });

    it('rejects cyclic dependency graph', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');

        await assert.rejects(() => container.get('Fx_CycleA$$'), /Cyclic dependency detected/);
    });

    it('rejects a recursive Singleton cycle', async () => {
        const container = new TeqFw_Di_Container({introspection: true});
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');

        await assert.rejects(() => container.get('Fx_SingletonCycleA$'), /Cyclic dependency detected/);
        const observation = /** @type {any} */ (container.getIntrospection());

        assert.equal(observation.explanation.failure.stage, 'cycle detection');
        assert.equal(observation.explanation.containerState, 'Running');
        assert.deepEqual(await container.get('Fx_Root$'), {name: 'root'});
    });

    it('isolates a deeper recursive Singleton cycle from a later entry', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');

        await assert.rejects(() => container.get('Fx_SingletonCycleDeepA$'), /Cyclic dependency detected/);
        assert.deepEqual(await container.get('Fx_Root$'), {name: 'root'});
    });

    it('injects a canonical mock for a transitive dependency', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        container.enableTestMode();
        const mock = {value: 'mocked-leaf'};
        container.register('Fx_Leaf', mock);

        const value = await container.get('Fx_GraphRoot$$');

        assert.strictEqual(value.child.leaf, mock);
        assert.equal(Object.isFrozen(mock), true);
    });
});
