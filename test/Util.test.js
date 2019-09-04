import Util from "../src/Util.mjs";
import {describe, it} from "mocha";
import {expect} from "chai";


describe("TeqFw_Di_Util", function () {

    it("has all expected public methods", function (done) {
        const methods = Object.getOwnPropertyNames(Util)
            .filter(p => (typeof Util[p] === 'function'));
        expect(methods).deep.equal([
            "parseId"
        ]);
        done();
    });

    it("should reject invalid IDs", function (done) {
        expect(() => {
            Util.parseId("1Vendor_Project_Module_Dependency");
        }).throw(/Invalid identifier: '1Vendor_Project_Module_Dependency'./);
        done();
    });

    it("should parse all parts of ID", function (done) {
        expect(Util.parseId("plugin$$Vendor_Project_Module_Dependency$name"))
            .deep.equal({
            id: "plugin$$Vendor_Project_Module_Dependency$name",
            source_part: "Vendor_Project_Module_Dependency",
            is_instance: true,
            instance_name: "name",
            plugin: "plugin"
        });
        done();
    });

    it("should parse new instance ID", function (done) {
        expect(Util.parseId("Vendor_Project_Module_Dependency"))
            .deep.equal({
            id: "Vendor_Project_Module_Dependency",
            source_part: "Vendor_Project_Module_Dependency",
            is_instance: false,
            instance_name: "",
            plugin: undefined
        });
        done();
    });

    it("should parse singleton ID", function (done) {
        expect(Util.parseId("Vendor_Project_Module_Dependency$"))
            .to.deep.equal({
            id: "Vendor_Project_Module_Dependency$",
            source_part: "Vendor_Project_Module_Dependency",
            is_instance: true,
            instance_name: "",
            plugin: undefined
        });
        done();
    });

    it("should parse named singleton ID", function (done) {
        expect(Util.parseId("Vendor_Project_Module_Dependency$name"))
            .to.deep.equal({
            id: "Vendor_Project_Module_Dependency$name",
            source_part: "Vendor_Project_Module_Dependency",
            is_instance: true,
            instance_name: "name",
            plugin: undefined
        });
        done();
    });

});