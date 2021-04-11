import SpecProxy from '../src/SpecProxy.mjs';
import {describe, it} from 'mocha';
import assert from 'assert';

/**
 * This is small entrance test, `SpecProxy` is tested mainly as part of `Container` object.
 */
describe('TeqFw_Di_SpecProxy', () => {

    it('allows to get dependency by id', (done) => {
        // environment for SpecProxy: main object 'Vendor_Module' depends from 'dbConfig'
        const depId = 'dbConfig';
        const dependency = {name: 'dbConfig'};
        const mainId = 'Vendor_Module';
        const uplineDeps = {Vendor_Module_Class: true};
        const containerSingletons = new Map();
        containerSingletons.set(depId, dependency);
        const fnCreate = () => { };
        const fnGetObect = () => { };
        const fnRejectUseFactory = () => { };

        /** @type {TeqFw_Di_SpecProxy} */
        const specProxy = new SpecProxy(
            mainId, uplineDeps, containerSingletons,
            fnCreate, fnGetObect, fnRejectUseFactory
        );

        const dep = specProxy[depId];
        assert.strictEqual(dep, dependency);
        done();

    });

});
