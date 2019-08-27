import ModulesLoader from "../src/ModulesLoader.mjs";
import {describe, it} from "mocha";
import {expect} from "chai";


describe("TeqFw_Di_ModulesLoader", function () {

    const loader = new ModulesLoader();

    it("has all expected public methods", function (done) {
        const methods = Object.getOwnPropertyNames(loader)
            .filter(p => (typeof loader[p] === 'function'));
        expect(methods).deep.equal([
            "addNamespaceRoot",
            "delete",
            "get",
            "getResolver",
            "has",
            "list",
            "set"
        ]);
        done();
    });

    describe("allows to inspect itself", function () {
        it("access resolver", function (done) {
            const resolver = loader.getResolver();
            expect(resolver.constructor.name).equal("TeqFw_Di_ModulesLoader_Resolver");
            done();
        });

        it("lists loaded modules", function (done) {
            const module_id = "Vendor_Project_Module";
            const obj = {name: "one export for all modules"};
            loader.set(module_id, obj);
            const deps = loader.list();
            expect(deps).contains(module_id);
            done();
        });
    });

    it("allows to place imported source to loader and get it back", function (done) {
        const import_id = "Vendor_Module_Source";
        const obj = {name: "some factory function or object imported manually"};
        loader.set(import_id, obj);
        loader.get(import_id)
            .then((obj) => {
                expect(obj).equal(obj);
                done();
            });
    });

    it("disallows to place imported source as an instance to loader", function (done) {
        const import_id = "Vendor_Module_Source$";
        const obj = {name: "not important"};
        expect(() => {
            loader.set(import_id, obj);
        }).throw(/Cannot load module source as instance/);
        done();
    });


});