import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

import TeqFw_Di_Container from '@teqfw/di';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURE_DIR = path.resolve(__dirname, './fixture');

describe('Integration 20: namespace mapping', () => {
    it('uses longest matching namespace prefix for overlapping prefixes', async () => {
        const container = new TeqFw_Di_Container({namespaces: [{prefix: 'Fx_', target: path.join(FIXTURE_DIR, 'ns-short'), defaultExt: '.mjs'}, {prefix: 'Fx_Long_', target: path.join(FIXTURE_DIR, 'ns-long'), defaultExt: '.mjs'}]});

        const value = await container.get('Fx_Long_Service');

        assert.equal(value.value, 'long-service');
    });
});
