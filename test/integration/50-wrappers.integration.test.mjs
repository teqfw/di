import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

import TeqFw_Di_Container from '../../src/Container.mjs';

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

    it('rejects Promise wrapper return (wrapper must be synchronous)', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');

        await assert.rejects(
            () => container.get('Fx_Wrapped$$_wrapThenable'),
            /must return synchronously \(non-Promise\)/
        );
    });
});
