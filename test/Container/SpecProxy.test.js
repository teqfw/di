import SpecProxy from "../../src/Container/SpecProxy.mjs";
import {describe, it} from "mocha";
import {expect} from "chai";

describe("TeqFw_Di_Container_SpecProxy", function () {
    // this is small entrance test, `SpecProxy` is tested mainly as part of `Container` object.


    it("allows to get dependency by id", function (done) {


        const dep_id = "config$pg";
        const dep_obj = {name: "boo"};
        const obj_id = "Vendor_Module_Class";
        const container_insts = new Map();
        const fn_get_dep = async function () {
            return dep_obj;
        };
        const make_funcs = {};
        const fn_reject = function () {
            // this function is not called
        };

        /** @type {TeqFw_Di_Container_SpecProxy} */
        const spec_proxy = new SpecProxy(obj_id, container_insts, fn_get_dep, make_funcs, fn_reject);

        // add make function to call `spec_proxy[dep_id]` once again after dependency constructing
        make_funcs[obj_id] = function () {
            const dep = spec_proxy[dep_id];
            expect(dep).equal(dep_obj);
            done();
        };

        try {
            const dep = spec_proxy[dep_id];
            // the next line will never be reached
            console.log(dep);
        } catch (err) {
            // catch first exception on "dep is not found" event
            expect(err).equal(`There is no dependency with id '${dep_id}' yet.`);
        }

    });

});