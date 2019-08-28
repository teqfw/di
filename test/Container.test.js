import Container from "../src/Container.mjs";
import {describe, it} from "mocha";
import {expect} from "chai";


describe("TeqFw_Di_Container", function () {
    /** @type {TeqFw_Di_Container} */
    const container = new Container();

    it("has all expected public methods", function (done) {
        const methods = Object.getOwnPropertyNames(container)
            .filter(p => (typeof container[p] === 'function'));
        expect(methods).deep.equal([
            "addSourceMapping",
            "delete",
            "get",
            "getModulesLoader",
            "has",
            "list",
            "set"
        ]);
        done();
    });

    it("contains itself inside", function (done) {
        container.get("TeqFw_Di_Container$")
            .then((obj) => {
                expect(obj).equal(container);
                done();
            });
    });

    describe("allows to inspect itself:", function () {
        it("access modules loader", function (done) {
            const loader = container.getModulesLoader();
            expect(loader.constructor.name).equal("TeqFw_Di_Container_ModulesLoader");
            done();
        });

        it("lists contained instances and loaded modules", function (done) {
            const dep_id_instance_default = "dbConfiguration$";
            const dep_id_instance_named = "dbConfiguration$postgres";
            const dep_id_module = "Vendor_Project_Module";
            const obj = {name: "one object for all deps"};
            container.set(dep_id_instance_default, obj);
            container.set(dep_id_instance_named, obj);
            container.set(dep_id_module, obj);
            const deps = container.list();
            expect(deps).contains(dep_id_instance_default);
            expect(deps).contains(dep_id_instance_named);
            expect(deps).contains(dep_id_module);
            done();
        });
    });

    describe("allows to delete:", function () {
        it("(named) instance from container", function (done) {
            const dep_id = "configuration$postgres";
            const obj = {name: "this is configuration for postgres DB"};
            container.set(dep_id, obj);
            expect(container.has(dep_id)).equal(true);
            container.delete(dep_id);
            expect(container.has(dep_id)).equal(false);
            done();
        });

        it("loaded module from container", function (done) {
            const dep_id = "Vendor_Module_Source";
            const loaded_module = {name: "Module Source to delete"};
            container.set(dep_id, loaded_module);
            expect(container.has(dep_id)).equal(true);
            container.delete(dep_id);
            expect(container.has(dep_id)).equal(false);
            done();
        });
    });

    describe("allows to place:", function () {
        it("(named) instance to container", function (done) {
            const id_named = "configuration$postgres";
            const obj = {name: "this is configuration for postgres DB"};
            container.set(id_named, obj);
            container.get(id_named)
                .then((obj) => {
                    expect(obj).equal(obj);
                    done();
                });
        });

        it("object template as factory to module loader", function (done) {
            const id = "ExportedObject";
            const obj_in = {name: "this template object is exported from outer source"};
            container.set(id, obj_in);
            container.get(id)
                .then((obj_out) => {
                    expect(obj_out).not.equal(obj_in);
                    expect(obj_out).deep.equal(obj_in);
                    done();
                });
        });

        it("function factory as factory to module loader", function (done) {
            // function factory to create new instances
            const depFactoryFunc = function () {
                return {name: "depFactoryFunc"};
            };
            container.set("DepFunc", depFactoryFunc);
            // main function factory with dependency been get from FunctionFactory
            const id = "MainFactory";
            const mainFactory = function ({DepFunc}) {
                return {dep: DepFunc};
            };
            container.set(id, mainFactory);
            container.get(id)
                .then((obj_new) => {
                    expect(obj_new).deep.equal({dep: {name: "depFactoryFunc"}});
                    done();
                });
        });

        it("class factory as factory to module loader", function (done) {
            // class factory to create new instances
            const depFactoryClass = class {
                constructor() {
                    return {name: "depFactoryClass"};
                }
            };
            container.set("DepClass", depFactoryClass);
            // main function factory with dependency been get from FunctionFactory
            const id = "MainFactory";
            const mainFactory = function ({DepClass}) {
                return {dep: DepClass};
            };
            container.set(id, mainFactory);
            container.get(id)
                .then((obj_new) => {
                    expect(obj_new).deep.equal({dep: {name: "depFactoryClass"}});
                    done();
                });
        });
    });

    describe("allows to import:", function () {
        it("functional dependency from source", function (done) {
            // set up source mapping
            /** @type {TeqFw_Di_Container} */
            const container = new Container();
            container.addSourceMapping("Test_Container", __dirname + "/Container.test/d001", true);
            // main function factory with dependency been get from FunctionFactory
            const id = "MainFactory";
            const mainFactory = function ({Test_Container_DepFunc}) {
                return {dep: Test_Container_DepFunc};
            };
            container.set(id, mainFactory);
            container.get(id)
                .then((obj_new) => {
                    expect(obj_new).deep.equal({dep: {name: "Test_Container_DepFunc"}});
                    done();
                });
        });

        it("class dependency from source", function (done) {
            // set up source mapping
            /** @type {TeqFw_Di_Container} */
            const container = new Container();
            container.addSourceMapping("Test_Container", __dirname + "/Container.test/d001", true);
            // main function factory with dependency been get from FunctionFactory
            const id = "MainFactory";
            const mainFactory = function ({Test_Container_DepClass}) {
                return {dep: Test_Container_DepClass};
            };
            container.set(id, mainFactory);
            container.get(id)
                .then((obj_new) => {
                    expect(obj_new).deep.equal({dep: {name: "Test_Container_DepClass"}});
                    done();
                });
        });

        it("create new named dependency from source", function (done) {
            /** @type {TeqFw_Di_Container} */
            const container = new Container();
            // set up source mapping
            container.addSourceMapping("Test_Container", __dirname + "/Container.test/d003", true);
            container.get("Test_Container_MainClass")
                .then((obj_new) => {
                    expect(obj_new).deep.equal({name: "main", dep1: {name: "dep"}, dep2: {name: "dep"}});
                    done();
                });
        });
    });

    describe("handles the errors:", function () {
        it("circular dependencies", function (done) {
            const container = new Container();
            // set up source mapping
            container.addSourceMapping("Test_Container", __dirname + "/Container.test/d002", true);
            container.get("Test_Container_MainClass").catch(
                (e) => {
                    const boo = 4;
                    expect(e.message)
                        .equal("Circular dependencies (main: Test_Container_MainClass; dep: Test_Container_DepClass)");
                    done();
                }
            );
        });
    });
});