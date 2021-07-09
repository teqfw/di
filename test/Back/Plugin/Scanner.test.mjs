import assert from 'assert';
import {describe, it} from 'mocha';
import {join, dirname} from 'path';
import {fileURLToPath} from 'url';
import Container from '../../../src/Shared/Container.mjs';

// compose paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PRJ_ROOT = join(__dirname, '../../../');
const root = join(PRJ_ROOT, './test/.data/Back/Plugin/Scanner');

// setup DI
const container = new Container();
container.addSourceMapping('TeqFw_Di', join(PRJ_ROOT, 'src'), true, 'mjs');

/** @type {typeof TeqFw_Di_Back_Plugin_Scanner} */
const PluginScanner = await container.get('TeqFw_Di_Back_Plugin_Scanner#');

describe('TeqFw_Di_Back_Plugin_Scanner', () => {

    it('can be created', async () => {
        const scanner = await container.get('TeqFw_Di_Back_Plugin_Scanner$$');
        assert(scanner instanceof PluginScanner);
    });

    it('has all expected public methods', async () => {
        const scanner = await container.get('TeqFw_Di_Back_Plugin_Scanner$$');
        const methodsOwn = Object.getOwnPropertyNames(scanner)
            .filter(p => (typeof scanner[p] === 'function'));
        const methodsProto = Object.getOwnPropertyNames(scanner.__proto__)
            .filter(p => (typeof scanner[p] === 'function'));
        const methods = [...methodsOwn, ...methodsProto];
        assert.deepStrictEqual(methods.sort(), [
            'constructor',
            'getDescriptors',
            'getNamespaces',
            'scanFilesystem',
        ]);
    });

    describe('scans descriptors', () => {

        it('normally', async () => {
            const scanner = await container.get('TeqFw_Di_Back_Plugin_Scanner$$');
            const path = join(root, 'd01.scan');
            const descriptors = await scanner.scanFilesystem(path);
            assert(Object.keys(descriptors).length === 3);
        });

        it('in folders w/o descriptors', async () => {
            const scanner = await container.get('TeqFw_Di_Back_Plugin_Scanner$$');
            const path = join(root, 'd02.empty');
            const descriptors = await scanner.scanFilesystem(path);
            assert(Object.keys(descriptors).length === 0);
        });

        it('and throws error for wrong descriptors', async () => {
            const scanner = await container.get('TeqFw_Di_Back_Plugin_Scanner$$');
            const path = join(root, 'd03.error');
            try {
                await scanner.scanFilesystem(path);
            } catch (e) {
                assert.strictEqual(e.message, 'Unexpected token W in JSON at position 0');
            }

        });

    });

    describe('scans namespaces', () => {
        it('normally', async () => {
            const scanner = await container.get('TeqFw_Di_Back_Plugin_Scanner$$');
            const path = join(root, 'd10.ns.data');
            const namespaces = await scanner.getNamespaces(path);
            assert(Object.keys(namespaces).length === 3);
        });
    });

    describe('scans plugins for DI descriptors', () => {
        it('normally', async () => {
            const scanner = await container.get('TeqFw_Di_Back_Plugin_Scanner$$');
            const path = join(root, 'd20.desc.data');
            const descriptors = await scanner.getDescriptors(path);
            assert(Object.keys(descriptors).length === 1);
            const [first] = descriptors;
            assert(Array.isArray(first.replace) && first.replace.length === 1);
        });
    });

});
