import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

import TeqFw_Di_Container from '../../src/Container.mjs';
import TeqFw_Di_Def_Parser from '../../src/Def/Parser.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURE_DIR = path.resolve(__dirname, './fixture');

describe('Integration 10: builder config locking', () => {
    it('locks all builder methods after first get', async () => {
        const container = new TeqFw_Di_Container();
        container.setParser(new TeqFw_Di_Def_Parser());
        container.addPreprocess((depId) => depId);
        container.addPostprocess((value) => value);
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        container.enableTestMode();

        await container.get('Fx_Root$');

        assert.throws(() => container.setParser(new TeqFw_Di_Def_Parser()));
        assert.throws(() => container.addPreprocess((depId) => depId));
        assert.throws(() => container.addPostprocess((value) => value));
        assert.throws(() => container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs'));
        assert.throws(() => container.enableLogging());
        assert.throws(() => container.enableTestMode());
        assert.throws(() => container.register('Fx_Root$', {mock: true}));
    });
});
