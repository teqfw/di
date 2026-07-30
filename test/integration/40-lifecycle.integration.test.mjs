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

    it('fails linking when default shallow hardening fails', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');

        await assert.rejects(container.get('Fx_ProtectedProxy$'));
        await assert.rejects(container.get('Fx_ProtectedProxy$'), /failed state/);
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
        container.addPreprocess((depId) => ({...depId, moduleName: depId.moduleName.replace('Singleton', 'Transient')}));
        container.addPostprocess((value) => ({...value, steps: [...(value.steps ?? []), 'post1']}));
        container.addPostprocess((value) => ({...value, steps: [...value.steps, 'post2']}));

        const value = await container.get('Fx_Singleton$');

        assert.deepStrictEqual(value.steps, ['post1', 'post2']);
    });
});
