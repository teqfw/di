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
});
