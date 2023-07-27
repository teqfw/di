import parser from '../../src/Spec/Parser.mjs';

import {describe, it} from 'mocha';
import assert from 'assert';

describe('Spec.Parser', () => {

    describe('should parse regular function:', () => {
        it('function name({[depId]:arg})', async () => {
            // define regular named function
            const factory = function name(
                {
                    ['Vendor_App_Mod.arg1$$#adp']: arg1,
                    ['Vendor_App_Mod.arg2$$#adp']: arg2,
                }
            ) {};

            const res = parser(factory);
            assert.strictEqual(res[0], 'Vendor_App_Mod.arg1$$#adp');
            assert.strictEqual(res[1], 'Vendor_App_Mod.arg2$$#adp');
        });
        it('function({[depId]:arg})', async () => {
            // define regular anonymous function
            const factory = function (
                {
                    ['Vendor_App_Mod.arg1$$#adp']: arg1,
                    ['Vendor_App_Mod.arg2$$#adp']: arg2,
                }
            ) {};

            const res = parser(factory);
            assert.strictEqual(res[0], 'Vendor_App_Mod.arg1$$#adp');
            assert.strictEqual(res[1], 'Vendor_App_Mod.arg2$$#adp');
        });
        it('function({Vendor_App_Mod$$:arg})', async () => {
            // define regular function w/o []
            const factory = function (
                {
                    Vendor_App_Mod$$: arg1,
                    Vendor_App_Dom$$: arg2,
                }
            ) {};

            const res = parser(factory);
            assert.strictEqual(res[0], 'Vendor_App_Mod$$');
            assert.strictEqual(res[1], 'Vendor_App_Dom$$');
        });
        it('function({Vendor_App_Mod$$})', async () => {
            // define regular function w/o []
            const factory = function ({Vendor_App_Mod$$, Vendor_App_Dom$$,}) {};

            const res = parser(factory);
            assert.strictEqual(res[0], 'Vendor_App_Mod$$');
            assert.strictEqual(res[1], 'Vendor_App_Dom$$');
        });
        it('function()', async () => {
            // define regular function w/o args
            const factory = function () {};

            const res = parser(factory);
            assert.strictEqual(res.length, 0);
        });
    });

    describe('should parse arrow function:', () => {
        it('({[depId]:arg})=>', async () => {
            // define regular named function
            const factory = (
                {
                    ['Vendor_App_Mod.arg1$$#adp']: arg1,
                    ['Vendor_App_Mod.arg2$$#adp']: arg2,
                }
            ) => {
                return arg1 + arg2;
            };

            const res = parser(factory);
            assert.strictEqual(res[0], 'Vendor_App_Mod.arg1$$#adp');
            assert.strictEqual(res[1], 'Vendor_App_Mod.arg2$$#adp');
        });
        it('({depId$$:arg})=>', async () => {
            // define regular named function
            const factory = (
                {
                    Vendor_App_Mod$$: arg1,
                    Vendor_App_Dom$$: arg2,
                }
            ) => {
                return arg1 + arg2;
            };

            const res = parser(factory);
            assert.strictEqual(res[0], 'Vendor_App_Mod$$');
            assert.strictEqual(res[1], 'Vendor_App_Dom$$');
        });
        it('({depId$$})=>', async () => {
            // define regular named function
            const factory = ({Vendor_App_Mod$$, Vendor_App_Dom$$,}) => {
                return Vendor_App_Mod$$ + Vendor_App_Dom$$;
            };

            const res = parser(factory);
            assert.strictEqual(res[0], 'Vendor_App_Mod$$');
            assert.strictEqual(res[1], 'Vendor_App_Dom$$');
        });
        it('()=>', async () => {
            // define regular named function
            const factory = ({}) => {};

            const res = parser(factory);
            assert.strictEqual(res.length, 0);
        });
    });

    describe('should parse class constructor:', () => {
        it('({[depId]:arg})', async () => {
            // define regular named function
            class Factory {
                constructor(
                    {
                        ['Vendor_App_Mod.arg1$$#adp']: arg1,
                        ['Vendor_App_Mod.arg2$$#adp']: arg2,
                    }
                ) {}
            }

            const res = parser(Factory);
            assert.strictEqual(res[0], 'Vendor_App_Mod.arg1$$#adp');
            assert.strictEqual(res[1], 'Vendor_App_Mod.arg2$$#adp');
        });
        it('({depId$$:arg})', async () => {
            // define regular named function
            class Factory {
                constructor(
                    {
                        Vendor_App_Mod$$: arg1,
                        Vendor_App_Dom$$: arg2,
                    }
                ) {}
            }

            const res = parser(Factory);
            assert.strictEqual(res[0], 'Vendor_App_Mod$$');
            assert.strictEqual(res[1], 'Vendor_App_Dom$$');
        });
        it('({depId$$})', async () => {
            // define regular named function
            class Factory {
                constructor({Vendor_App_Mod$$, Vendor_App_Dom$$,}) {}
            }

            const res = parser(Factory);
            assert.strictEqual(res[0], 'Vendor_App_Mod$$');
            assert.strictEqual(res[1], 'Vendor_App_Dom$$');
        });
        it('()', async () => {
            // define regular named function
            class Factory {
                constructor() {}
            }

            const res = parser(Factory);
            assert.strictEqual(res.length, 0);
        });
    });

});
