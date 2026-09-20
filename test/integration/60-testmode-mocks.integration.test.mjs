import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

import TeqFw_Di_Container from '../../src/Container.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURE_DIR = path.resolve(__dirname, './fixture');

describe('Integration 60: test mode and mocks', () => {
    it('throws on register when test mode is disabled', () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');

        assert.throws(() => container.register('Fx_Root$', {mock: true}), /test mode is disabled/);
    });

    it('sends a substituted value through postprocessing, wrappers, hardening, and Singleton reuse', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        container.enableTestMode();
        const mock = {steps: ['mock']};
        let postprocessCalls = 0;
        let hardeningCalls = 0;
        container.register('Fx_Wrapped$_wrapFirst', mock);
        container.addPostprocess((value) => {
            postprocessCalls += 1;
            const observed = /** @type {{steps: string[]}} */ (value);
            return {steps: [...observed.steps, 'postprocessor']};
        });
        container.setHardener((value) => {
            hardeningCalls += 1;
            return Object.freeze(/** @type {object} */ (value));
        });

        const first = await container.get('Fx_Wrapped$_wrapFirst');
        const second = await container.get('Fx_Wrapped$_wrapFirst');

        assert.deepEqual(first.steps, ['mock', 'postprocessor', 'wrapFirst']);
        assert.strictEqual(first, second);
        assert.equal(Object.isFrozen(first), true);
        assert.equal(postprocessCalls, 1);
        assert.equal(hardeningCalls, 1);
    });

    it('uses the effective mock registered after preprocessing', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        container.enableTestMode();
        const mock = {source: 'effective-mock'};
        container.register('Fx_Root$', mock);
        container.addPreprocess((depId) => ({
            ...depId,
            moduleName: depId.moduleName === 'Fx_AliasForMock'
                ? 'Fx_Root'
                : depId.moduleName,
        }));

        const value = await container.get('Fx_AliasForMock$');

        assert.strictEqual(value, mock);
        assert.equal(Object.isFrozen(value), true);
    });

    it('substitutes an unresolved address without module loading and preserves the common output corridor', async () => {
        const container = new TeqFw_Di_Container();
        container.enableIntrospection();
        container.enableTestMode();
        const mock = {steps: ['mock']};
        let postprocessCalls = 0;
        let hardeningCalls = 0;
        container.register('NoRoute_Unresolvable$', mock);
        container.addPostprocess((value) => {
            postprocessCalls += 1;
            const observed = /** @type {{steps: string[]}} */ (value);
            return {steps: [...observed.steps, 'postprocessor']};
        });
        container.setHardener((value) => {
            hardeningCalls += 1;
            return Object.freeze(/** @type {object} */ (value));
        });

        const first = await container.get('NoRoute_Unresolvable$');
        const second = await container.get('NoRoute_Unresolvable$');
        const observation = /** @type {any} */ (container.getIntrospection());

        assert.deepEqual(first.steps, ['mock', 'postprocessor']);
        assert.strictEqual(first, second);
        assert.equal(postprocessCalls, 1);
        assert.equal(hardeningCalls, 1);
        assert.equal(observation.explanation.resolutions[0].cache, 'hit');
        assert.equal(observation.trace.some((/** @type {any} */ event) => event.kind === 'route'), false);
    });
});
