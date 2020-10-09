import SpecProxy from '../../src/Container/SpecProxy';
import {describe, it} from 'mocha';
import assert from 'assert';

describe('TeqFw_Di_Container_SpecProxy', () => {
    // this is small entrance test, `SpecProxy` is tested mainly as part of `Container` object.


    it('allows to get dependency by id', (done) => {
        const depId = 'config$pg';
        const dependency = {name: 'boo'};
        const objId = 'Vendor_Module_Class';
        const depsStack = new Set(['Vendor_Module_Class']);
        const containerInsts = new Map();
        const fnGetDep = async () => {
            return dependency;
        };
        const makeFuncs = {};
        const fnReject = () => {
            // this function is not called
        };

        /** @type {TeqFw_Di_Container_SpecProxy} */
        const specProxy = new SpecProxy(objId, depsStack, containerInsts, makeFuncs, fnGetDep, fnReject);

        // add make function to call `spec_proxy[dep_id]` once again after dependency constructing
        makeFuncs[objId] = () => {
            const dep = specProxy[depId];
            assert.strictEqual(dep, dependency);
            done();
        };

        try {
            const dep = specProxy[depId];
            // the next line will never be reached
            console.log(dep);
        } catch (err) {
            // catch first exception on 'dep is not found' event
            assert.strictEqual(err, SpecProxy.EXCEPTION_TO_STEALTH);
        }

    });

});
