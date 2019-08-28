import Resolver from "../../../src/Container/ModulesLoader/Resolver.mjs";
import {describe, it} from "mocha";
import {expect} from "chai";

describe("TeqFw_Di_Container_ModulesLoader_Resolver", function () {
    /** @type {TeqFw_Di_Container_ModulesLoader_Resolver} */
    const resolver = new Resolver();

    it("has all expected public methods", function (done) {
        const methods = Object.getOwnPropertyNames(resolver)
            .filter(p => (typeof resolver[p] === 'function'));
        expect(methods).deep.equal([
            "addNamespaceRoot",
            "getSourceById",
            "list"
        ]);
        done();
    });

    it("allows registry and resolve namespaces", function (done) {
        resolver.addNamespaceRoot({ns: "Vendor_Project_App", path: "./path/to/app/root", ext: "js"});
        resolver.addNamespaceRoot({ns: "Vendor_Project_App_Module", path: "./path/to/mod/root", ext: "mjs"});
        const path_app = resolver.getSourceById("Vendor_Project_App_Type");
        const path_mod = resolver.getSourceById("Vendor_Project_App_Module_Type");
        expect(path_app).equal("./path/to/app/root/Type.js");
        expect(path_mod).equal("./path/to/mod/root/Type.mjs");
        done();
    });

    it("lists namespaces mapping", function (done) {
        const resolver = new Resolver();
        resolver.addNamespaceRoot({
            ns: "Vendor_Project_Module_Class",
            path: "./path/to/sources",
            ext: "mjs",
            is_absolute: false
        });
        const mapping = resolver.list();
        expect(mapping).deep.equal({
            "Vendor_Project_Module_Class": {
                "ext": "mjs",
                "is_absolute": false,
                "path": "./path/to/sources"
            }
        });
        done();
    });
});