import IdParser from '../src/IdParser.mjs';
import ParsedId from '../src/Api/ParsedId.mjs';
import {describe, it} from 'mocha';
import assert from 'assert';

describe('TeqFw_Di_IdParser', () => {
    /** @type {TeqFw_Di_IdParser} */
    const obj = new IdParser();

    it('has right classname', async () => {
        assert.strictEqual(obj.constructor.name, 'TeqFw_Di_IdParser');
    });

    it('has all expected public methods in prototype', async () => {
        const methods = Object.getOwnPropertyNames(obj.__proto__)
            .filter(p => (typeof obj[p] === 'function' && p !== 'constructor'));
        assert.deepStrictEqual(methods, ['parse']);
    });

    it('should reject invalid IDs', async () => {
        assert.throws(
            () => {
                obj.parse('1Vendor_Project_Module_Dependency');
            },
            /Invalid identifier: '1Vendor_Project_Module_Dependency'./
        );
    });

    describe('should parse manual DI IDs:', () => {
        it('named singleton ID (namedSingleton)', async () => {
            const parsed = obj.parse('namedSingleton');
            assert.strictEqual(parsed.mapKey, 'namedSingleton');
            assert.strictEqual(parsed.nameExport, undefined);
            assert.strictEqual(parsed.nameModule, undefined);
            assert.strictEqual(parsed.namePackage, undefined);
            assert.strictEqual(parsed.orig, 'namedSingleton');
            assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_MANUAL);
            assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_SINGLETON);
        });

        it('named constructor ID (namedFactory$$)', async () => {
            const parsed = obj.parse('namedFactory$$');
            assert.strictEqual(parsed.mapKey, 'namedFactory');
            assert.strictEqual(parsed.nameExport, undefined);
            assert.strictEqual(parsed.nameModule, undefined);
            assert.strictEqual(parsed.namePackage, undefined);
            assert.strictEqual(parsed.orig, 'namedFactory$$');
            assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_MANUAL);
            assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_FACTORY);
        });
    });

    describe('should parse Logical NS:', () => {
        describe('module ID:', () => {
            it('simple (Ns_Module)', async () => {
                const parsed = obj.parse('Ns_Module');
                assert.strictEqual(parsed.mapKey, 'Ns_Module');
                assert.strictEqual(parsed.nameExport, undefined);
                assert.strictEqual(parsed.nameModule, 'Ns_Module');
                assert.strictEqual(parsed.namePackage, undefined);
                assert.strictEqual(parsed.orig, 'Ns_Module');
                assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_LOGICAL);
                assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_MODULE);
            });

            describe('named export:', () => {
                it('simple (Ns_Module#name)', async () => {
                    const parsed = obj.parse('Ns_Module#name');
                    assert.strictEqual(parsed.mapKey, undefined);
                    assert.strictEqual(parsed.nameExport, 'name');
                    assert.strictEqual(parsed.nameModule, 'Ns_Module');
                    assert.strictEqual(parsed.namePackage, undefined);
                    assert.strictEqual(parsed.orig, 'Ns_Module#name');
                    assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_LOGICAL);
                    assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_EXPORT);
                });
                it('singleton (Ns_Module#name$)', async () => {
                    const parsed = obj.parse('Ns_Module#name$');
                    assert.strictEqual(parsed.mapKey, 'Ns_Module#name');
                    assert.strictEqual(parsed.nameExport, 'name');
                    assert.strictEqual(parsed.nameModule, 'Ns_Module');
                    assert.strictEqual(parsed.namePackage, undefined);
                    assert.strictEqual(parsed.orig, 'Ns_Module#name$');
                    assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_LOGICAL);
                    assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_SINGLETON);
                });
                it('factory (Ns_Module#name$$)', async () => {
                    const parsed = obj.parse('Ns_Module#name$$');
                    assert.strictEqual(parsed.mapKey, 'Ns_Module#name');
                    assert.strictEqual(parsed.nameExport, 'name');
                    assert.strictEqual(parsed.nameModule, 'Ns_Module');
                    assert.strictEqual(parsed.namePackage, undefined);
                    assert.strictEqual(parsed.orig, 'Ns_Module#name$$');
                    assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_LOGICAL);
                    assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_FACTORY);
                });
            });

            describe('default export:', () => {
                it('simple (Ns_Module#)', async () => {
                    const parsed = obj.parse('Ns_Module#');
                    assert.strictEqual(parsed.mapKey, undefined);
                    assert.strictEqual(parsed.nameExport, 'default');
                    assert.strictEqual(parsed.nameModule, 'Ns_Module');
                    assert.strictEqual(parsed.namePackage, undefined);
                    assert.strictEqual(parsed.orig, 'Ns_Module#');
                    assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_LOGICAL);
                    assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_EXPORT);
                });
                it('singleton (Ns_Module$)', async () => {
                    const parsed = obj.parse('Ns_Module$');
                    assert.strictEqual(parsed.mapKey, 'Ns_Module');
                    assert.strictEqual(parsed.nameExport, 'default');
                    assert.strictEqual(parsed.nameModule, 'Ns_Module');
                    assert.strictEqual(parsed.namePackage, undefined);
                    assert.strictEqual(parsed.orig, 'Ns_Module$');
                    assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_LOGICAL);
                    assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_SINGLETON);
                });
                it('factory (Ns_Module$$)', async () => {
                    const parsed = obj.parse('Ns_Module$$');
                    assert.strictEqual(parsed.mapKey, 'Ns_Module');
                    assert.strictEqual(parsed.nameExport, 'default');
                    assert.strictEqual(parsed.nameModule, 'Ns_Module');
                    assert.strictEqual(parsed.namePackage, undefined);
                    assert.strictEqual(parsed.orig, 'Ns_Module$$');
                    assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_LOGICAL);
                    assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_FACTORY);
                });
            });

        });
    });

    describe('should parse Filesystem NS:', () => {
        describe('module ID:', () => {
            it('simple (@vendor/package!module)', async () => {
                const parsed = obj.parse('@vendor/package!module');
                assert.strictEqual(parsed.mapKey, '@vendor/package!module');
                assert.strictEqual(parsed.nameExport, undefined);
                assert.strictEqual(parsed.nameModule, 'module');
                assert.strictEqual(parsed.namePackage, '@vendor/package');
                assert.strictEqual(parsed.orig, '@vendor/package!module');
                assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_FILEPATH);
                assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_MODULE);
            });

            describe('named export:', () => {
                it('simple (@vendor/package!module#name)', async () => {
                    const parsed = obj.parse('@vendor/package!module#name');
                    assert.strictEqual(parsed.mapKey, undefined);
                    assert.strictEqual(parsed.nameExport, 'name');
                    assert.strictEqual(parsed.nameModule, 'module');
                    assert.strictEqual(parsed.namePackage, '@vendor/package');
                    assert.strictEqual(parsed.orig, '@vendor/package!module#name');
                    assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_FILEPATH);
                    assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_EXPORT);
                });
                it('singleton (@vendor/package!module#name$)', async () => {
                    const parsed = obj.parse('@vendor/package!module#name$');
                    assert.strictEqual(parsed.mapKey, '@vendor/package!module#name');
                    assert.strictEqual(parsed.nameExport, 'name');
                    assert.strictEqual(parsed.nameModule, 'module');
                    assert.strictEqual(parsed.namePackage, '@vendor/package');
                    assert.strictEqual(parsed.orig, '@vendor/package!module#name$');
                    assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_FILEPATH);
                    assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_SINGLETON);
                });
                it('factory (@vendor/package!module#name$$)', async () => {
                    const parsed = obj.parse('@vendor/package!module#name$$');
                    assert.strictEqual(parsed.mapKey, '@vendor/package!module#name');
                    assert.strictEqual(parsed.nameExport, 'name');
                    assert.strictEqual(parsed.nameModule, 'module');
                    assert.strictEqual(parsed.namePackage, '@vendor/package');
                    assert.strictEqual(parsed.orig, '@vendor/package!module#name$$');
                    assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_FILEPATH);
                    assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_FACTORY);
                });
            });

            describe('default export:', () => {
                it('simple (@vendor/package!module#)', async () => {
                    const parsed = obj.parse('@vendor/package!module#');
                    assert.strictEqual(parsed.mapKey, undefined);
                    assert.strictEqual(parsed.nameExport, 'default');
                    assert.strictEqual(parsed.nameModule, 'module');
                    assert.strictEqual(parsed.namePackage, '@vendor/package');
                    assert.strictEqual(parsed.orig, '@vendor/package!module#');
                    assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_FILEPATH);
                    assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_EXPORT);
                });
                it('singleton (@vendor/package!module$)', async () => {
                    const parsed = obj.parse('@vendor/package!module$');
                    assert.strictEqual(parsed.mapKey, '@vendor/package!module');
                    assert.strictEqual(parsed.nameExport, 'default');
                    assert.strictEqual(parsed.nameModule, 'module');
                    assert.strictEqual(parsed.namePackage, '@vendor/package');
                    assert.strictEqual(parsed.orig, '@vendor/package!module$');
                    assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_FILEPATH);
                    assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_SINGLETON);
                });
                it('factory (@vendor/package!module$$)', async () => {
                    const parsed = obj.parse('@vendor/package!module$$');
                    assert.strictEqual(parsed.mapKey, '@vendor/package!module');
                    assert.strictEqual(parsed.nameExport, 'default');
                    assert.strictEqual(parsed.nameModule, 'module');
                    assert.strictEqual(parsed.namePackage, '@vendor/package');
                    assert.strictEqual(parsed.orig, '@vendor/package!module$$');
                    assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_FILEPATH);
                    assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_FACTORY);
                });
            });

        });
    });

});
