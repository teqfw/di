import ModulesLoader from "../src/ModulesLoader.mjs";
import {describe, it} from "mocha";
import {expect} from "chai";


describe("TeqFw_Di_ModulesLoader", function () {

    const loader = new ModulesLoader();

    it("has all expected public methods", function (done) {
        expect(loader)
            .respondTo("addNamespaceRoot")
            .respondTo("get")
            .respondTo("getResolver")
            .respondTo("set");
        done();
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

    it("allows to get loader's resolver", function (done) {
        const resolver = loader.getResolver();
        expect(resolver.constructor.name).equal("TeqFw_Di_ModulesLoader_Resolver");
        done();
    });
});