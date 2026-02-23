import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

import TeqFw_Di_Container from '../../src2/Container.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURE_DIR = path.resolve(__dirname, './fixture');

describe('Integration 20: namespace resolution', () => {
    it('uses longest matching namespace prefix for overlapping prefixes', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', path.join(FIXTURE_DIR, 'ns-short'), '.mjs');
        container.addNamespaceRoot('Fx_Long_', path.join(FIXTURE_DIR, 'ns-long'), '.mjs');

        const value = await container.get('Fx_Long_Service');

        assert.equal(value.value, 'long-service');
    });
});
