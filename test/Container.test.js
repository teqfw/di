import Container from '../src/Container';
import {describe, it} from 'mocha';
import assert from 'assert';

describe('TeqFw_Di_Container', function () {

    it('has right classname', async () => {
        const container = new Container();
        assert.strictEqual(container.constructor.name, 'TeqFw_Di_Container');
    });

    it('has all expected public methods', async () => {
        const container = new Container();
        const methods = Object.getOwnPropertyNames(container)
            .filter(p => (typeof container[p] === 'function'));
        assert.deepStrictEqual(methods, [
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
        const exportSingleton = await container.get('TeqFw_Di_Container$$');
        assert.strictEqual(exportSingleton, container);
        const namedSingleton = await container.get('container');
        assert.strictEqual(namedSingleton, container);
    });

    describe('allows to inspect itself:', () => {
        const container = new Container();

        it('access to modules loader', async () => {
            const loader = container.getNsResolver();
            assert.strictEqual(loader.constructor.name, 'TeqFw_Di_Resolver');
        });

        it('lists contained instances and loaded modules', async () => {
            const obj = {name: 'one object for all deps'};
            container.set('namedSingleton', obj);
            container.set('namedConstructor$', obj);
            container.set('Vendor_Module', obj);
            container.set('Vendor_Module$', obj);
            container.set('Vendor_Module$$', obj);
            const {singletons, constructors, modules} = container.list();
            assert(constructors.includes('namedConstructor'));
            assert(constructors.includes('Vendor_Module'));
            assert(modules.includes('Vendor_Module'));
            assert(singletons.includes('namedSingleton'));
            assert(singletons.includes('Vendor_Module'));
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

        it('named constructor from container', async () => {
            const depId = 'namedConstructor$';
            const obj = {name: 'named constructor'};
            container.set(depId, obj);
            assert(container.has(depId));
            container.delete(depId);
            assert(!container.has(depId));
        });

        it('module from container', async () => {
            const depId = 'Vendor_Module';
            const module = {name: 'some module'};
            container.set(depId, module);
            assert(container.has(depId));
            container.delete(depId);
            assert(!container.has(depId));
        });

        it('default export constructor from container', async () => {
            const depId = 'Vendor_Module$';
            const construct = {name: 'default export constructor'};
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
        const container = new Container();

        it('named singleton to container', async () => {
            const id = 'namedSingleton';
            const depIn = {name: 'named singleton'};
            container.set(id, depIn);
            const depOut = await container.get(id);
            assert(depOut === depIn); // is the same object
        });

        it('named constructor to container', async () => {
            const id = 'namedConstructor$';
            const fnConstruct = function () {
                return {name: 'new object'};
            };
            container.set(id, fnConstruct);
            const dep1 = await container.get(id);
            const dep2 = await container.get(id);
            assert(dep1 !== dep2);  // is not the same object
            assert.deepStrictEqual(dep1, dep2); // but both objects are equals
        });

        it('module to container', async () => {
            const id = 'Vendor_Module';
            const depIn = {name: 'some module'};
            container.set(id, depIn);
            const depOut = await container.get(id);
            assert(depOut === depIn); // is the same object
        });

        it('default export object duplicator to container', async () => {
            const id = 'Vendor_Module$';
            const modIn = {
                default: {name: 'new object from other object'}
            };
            container.set(id, modIn);
            const dep1 = await container.get(id);
            const dep2 = await container.get(id);
            assert(dep1 !== dep2); // is not the same object
            assert.deepStrictEqual(dep1, dep2); // but both objects are equals
        });

        it('default export function constructor to container', async () => {
            const id = 'Vendor_Module$';
            const modIn = {
                default: () => {
                    return {name: 'new object from function'};
                }
            };
            container.set(id, modIn);
            const dep1 = await container.get(id);
            const dep2 = await container.get(id);
            assert(dep1 !== dep2); // is not the same object
            assert.deepStrictEqual(dep1, dep2); // but both objects are equals
        });

        it('default export class constructor to container', async () => {
            const id = 'Vendor_Module$';
            const modIn = {
                default: class {
                    name = 'new object from class'
                }
            };
            container.set(id, modIn);
            const dep1 = await container.get(id);
            const dep2 = await container.get(id);
            assert(dep1 !== dep2); // is not the same object
            assert.deepStrictEqual(dep1, dep2); // but both objects are equals
        });

        it('default export object singleton to container', async () => {
            const id = 'Vendor_Module$$';
            const modIn = {
                default: () => {
                    return {name: 'new object from function'};
                }
            };
            container.set(id, modIn);
            const dep1 = await container.get(id);
            const dep2 = await container.get(id);
            assert(dep1 !== modIn.default); // is not the same object (should be duplicated)
            assert(dep1 === dep2);
        });

        it('default export function singleton to container', async () => {
            const id = 'Vendor_Module$$';
            const modIn = {
                default: {name: 'new object from other object'}
            };
            container.set(id, modIn);
            const dep1 = await container.get(id);
            const dep2 = await container.get(id);
            assert(dep1 === dep2);
        });

        it('default export class singleton to container', async () => {
            const id = 'Vendor_Module$$';
            const modIn = {
                default: class {
                    name = 'new object from class'
                }
            };
            container.set(id, modIn);
            const dep1 = await container.get(id);
            const dep2 = await container.get(id);
            assert(dep1 === dep2);
        });
    });

    describe('allows to import:', () => {
        it('all from sources', async () => {
            // set up source mapping
            /** @type {TeqFw_Di_Container} */
            const container = new Container();
            container.addSourceMapping('Test', __dirname + '/.data/d001', true);
            // load ES module then get exported parts
            const mod = await container.get('Test_DepModule');
            const namedSingleton = mod.NAMED_SINGLETON;
            const namedConstructFn = mod.namedConstructor;
            const namedConstructClass = mod.NamedConstructor;
            // place exported parts as objects to container
            container.set('namedSingleton', namedSingleton);
            container.set('namedConstructFn$', namedConstructFn);
            container.set('namedConstructClass$', namedConstructClass);
            // get Main and resolve all dependencies
            const main = await container.get('Test_Main$');
            assert.deepStrictEqual(main, {dep: {name: 'Test_Container_DepFunc'}});
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
