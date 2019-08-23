import Resolver from "../src/Resolver.mjs";
import {describe, it} from "mocha";
import should from "should";

/** @type {TeqFw_Di_Resolver} */
const resolver = new Resolver();

describe("Resolver", function () {

    it("should registry and resolve namespaces", function (done) {
        resolver.addNamespaceRoot({ns: "Vendor_Project_App", path: "./path/to/app/root", ext: "js"});
        resolver.addNamespaceRoot({ns: "Vendor_Project_App_Module", path: "./path/to/mod/root", ext: "mjs"});
        const path_app = resolver.getSourceById("Vendor_Project_App_Type");
        const path_mod = resolver.getSourceById("Vendor_Project_App_Module_Type");
        should(path_app).equal("./path/to/app/root/Type.js");
        should(path_mod).equal("./path/to/mod/root/Type.mjs");
        done();
    });
});