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
                'enableTestMode',
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

        it('does not contain itself inside', async () => {
            const container = new Container();
            await assert.rejects(
                async () => {
                    await container.get('container');
                },
                {
                    code: 'ERR_MODULE_NOT_FOUND',
                    message: /^Cannot find package 'container'/
                }
            );
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

    describe('register()', () => {

        it('registers a new singleton successfully when test mode is enabled', async () => {
            const container = new Container();
            container.enableTestMode();
            const obj = {hello: 'world'};
            container.register('My_Test_Module$', obj);
            const instance = await container.get('My_Test_Module$');
            assert.strictEqual(instance, obj);
        });

        it('throws if already registered, even in test mode', async () => {
            const container = new Container();
            container.enableTestMode();
            const obj = {hello: 'again'};
            container.register('My_Test_Module$', obj);
            assert.throws(() => {
                container.register('My_Test_Module$', {oops: true});
            }, /already registered/);
        });

        it('throws if test mode is not enabled', () => {
            const container = new Container();
            const obj = {unauthorized: true};
            assert.throws(() => {
                container.register('My_Test_Module$', obj);
            }, /Use enableTestMode\(\) to allow it/);
        });

        it('throws if depId is missing (in test mode)', () => {
            const container = new Container();
            container.enableTestMode();
            assert.throws(() => {
                container.register(undefined, {});
            }, /required/);
        });

        it('throws if object is missing (in test mode)', () => {
            const container = new Container();
            container.enableTestMode();
            assert.throws(() => {
                container.register('My_Missing_Obj$', null);
            }, /required/);
        });

        it('throws if trying to register a non-singleton (in test mode)', () => {
            const container = new Container();
            container.enableTestMode();
            assert.throws(() => {
                container.register('My_Test_Module$$', {notAllowed: true});
            }, /Only node modules & singletons can be registered/);
        });

    });


});
