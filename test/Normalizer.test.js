import Normalizer from "../src/Normalizer.mjs";
import {describe, it} from "mocha";
import {expect} from "chai";


describe("TeqFw_Di_Normalizer", function () {

    it("has all expected public methods", function (done) {
        expect(Normalizer)
            .respondTo("parseId");
        done();
    });

    it("should reject invalid IDs", function (done) {
        expect(() => {
            Normalizer.parseId("1Vendor_Project_Module_Dependency");
        }).to.throw(/Invalid identifier: '1Vendor_Project_Module_Dependency'./);
        done();
    });

    it("should parse new instance ID", function (done) {
        expect(Normalizer.parseId("Vendor_Project_Module_Dependency"))
            .to.deep.equal({
            id: "Vendor_Project_Module_Dependency",
            source_part: "Vendor_Project_Module_Dependency",
            is_instance: false,
            instance_name: ""
        });
        done();
    });

    it("should parse singleton ID", function (done) {
        expect(Normalizer.parseId("Vendor_Project_Module_Dependency$"))
            .to.deep.equal({
            id: "Vendor_Project_Module_Dependency$",
            source_part: "Vendor_Project_Module_Dependency",
            is_instance: true,
            instance_name: ""
        });
        done();
    });

    it("should parse named singleton ID", function (done) {
        expect(Normalizer.parseId("Vendor_Project_Module_Dependency$name"))
            .to.deep.equal({
            id: "Vendor_Project_Module_Dependency$name",
            source_part: "Vendor_Project_Module_Dependency",
            is_instance: true,
            instance_name: "name"
        });
        done();
    });

});