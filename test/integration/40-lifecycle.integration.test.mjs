import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

import TeqFw_Di_Container from '../../src/Container.mjs';
import {getProducerCalls} from './fixture/ObservedSingleton.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURE_DIR = path.resolve(__dirname, './fixture');

describe('Integration 40: lifecycle', () => {
    it('returns same identity for singleton factory', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');

        const first = await container.get('Fx_Singleton$');
        const second = await container.get('Fx_Singleton$');

        assert.strictEqual(first, second);
    });

    it('returns different identity for transient factory', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');

        const first = await container.get('Fx_Transient$$');
        const second = await container.get('Fx_Transient$$');

        assert.notStrictEqual(first, second);
    });

    it('fails linking when default shallow hardening fails', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        container.enableIntrospection();

        await assert.rejects(container.get('Fx_ProtectedProxy$'), /defineProperty is forbidden/);
        const observation = /** @type {any} */ (container.getIntrospection());

        assert.equal(observation.explanation.failure.stage, 'hardening');
        assert.equal(observation.explanation.containerState, 'failed');
        await assert.rejects(container.get('Fx_ProtectedProxy$'), /failed state/);
    });

    it('uses a configured hardener as the full host policy', async () => {
        const container = new TeqFw_Di_Container();
        container.enableIntrospection();
        /** @type {unknown} */
        let received;
        container.setHardener((value) => {
            received = value;
            return value;
        });

        const namespace = await container.get('node:fs');
        const observation = /** @type {any} */ (container.getIntrospection());

        assert.strictEqual(received, namespace);
        assert.equal(Object.prototype.toString.call(namespace), '[object Module]');
        assert.equal(observation.explanation.resolutions[0].hardening.mode, 'configured');
    });

    it('keeps singleton identities separate for default and named exports from same module', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');

        const defaultFirst = await container.get('Fx_SharedExports$');
        const factoryFirst = await container.get('Fx_SharedExports__Factory$');
        const defaultSecond = await container.get('Fx_SharedExports$');
        const factorySecond = await container.get('Fx_SharedExports__Factory$');

        assert.equal(defaultFirst.kind, 'default');
        assert.equal(factoryFirst.kind, 'factory');
        assert.strictEqual(defaultFirst, defaultSecond);
        assert.strictEqual(factoryFirst, factorySecond);
        assert.notStrictEqual(defaultFirst, factoryFirst);
    });

    it('applies preprocess and postprocess in registration order', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        container.addPreprocess((depId, _context) => ({...depId, moduleName: depId.moduleName.replace('Singleton', 'Transient')}));
        container.addPostprocess((value, _context) => {
            /** @type {{steps?: string[]}} */
            const post1 = /** @type {{steps?: string[]}} */ (value);
            return {...post1, steps: [...(post1.steps ?? []), 'post1']};
        });
        container.addPostprocess((value, _context) => {
            /** @type {{steps: string[]}} */
            const post2 = /** @type {{steps: string[]}} */ (value);
            return {...post2, steps: [...post2.steps, 'post2']};
        });

        const value = await container.get('Fx_Singleton$');

        assert.deepStrictEqual(value.steps, ['post1', 'post2']);
    });

    it('caches the final singleton value after postprocessing, wrapping, and hardening', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        const producerBefore = getProducerCalls();
        let postprocessCalls = 0;
        let hardeningCalls = 0;
        container.addPostprocess((value) => {
            postprocessCalls += 1;
            const observed = /** @type {{producerCalls: number, steps: string[]}} */ (value);
            return {...observed, steps: [...observed.steps, 'postprocessor']};
        });
        container.setHardener((value) => {
            hardeningCalls += 1;
            return Object.freeze(/** @type {object} */ (value));
        });

        const first = await container.get('Fx_ObservedSingleton$_wrapTag');
        const second = await container.get('Fx_ObservedSingleton$_wrapTag');

        assert.strictEqual(first, second);
        assert.equal(getProducerCalls(), producerBefore + 1);
        assert.deepStrictEqual(first.steps, ['producer', 'postprocessor', 'wrapper']);
        assert.equal(postprocessCalls, 1);
        assert.equal(hardeningCalls, 1);
        assert.ok(Object.isFrozen(first));
    });

    it('uses effective substituted identity before Singleton lookup', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        const producerBefore = getProducerCalls();
        container.addPreprocess((depId) => ({
            ...depId,
            moduleName: depId.moduleName.startsWith('Fx_Alias')
                ? 'Fx_ObservedSingleton'
                : depId.moduleName,
        }));

        const first = await container.get('Fx_AliasOne$_wrapTag');
        const second = await container.get('Fx_AliasTwo$_wrapTag');

        assert.strictEqual(first, second);
        assert.equal(getProducerCalls(), producerBefore + 1);
    });

    it('converges independent concurrent Singleton requests on one pending value', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        const producerBefore = getProducerCalls();

        const [first, second] = await Promise.all([
            container.get('Fx_ObservedSingleton$'),
            container.get('Fx_ObservedSingleton$'),
        ]);

        assert.strictEqual(first, second);
        assert.equal(getProducerCalls(), producerBefore + 1);
    });
});
