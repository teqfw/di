import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

import TeqFw_Di_Container from '../../src2/Container.mjs';

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
});
