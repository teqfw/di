import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

import TeqFw_Di_Container from '../../src2/Container.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURE_DIR = path.resolve(__dirname, './fixture');

describe('Integration 90: failed state', () => {
    it('enters failed state after fatal error and rejects subsequent get/config calls', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');

        await assert.rejects(() => container.get('Fx_BadExport$'), /Export 'default' is not found/);
        await assert.rejects(() => container.get('Fx_Root$'), /failed state/i);

        assert.throws(() => container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs'));
        assert.throws(() => container.enableLogging());
        assert.throws(() => container.enableTestMode());
        assert.throws(() => container.addPreprocess((depId) => depId));
        assert.throws(() => container.addPostprocess((value) => value));
        assert.throws(() => container.register('Fx_Root$', {mock: true}));
    });
});
