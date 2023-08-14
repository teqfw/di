import assert from 'assert';
import Container from '../src/Container.js';
import {describe, it} from 'mocha';
import {dirname, join} from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '_data', 'Container', 'src');

describe('TeqFw_Di_Shared_Container', function () {

    describe('basic tests', function () {
        it('has right classname', async () => {
            const container = new Container();
            assert.strictEqual(container.constructor.name, 'TeqFw_Di_Container');
        });

        it('has all expected public methods', async () => {
            const container = new Container();
            const methods = Object.getOwnPropertyNames(container)
                .filter(p => (typeof container[p] === 'function'));
            assert.deepStrictEqual(methods.sort(), [
                'get',
            ]);
        });

        it('contains itself inside', async () => {
            const container = new Container();
            const namedSingleton = await container.get('__container');
            assert.strictEqual(namedSingleton, container);
        });
    });

    describe('creates objects', function () {

        it('named export singleton (App_Service.default$FS)', async () => {
            const container = new Container();
            const resolver = container.getResolver();
            resolver.addNamespaceRoot('App_', ROOT, 'js');
            const dep = await container.get('App_Service.default$FS');
            assert(dep);
            dep({boobs: 'big'});
        });

    });

});
