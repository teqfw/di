import Container from "../src/Container.mjs";
import {describe, it} from "mocha";
import {expect} from "chai";


describe("Container", function () {
    /** @type {TeqFw_Di_Container} */
    const container = new Container();

    it("has all expected public methods", function (done) {
        expect(new Container()).to
            .respondTo("addSourceMapping")
            .respondTo("get")
            .respondTo("has")
            .respondTo("put");
        done();
    });

    it("contains itself inside", function (done) {
        container.get("TeqFw_Di_Container$")
            .then((obj) => {
                expect(obj).equal(container);
                done();
            });
    });

    it("allows to put named singleton to container", function (done) {
        const id_named = "configuration$postgres";
        const obj = {name: "this is configuration for postgres DB"};
        container.put(id_named, obj);
        container.get(id_named)
            .then((obj) => {
                expect(obj).equal(obj);
                done();
            });
    });

    it("allows to put named singleton to container", function (done) {
        const id_named = "configuration$postgres";
        const obj = {name: "this is configuration for postgres DB"};
        container.put(id_named, obj);
        container.get(id_named)
            .then((obj) => {
                expect(obj).equal(obj);
                done();
            });
    });

    it("allows to put object as '_import' to container", function (done) {
        const id = "ExportedObject";
        const obj_in = {name: "this object is exported from outer source"};
        container.put(id, obj_in);
        container.get(id)
            .then((obj_out) => {
                expect(obj_out).equal(obj_in);
                done();
            });
    });

    it("allows to put functions as '_import' to container", function (done) {
        const id = "ExportedFunction";
        const fn_in = function () {
            return {name: "this is 'ExportedFunction'."};
        };
        container.put(id, fn_in);
        container.get(id)
            .then((fn_out) => {
                expect(fn_out).equal(fn_in);
                done();
            });
    });

});