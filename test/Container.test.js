import Container from '../src/Container';
import {describe, it} from 'mocha';
import assert from 'assert';

describe('TeqFw_Di_Container', function () {
    /** @type {TeqFw_Di_Container} */
    const container = new Container();

    it('has right classname', (done) => {
        assert.strictEqual(container.constructor.name, 'TeqFw_Di_Container');
        done();
    });

    it('has all expected public methods', (done) => {
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
        done();
    });

    it('contains itself inside', (done) => {
        container.get('TeqFw_Di_Container$')
            .then((obj) => {
                assert.strictEqual(obj, container);
                done();
            });
    });

    describe('allows to inspect itself:', () => {
        it('access to modules loader', function (done) {
            const loader = container.getLoader();
            assert.strictEqual(loader.constructor.name, 'TeqFw_Di_Container_Loader');
            done();
        });

        it('lists contained instances and loaded modules', (done) => {
            const depIdInstanceDefault = 'dbConfiguration$';
            const depIdInstanceNamed = 'dbConfiguration$postgres';
            const depIdModule = 'Vendor_Project_Module';
            const obj = {name: 'one object for all deps'};
            container.set(depIdInstanceDefault, obj);
            container.set(depIdInstanceNamed, obj);
            container.set(depIdModule, obj);
            const deps = container.list();
            assert(deps.includes(depIdInstanceDefault));
            assert(deps.includes(depIdInstanceNamed));
            assert(deps.includes(depIdModule));
            done();
        });
    });

    describe('allows to delete:', () => {
        it('(named) instance from container', (done) => {
            const depId = 'configuration$postgres';
            const obj = {name: 'this is configuration for postgres DB'};
            container.set(depId, obj);
            assert(container.has(depId));
            container.delete(depId);
            assert(!container.has(depId));
            done();
        });

        it('loaded module from container', (done) => {
            const depId = 'Vendor_Module_Source';
            const loadedModule = {name: 'Module Source to delete'};
            container.set(depId, loadedModule);
            assert(container.has(depId));
            container.delete(depId);
            assert(!container.has(depId));
            done();
        });
    });

    describe('allows to place:', () => {
        it('(named) instance to container', (done) => {
            const id = 'configuration$postgres';
            const depIn = {name: 'this is configuration for postgres DB'};
            container.set(id, depIn);
            container.get(id)
                .then((depOut) => {
                    assert(depOut === depIn); // is the same obect
                    done();
                });
        });

        it('object template as factory to module loader', (done) => {
            const id = 'ExportedObject';
            const depIn = {name: 'this template object is exported from outer source'};
            container.set(id, depIn);
            container.get(id)
                .then((depOut) => {
                    assert(depOut !== depIn); // is not the same object
                    assert.deepStrictEqual(depOut, depIn); // but both objects are equals
                    done();
                });
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
