import Container from '../src/Container';
import {describe, it} from 'mocha';
import assert from 'assert';

describe('TeqFw_Di_Container', function () {
    /** @type {TeqFw_Di_Container} */
    const container = new Container();

    it('has right classname', async () => {
        assert.strictEqual(container.constructor.name, 'TeqFw_Di_Container');
    });

    it('has all expected public methods', async () => {
        const methods = Object.getOwnPropertyNames(container)
            .filter(p => (typeof container[p] === 'function'));
        assert.deepStrictEqual(methods, [
            'addSourceMapping',
            'delete',
            'get',
            'getLoader',
            'has',
            'list',
            'set'
        ]);
    });

    it('contains itself inside', async () => {
        const obj = await container.get('TeqFw_Di_Container$$');
        assert.strictEqual(obj, container);
    });

    describe('allows to inspect itself:', () => {
        it('access to modules loader', async () => {
            const loader = container.getLoader();
            assert.strictEqual(loader.constructor.name, 'TeqFw_Di_Container_Loader');
        });

        it('lists contained instances and loaded modules', async () => {
            const depIdNamedSingleton = 'dbConfiguration';
            const depIdModule = 'Vendor_Project_Module';
            const depIdModConstructor = 'Vendor_Project_Module$';
            const depIdModSingleton = 'Vendor_Project_Module$$';
            const obj = {name: 'one object for all deps'};
            container.set(depIdNamedSingleton, obj);
            container.set(depIdModule, obj);
            container.set(depIdModConstructor, obj);
            container.set(depIdModSingleton, obj);
            const deps = container.list();
            assert(deps.includes(depIdNamedSingleton));
            assert(deps.includes(depIdModule));
            assert(deps.includes(depIdModConstructor));
            assert(deps.includes(depIdModSingleton));
        });
    });

    describe('allows to delete:', () => {
        it('named instance from container', async () => {
            const depId = 'postgresConfiguration';
            const obj = {name: 'this is configuration for postgres DB'};
            container.set(depId, obj);
            assert(container.has(depId));
            container.delete(depId);
            assert(!container.has(depId));
        });

        it('module from container', async () => {
            const depId = 'Vendor_Module_Source';
            const module = {name: 'some module'};
            container.set(depId, module);
            assert(container.has(depId));
            container.delete(depId);
            assert(!container.has(depId));
        });

        it('constructors from container', async () => {
            const depId = 'Vendor_Module_Source$';
            const construct = {name: 'constructor function'};
            container.set(depId, construct);
            assert(container.has(depId));
            container.delete(depId);
            assert(!container.has(depId));
        });

        it('default export singletons from container', async () => {
            const depId = 'Vendor_Module_Source$$';
            const construct = {name: 'singleton object from module\'s default export'};
            container.set(depId, construct);
            assert(container.has(depId));
            container.delete(depId);
            assert(!container.has(depId));
        });
    });

    describe('allows to place:', () => {
        it('named instance to container', async () => {
            const id = 'dbConfiguration';
            const depIn = {name: 'this is configuration for postgres DB'};
            container.set(id, depIn);
            const depOut = await container.get(id);
            assert(depOut === depIn); // is the same object
        });

        it('module to container', async () => {
            const id = 'SomeImportedModule';
            const depIn = {name: 'this is some imported module'};
            container.set(id, depIn);
            const depOut = await container.get(id);
            assert(depOut === depIn); // is the same object
        });

        it('object template as factory to module loader', async () => {
            const id = 'ExportedObject';
            const depIn = {name: 'this template object is exported from outer source'};
            container.set(id, depIn);
            const depOut = await container.get(id);
            assert(depOut !== depIn); // is not the same object
            assert.deepStrictEqual(depOut, depIn); // but both objects are equals
        });

        it('function factory as factory to module loader', (done) => {
            // function factory to create new instances
            const depFactoryFunc = () => {
                return {name: 'depFactoryFunc'};
            };
            container.set('DepFunc', depFactoryFunc);
            // main function factory with dependency been get from FunctionFactory
            const id = 'MainFactory';
            const mainFactory = ({DepFunc}) => {
                return {dep: DepFunc};
            };
            container.set(id, mainFactory);
            container.get(id)
                .then((depOut) => {
                    assert.deepStrictEqual(depOut, {dep: {name: 'depFactoryFunc'}});
                    done();
                });
        });

        it('class factory as factory to module loader', (done) => {
            // class factory to create new instances
            const depFactoryClass = class {
                constructor() {
                    return {name: 'depFactoryClass'};
                }
            };
            container.set('DepClass', depFactoryClass);
            // main function factory with dependency been get from FunctionFactory
            const id = 'MainFactory';
            const mainFactory = ({DepClass}) => {
                return {dep: DepClass};
            };
            container.set(id, mainFactory);
            container.get(id)
                .then((depOut) => {
                    assert.deepStrictEqual(depOut, {dep: {name: 'depFactoryClass'}});
                    done();
                });
        });
    });

    describe('allows to import:', () => {
        it('functional dependency from source', (done) => {
            // set up source mapping
            /** @type {TeqFw_Di_Container} */
            const container = new Container();
            container.addSourceMapping('Test_Container', __dirname + '/.data/d001', true);
            // main function factory with dependency been get from FunctionFactory
            const id = 'MainFactory';
            const mainFactory = ({Test_Container_DepFunc}) => {
                return {dep: Test_Container_DepFunc};
            };
            container.set(id, mainFactory);
            container.get(id)
                .then((depOut) => {
                    assert.deepStrictEqual(depOut, {dep: {name: 'Test_Container_DepFunc'}});
                    done();
                });
        });

        it('class dependency from source', (done) => {
            // set up source mapping
            /** @type {TeqFw_Di_Container} */
            const container = new Container();
            container.addSourceMapping('Test_Container', __dirname + '/.data/d001', true);
            // main function factory with dependency been get from FunctionFactory
            const id = 'MainFactory';
            const mainFactory = ({Test_Container_DepClass}) => {
                return {dep: Test_Container_DepClass};
            };
            container.set(id, mainFactory);
            container.get(id)
                .then((depOut) => {
                    assert.deepStrictEqual(depOut, {dep: {name: 'Test_Container_DepClass'}});
                    done();
                });
        });

        it('create new named dependency from source', (done) => {
            /** @type {TeqFw_Di_Container} */
            const container = new Container();
            // set up source mapping
            container.addSourceMapping('Test_Container', __dirname + '/.data/d003', true);
            container.get('Test_Container_MainClass')
                .then((depOut) => {
                    assert.deepStrictEqual(depOut, {name: 'main', dep1: {name: 'dep'}, dep2: {name: 'dep'}});
                    done();
                });
        });
    });

    describe('handles the errors:', () => {
        it('circular dependencies', (done) => {
            const container = new Container();
            // set up source mapping
            container.addSourceMapping('Test_Container', __dirname + '/.data/d002', true);
            container.get('Test_Container_MainClass').catch(
                (e) => {
                    assert.strictEqual(
                        e.message,
                        'Circular dependencies (main: Test_Container_MainClass; dep: Test_Container_DepClass)'
                    );
                    done();
                }
            );
        });
    });
});
