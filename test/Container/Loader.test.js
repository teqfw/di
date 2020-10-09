import Loader from '../../src/Container/Loader.js';
import {describe, it} from 'mocha';
import assert from 'assert';

describe('TeqFw_Di_Container_Loader', () => {

    const obj = new Loader();

    it('has right classname', (done) => {
        assert.strictEqual(obj.constructor.name, 'TeqFw_Di_Container_Loader');
        done();
    });

    it('has all expected public methods in prototype', (done) => {
        const methods = Object.getOwnPropertyNames(obj.__proto__)
            .filter(p => (typeof obj[p] === 'function' && p !== 'constructor'));
        assert.deepStrictEqual(methods, [
            'addNamespaceRoot',
            'delete',
            'get',
            'getResolver',
            'has',
            'list',
            'set'
        ]);
        done();
    });

    it('lists loaded modules', (done) => {
        const moduleId = 'Vendor_Project_Module';
        const dependency = {name: 'one export for all modules'};
        obj.set(moduleId, dependency);
        /** @type {Array} */
        const deps = obj.list();
        assert(deps.includes(moduleId));
        done();
    });

    it('allows to place imported source to loader and get it back', (done) => {
        const depId = 'Vendor_Module_Source';
        const dependency = {name: 'some factory function or object imported manually'};
        obj.set(depId, dependency);
        obj.get(depId)
            .then((dep) => {
                assert.strictEqual(dep, dependency);
                done();
            });
    });

    it('disallows to place imported source as an instance to loader', (done) => {
        const depId = 'Vendor_Module_Source$';
        const dependency = {name: 'not important'};
        assert.throws(
            () => obj.set(depId, dependency),
            /Cannot load module source as instance/
        );
        done();
    });

});
