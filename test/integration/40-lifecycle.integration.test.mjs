import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

import TeqFw_Di_Container from '../../src/Container.mjs';

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

    it('keeps proxy-wrapped singleton even when freeze cannot define properties', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');

        const first = await container.get('Fx_ProtectedProxy$');
        const second = await container.get('Fx_ProtectedProxy$');

        assert.strictEqual(first.kind, 'protected-proxy');
        assert.strictEqual(first, second);
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
});
