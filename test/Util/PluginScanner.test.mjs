import assert from 'assert';
import PluginScanner from '../../src/Util/PluginScanner.mjs';
import {describe, it} from 'mocha';
import {join, dirname} from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '../.data/PluginScanner');

describe('TeqFw_Di_Util_PluginScanner', () => {

    it('can be created', async () => {
        const scanner = new PluginScanner();
        assert(scanner instanceof PluginScanner);
    });

    it('allows to scan folders for descriptors', async () => {
        const scanner = new PluginScanner();
        const path = join(root, 'd01.scan');
        const descriptors = await scanner.scanDescriptors(path);
        assert(Object.keys(descriptors).length === 3);
    });

    it('allows to scan folders w/o descriptors', async () => {
        const scanner = new PluginScanner();
        const path = join(root, 'd02.empty');
        const descriptors = await scanner.scanDescriptors(path);
        assert(Object.keys(descriptors).length === 0);
    });

    it('throws error for wrong descriptors', async () => {
        const scanner = new PluginScanner();
        const path = join(root, 'd03.error');
        try {
            await scanner.scanDescriptors(path);
        } catch (e) {
            assert.strictEqual(e.message, 'Unexpected token W in JSON at position 0');
        }

    });

});
