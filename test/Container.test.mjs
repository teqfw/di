import {dirname, join} from 'node:path';
import assert from 'node:assert';
import {describe, it} from 'mocha';
import Container from '../src/Container.js';
import Defs from '../src/Defs.js';

const __dirname = dirname(import.meta.url);
const ROOT = join(__dirname, '_data', 'Container');

describe('TeqFw_Di_Container', () => {

    describe('basic tests', () => {
        it('has right classname', async () => {
            const container = new Container();
            assert.strictEqual(container.constructor.name, 'TeqFw_Di_Container');
        });

        it('has all expected public methods', async () => {
            const container = new Container();
            const methods = Object.getOwnPropertyNames(container)
                .filter(p => (typeof container[p] === 'function'));
            assert.deepStrictEqual(methods.sort(), [
                'compose',
                'get',
                'getParser',
                'getPostProcessor',
                'getPreProcessor',
                'getResolver',
                'register',
                'setDebug',
                'setParser',
                'setPostProcessor',
                'setPreProcessor',
                'setResolver',
            ]);
        });

        it('contains itself inside', async () => {
            const container = new Container();
            const namedSingleton = await container.get(Defs.ID);
            assert.strictEqual(namedSingleton, container);
        });
    });

    describe('creates objects', () => {

        it('default export singleton (App_Service$)', async () => {
            const container = new Container();
            container.setDebug(true);
            const resolver = container.getResolver();
            const src = join(ROOT, 'classes');
            resolver.addNamespaceRoot('App_', src, 'js');
            const dep = await container.get('App_Service$');
            assert(dep);
            assert(Object.isFrozen(dep));
            dep({boobs: 'big'});
        });

    });

    describe('prevents loops', () => {

        it('simple loop', async () => {
            const container = new Container();
            container.setDebug(true);
            const resolver = container.getResolver();
            const src = join(ROOT, 'loop');
            resolver.addNamespaceRoot('App_', src, 'js');
            try {
                await container.get('App_Service$');
            } catch (e) {
                assert(e);
            }
        });

    });

});
