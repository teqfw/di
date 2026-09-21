import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

import TeqFw_Di_Container from '@teqfw/di';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURE_DIR = path.resolve(__dirname, './fixture');

describe('Integration 50: wrappers', () => {
    it('applies wrappers in declared order', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');

        const value = await container.get('Fx_Wrapped$$_wrapFirst_wrapSecond');

        assert.deepEqual(value.steps, ['core', 'wrapFirst', 'wrapSecond']);
    });

    it('rejects a Promise-returning Wrapper (Wrapper must be synchronous)', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');

        await assert.rejects(
            () => container.get('Fx_Wrapped$$_wrapThenable'),
            /must return synchronously \(non-Promise\)/
        );
    });

    it('keeps ordered Wrapper Selection in Singleton identity inside one graph', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');

        const root = await container.get('Fx_GraphLifestyle$');
        const first = root.wrappedA;
        const repeated = root.wrappedB;
        const reversed = root.wrappedC;

        assert.deepEqual(first.steps, ['core', 'wrapFirst', 'wrapSecond']);
        assert.deepEqual(reversed.steps, ['core', 'wrapSecond', 'wrapFirst']);
        assert.strictEqual(first, repeated);
        assert.notStrictEqual(first, reversed);
    });
});
