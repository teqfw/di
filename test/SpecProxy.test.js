import SpecProxy from '../src/SpecProxy';
import {describe, it} from 'mocha';
import assert from 'assert';

/**
 * DON'T DEBUG THIS SCRIPT IN IDEA, SOME MYSTICAL "THREADS" JUMPS ARE APPEARED IN DEBUGGER.
 *
 * New dependency `dbConfig` is added into `depsStack` before related code line call in SpecProxy,
 * so 'Circular dependencies ...' exception is thrown in debugger but not in console.
 */
describe('TeqFw_Di_SpecProxy', () => {
    // this is small entrance test, `SpecProxy` is tested mainly as part of `Container` object.


    it('allows to get dependency by id', (done) => {
        // working vars
        let firstException = false;
        let depConstructed = false;

        // environment for SpecProxy: main object 'Vendor_Module' depends from 'dbConfig'
        const depId = 'dbConfig';
        const dependency = {name: 'dbConfig'};
        const mainId = 'Vendor_Module';
        const depsStack = {Vendor_Module_Class: true};
        const containerSingletons = new Map();
        // create function to call `spec_proxy[dep_id]` once again after dependency constructing
        const fnCreate = () => {
            assert(firstException);
            assert(depConstructed);
            // dependency is returned on the second call
            const dep = specProxy[depId];
            assert.strictEqual(dep, dependency);
            done();
        };
        // Create dependency on demand (after first SpecProxy.EXCEPTION_TO_STEALTH exception)
        const fnGetObect = async () => {
            depConstructed = true;
            return dependency;
        };


        /** @type {TeqFw_Di_SpecProxy} */
        const specProxy = new SpecProxy(mainId, depsStack, containerSingletons, fnCreate, fnGetObect);


        try {
            const dep = specProxy[depId];
            // the next line will never be reached
            console.log(dep);
        } catch (err) {
            // catch first exception on 'dep is not found' event
            assert.strictEqual(err, SpecProxy.EXCEPTION_TO_STEALTH);
            firstException = true;
        }

    });

});
