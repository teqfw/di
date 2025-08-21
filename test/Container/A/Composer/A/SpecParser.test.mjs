import parse from '../../../../../src/Container/A/Composer/A/SpecParser.js';
import {describe, it} from 'node:test';
import assert from 'node:assert';


describe('TeqFw_Di_Container_A_Composer_A_SpecParser', () => {

    it('parses not a function', async () => {
        const deps = parse('namedSingleton');
        assert(deps, []);
    });

    describe('parses an arrow function', () => {
        it('w/o arguments', async () => {
            const fn = () => {};
            const deps = parse(fn);
            assert(deps, []);
        });
        it('with simple arguments', async () => {
            const fn = ({container, logger, config}) => {};
            const deps = parse(fn);
            assert(deps, []);
        });
        it('with complex arguments', async () => {
            const fn = (
                {
                    Vnd_Pkg_Mod1,
                    Vnd_Pkg_Mod2$,
                    Vnd_Pkg_Mod3$$,
                    'Vnd_Pkg_Mod4.exp': exp,
                }
            ) => {};
            const deps = parse(fn);
            assert(deps.length, 4);
        });
    });

    describe('parses a regular function', () => {
        it('w/o arguments', async () => {
            const fn = function () {};
            const deps = parse(fn);
            assert(deps, []);
        });
        it('with simple arguments', async () => {
            const fn = function ({container, logger, config}) {};
            const deps = parse(fn);
            assert(deps, []);
        });
        it('with complex arguments', async () => {
            const fn = function (
                {
                    Vnd_Pkg_Mod1,
                    Vnd_Pkg_Mod2$,
                    Vnd_Pkg_Mod3$$,
                    'Vnd_Pkg_Mod4.exp': exp,
                }
            ) {};
            const deps = parse(fn);
            assert(deps.length, 4);
        });
    });

    describe('parses a class', () => {
        it('w/o arguments', async () => {
            const Clazz = class {
                constructor() { }

            };
            const deps = parse(Clazz);
            assert(deps, []);
        });
        it('with simple arguments', async () => {
            const Clazz = class {
                constructor({container, logger, config}) { }

            };
            const deps = parse(Clazz);
            assert(deps, []);
        });
        it('with complex arguments', async () => {
            const Clazz = class {
                constructor(
                    {
                        Vnd_Pkg_Mod1,
                        Vnd_Pkg_Mod2$,
                        Vnd_Pkg_Mod3$$,
                        'Vnd_Pkg_Mod4.exp': exp,
                    }
                ) { }

            };
            const deps = parse(Clazz);
            assert(deps.length, 4);
        });
    });


});
