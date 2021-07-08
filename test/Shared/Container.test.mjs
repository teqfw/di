import assert from 'assert';
import Container from '../../src/Shared/Container.mjs';
import {describe, it} from 'mocha';
import {dirname, join} from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_ROOT = join(__dirname, '../.data');

describe('TeqFw_Di_Shared_Container', function () {

    it('has right classname', async () => {
        const container = new Container();
        assert.strictEqual(container.constructor.name, 'TeqFw_Di_Shared_Container');
    });

    it('has all expected public methods', async () => {
        const container = new Container();
        const methods = Object.getOwnPropertyNames(container)
            .filter(p => (typeof container[p] === 'function'));
        assert.deepStrictEqual(methods.sort(), [
            'addSourceMapping',
            'delete',
            'get',
            'getNsResolver',
            'has',
            'list',
            'set',
        ]);
    });

    it('contains itself inside', async () => {
        const container = new Container();
        const exportSingleton = await container.get('TeqFw_Di_Shared_Container$');
        assert.strictEqual(exportSingleton, container);
        const namedSingleton = await container.get('container');
        assert.strictEqual(namedSingleton, container);
    });

    describe('allows to add mapping:', () => {
        const container = new Container();

        it('for logical namespaces', async () => {
            container.addSourceMapping('Ns_App', 'path/to/package');
            const path = container.getNsResolver().resolveModuleId('Ns_App_Sub_Module');
            assert.strictEqual(path, './path/to/package/Sub/Module.mjs');
        });

        it('for simple filepath based namespaces', async () => {
            container.addSourceMapping('package', 'path/to/package');
            const path = container.getNsResolver().resolveModuleId('package!sub/module');
            assert.strictEqual(path, 'path/to/package/sub/module.mjs');
        });

        it('for complex filepath based namespaces', async () => {
            container.addSourceMapping('@vendor/package', 'path/to/package');
            const path = container.getNsResolver().resolveModuleId('@vendor/package!sub/module');
            assert.strictEqual(path, 'path/to/package/sub/module.mjs');
        });
    });

    describe('allows to inspect itself:', () => {
        const container = new Container();

        it('access to modules loader', async () => {
            const resolver = container.getNsResolver();
            assert.strictEqual(resolver.constructor.name, 'TeqFw_Di_Shared_Resolver');
        });

        it('lists contained instances and loaded modules', async () => {
            const obj = {name: 'one object for all deps'};
            container.set('namedSingleton', obj);
            container.set('namedFactory$$', obj);
            const {singletons, constructors} = container.list();
            assert(constructors.includes('namedFactory'));
            assert(singletons.includes('namedSingleton'));
        });
    });

    describe('allows to delete:', () => {
        const container = new Container();

        it('named singleton from container', async () => {
            const depId = 'namedSingleton';
            const obj = {name: 'named singleton'};
            container.set(depId, obj);
            assert(container.has(depId));
            container.delete(depId);
            assert(!container.has(depId));
        });

        it('named factory from container', async () => {
            const depId = 'namedFactory$$';
            const obj = {name: 'named factory'};
            container.set(depId, obj);
            assert(container.has(depId));
            container.delete(depId);
            assert(!container.has(depId));
        });

        it('default export factory from container', async () => {
            const depId = 'Vendor_Module$$';
            const construct = {name: 'default export factory'};
            container.set(depId, construct);
            assert(container.has(depId));
            container.delete(depId);
            assert(!container.has(depId));
        });

        it('default export singleton from container', async () => {
            const depId = 'Vendor_Module$$';
            const construct = {name: 'default export singleton'};
            container.set(depId, construct);
            assert(container.has(depId));
            container.delete(depId);
            assert(!container.has(depId));
        });
    });

    describe('allows to place:', () => {

        describe('manual DI IDs:', () => {
            it('singleton (namedSingleton)', async () => {
                const container = new Container();
                const id = 'namedSingleton';
                const depIn = {name: 'named singleton'};
                container.set(id, depIn);
                const depOut = await container.get(id);
                assert(depOut === depIn); // is the same object
            });

            it('factory (namedFactory$$)', async () => {
                const container = new Container();
                const id = 'namedFactory$$';
                const fnConstruct = function () {
                    return {name: 'new object'};
                };
                container.set(id, fnConstruct);
                const dep1 = await container.get(id);
                const dep2 = await container.get(id);
                assert(dep1 !== dep2);  // is not the same object
                assert.deepStrictEqual(dep1, dep2); // but both objects are equals
            });
        });

        describe('filepath based IDs:', () => {

            describe('singletons:', () => {

                it('default export singleton (@vendor/package!module$)', async () => {
                    const container = new Container();
                    const id = '@vendor/package!module$';
                    const singleton = function () {
                        return {name: 'new object from other object'};
                    };
                    container.set(id, singleton);
                    const dep1 = await container.get(id);
                    const dep2 = await container.get(id);
                    assert(dep1 === dep2);
                });

                it('named export singleton (@vendor/package!module#export$)', async () => {
                    const container = new Container();
                    const id = '@vendor/package!module#export$';
                    const singleton = function () {
                        return {name: 'new object from other object'};
                    };
                    container.set(id, singleton);
                    const dep1 = await container.get(id);
                    const dep2 = await container.get(id);
                    assert(dep1 === dep2);
                });

            });

            describe('factories:', () => {

                describe('default export:', () => {

                    it('object (@vendor/package!module$$)', async () => {
                        const container = new Container();
                        const id = '@vendor/package!module$$';
                        const factory = {name: 'primary object'};
                        container.set(id, factory);
                        const dep1 = await container.get(id);
                        const dep2 = await container.get(id);
                        assert(dep1 !== dep2);  // is not the same object
                        assert.deepStrictEqual(dep1, dep2); // but both objects are equals
                    });

                    it('function (@vendor/package!module$$)', async () => {
                        const container = new Container();
                        const id = '@vendor/package!module$$';
                        const factory = function () {
                            return {name: 'primary object'};
                        };
                        container.set(id, factory);
                        const dep1 = await container.get(id);
                        const dep2 = await container.get(id);
                        assert(dep1 !== dep2);  // is not the same object
                        assert.deepStrictEqual(dep1, dep2); // but both objects are equals
                        assert.deepStrictEqual(dep1, {name: 'primary object'}); // equals to primary
                    });

                    it('class (@vendor/package!module$$)', async () => {
                        const container = new Container();
                        const id = '@vendor/package!module$$';
                        const factory = class Primary {
                            name = 'primary object'
                        };
                        container.set(id, factory);
                        const dep1 = await container.get(id);
                        const dep2 = await container.get(id);
                        assert(dep1 !== dep2);  // is not the same object
                        assert.deepStrictEqual(dep1, dep2); // but both objects are equals
                        assert.deepStrictEqual(dep1, new factory()); // equals to primary
                    });

                });

                describe('named export:', () => {

                    it('object (@vendor/package!module#export$$)', async () => {
                        const container = new Container();
                        const id = '@vendor/package!module#export$$';
                        const factory = {name: 'primary object'};
                        container.set(id, factory);
                        const dep1 = await container.get(id);
                        const dep2 = await container.get(id);
                        assert(dep1 !== dep2);  // is not the same object
                        assert.deepStrictEqual(dep1, dep2); // but both objects are equals
                    });

                    it('function (@vendor/package!module#export$$)', async () => {
                        const container = new Container();
                        const id = '@vendor/package!module#export$$';
                        const factory = function () {
                            return {name: 'primary object'};
                        };
                        container.set(id, factory);
                        const dep1 = await container.get(id);
                        const dep2 = await container.get(id);
                        assert(dep1 !== dep2);  // is not the same object
                        assert.deepStrictEqual(dep1, dep2); // but both objects are equals
                        assert.deepStrictEqual(dep1, {name: 'primary object'}); // equals to primary
                    });

                    it('class (@vendor/package!module#export$$)', async () => {
                        const container = new Container();
                        const id = '@vendor/package!module#export$$';
                        const factory = class Primary {
                            name = 'primary object'
                        };
                        container.set(id, factory);
                        const dep1 = await container.get(id);
                        const dep2 = await container.get(id);
                        assert(dep1 !== dep2);  // is not the same object
                        assert.deepStrictEqual(dep1, dep2); // but both objects are equals
                        assert.deepStrictEqual(dep1, new factory()); // equals to primary
                    });

                });

            });

        });

        describe('logical namespaces IDs:', () => {

            describe('singletons:', () => {

                it('default export singleton (Ns_App_Mod$)', async () => {
                    const container = new Container();
                    const id = 'Ns_App_Mod$';
                    const singleton = function () {
                        return {name: 'new object from other object'};
                    };
                    container.set(id, singleton);
                    const dep1 = await container.get(id);
                    const dep2 = await container.get(id);
                    assert(dep1 === dep2);
                });

                it('named export singleton (Ns_App_Mod#export$)', async () => {
                    const container = new Container();
                    const id = 'Ns_App_Mod#export$';
                    const singleton = function () {
                        return {name: 'new object from other object'};
                    };
                    container.set(id, singleton);
                    const dep1 = await container.get(id);
                    const dep2 = await container.get(id);
                    assert(dep1 === dep2);
                });

            });

            describe('factories:', () => {

                describe('default export:', () => {

                    it('object (Ns_App_Mod$$)', async () => {
                        const container = new Container();
                        const id = 'Ns_App_Mod$$';
                        const factory = {name: 'primary object'};
                        container.set(id, factory);
                        const dep1 = await container.get(id);
                        const dep2 = await container.get(id);
                        assert(dep1 !== dep2);  // is not the same object
                        assert.deepStrictEqual(dep1, dep2); // but both objects are equals
                    });


                    it('function (Ns_App_Mod$$)', async () => {
                        const container = new Container();
                        const id = 'Ns_App_Mod$$';
                        const factory = function () {
                            return {name: 'primary object'};
                        };
                        container.set(id, factory);
                        const dep1 = await container.get(id);
                        const dep2 = await container.get(id);
                        assert(dep1 !== dep2);  // is not the same object
                        assert.deepStrictEqual(dep1, dep2); // but both objects are equals
                        assert.deepStrictEqual(dep1, {name: 'primary object'}); // equals to primary
                    });

                    it('class (Ns_App_Mod$$)', async () => {
                        const container = new Container();
                        const id = 'Ns_App_Mod$$';
                        const factory = class Primary {
                            name = 'primary object'
                        };
                        container.set(id, factory);
                        const dep1 = await container.get(id);
                        const dep2 = await container.get(id);
                        assert(dep1 !== dep2);  // is not the same object
                        assert.deepStrictEqual(dep1, dep2); // but both objects are equals
                        assert.deepStrictEqual(dep1, new factory()); // equals to primary
                    });
                });

                describe('named export:', () => {

                    it('object (Ns_App_Mod#export$$)', async () => {
                        const container = new Container();
                        const id = 'Ns_App_Mod#export$$';
                        const factory = {name: 'primary object'};
                        container.set(id, factory);
                        const dep1 = await container.get(id);
                        const dep2 = await container.get(id);
                        assert(dep1 !== dep2);  // is not the same object
                        assert.deepStrictEqual(dep1, dep2); // but both objects are equals
                    });

                    it('function (Ns_App_Mod#export$$)', async () => {
                        const container = new Container();
                        const id = 'Ns_App_Mod#export$$';
                        const factory = function () {
                            return {name: 'primary object'};
                        };
                        container.set(id, factory);
                        const dep1 = await container.get(id);
                        const dep2 = await container.get(id);
                        assert(dep1 !== dep2);  // is not the same object
                        assert.deepStrictEqual(dep1, dep2); // but both objects are equals
                        assert.deepStrictEqual(dep1, {name: 'primary object'}); // equals to primary
                    });

                    it('class (Ns_App_Mod#export$$)', async () => {
                        const container = new Container();
                        const id = 'Ns_App_Mod#export$$';
                        const factory = class Primary {
                            name = 'primary object'
                        };
                        container.set(id, factory);
                        const dep1 = await container.get(id);
                        const dep2 = await container.get(id);
                        assert(dep1 !== dep2);  // is not the same object
                        assert.deepStrictEqual(dep1, dep2); // but both objects are equals
                        assert.deepStrictEqual(dep1, new factory()); // equals to primary
                    });

                });

            });

        });

    });

    describe('allows to import:', () => {
        it('all from sources', async () => {
            // set up source mapping
            /** @type {TeqFw_Di_Shared_Container} */
            const container = new Container();
            container.addSourceMapping('Test', join(DATA_ROOT, 'd001'), true);
            // load ES module then get exported parts
            const mod = await container.get('Test_DepModule');
            const namedSingleton = mod.NAMED_SINGLETON;
            const namedConstructFn = mod.namedFactory;
            const namedConstructClass = mod.NamedFactory;
            // place exported parts as objects to container
            container.set('namedSingleton', namedSingleton);
            container.set('namedConstructFn$$', namedConstructFn);
            container.set('namedConstructClass$$', namedConstructClass);
            // get Main and resolve all dependencies
            const main = await container.get('Test_Main$');
            assert.deepStrictEqual(main.depFn.namedSingleton.name, 'named singleton');
        });

    });

    describe('handles the errors:', () => {

        it('exception when wrong dependency is set', async () => {
            const container = new Container();
            try {
                container.set('Ns_Module#namedExport');
                assert(false);
            } catch (e) {
                assert(/^Dependency ID is not valid for factory or singleton.*$/.test(e.message));
            }
        });

        it('circular dependencies', async () => {
            const container = new Container();
            // set up source mapping
            container.addSourceMapping('Test_Container', join(DATA_ROOT, 'd002'), true);
            try {
                await container.get('Test_Container_MainClass$$');
                assert(false);
            } catch (e) {
                assert(/^Circular dependencies .*$/.test(e.message));
            }
        });
    });
});
