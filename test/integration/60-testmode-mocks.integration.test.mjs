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

    it('returns frozen mock and bypasses resolver/lifecycle pipeline', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        container.enableTestMode();

        const mock = {source: 'mock'};
        container.register('Fx_NotExistingModule$$', mock);

        const first = await container.get('Fx_NotExistingModule$$');
        const second = await container.get('Fx_NotExistingModule$$');

        assert.strictEqual(first, mock);
        assert.strictEqual(first, second);
        assert.equal(Object.isFrozen(first), true);
    });
});
