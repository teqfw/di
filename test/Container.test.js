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

    it("allows to put (named) singleton to container", function (done) {
        const id_named = "configuration$postgres";
        const obj = {name: "this is configuration for postgres DB"};
        container.put(id_named, obj);
        container.get(id_named)
            .then((obj) => {
                expect(obj).equal(obj);
                done();
            });
    });

    it("allows to put object-factory as '_import' to container", function (done) {
        const id = "ExportedObject";
        const obj_in = {name: "this template object is exported from outer source"};
        container.put(id, obj_in);
        container.get(id)
            .then((obj_out) => {
                expect(obj_out).not.equal(obj_in);
                expect(obj_out).deep.equal(obj_in);
                done();
            });
    });

    it("allows to put function-factory as '_import' to container", function (done) {
        // function factory to create new instances
        const depFactoryFunc = function () {
            return {name: "depFactoryFunc"};
        };
        container.put("DepFunc", depFactoryFunc);
        // main function factory with dependency been get from FunctionFactory
        const id = "MainFactory";
        const mainFactory = function ({DepFunc}) {
            return {dep: DepFunc};
        };
        container.put(id, mainFactory);
        container.get(id)
            .then((obj_new) => {
                expect(obj_new).deep.equal({dep: {name: "depFactoryFunc"}});
                done();
            });
    });

    it("allows to put class-factory as '_import' to container", function (done) {
        // class factory to create new instances
        const depFactoryClass = class {
            constructor() {
                return {name: "depFactoryClass"};
            }
        };
        container.put("DepClass", depFactoryClass);
        // main function factory with dependency been get from FunctionFactory
        const id = "MainFactory";
        const mainFactory = function ({DepClass}) {
            return {dep: DepClass};
        };
        container.put(id, mainFactory);
        container.get(id)
            .then((obj_new) => {
                expect(obj_new).deep.equal({dep: {name: "depFactoryClass"}});
                done();
            });
    });

});