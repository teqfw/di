import IdParser from '../../src/Shared/IdParser.mjs';
import ParsedId from '../../src/Shared/IdParser/Dto.mjs';
import {describe, it} from 'mocha';
import assert from 'assert';

describe('TeqFw_Di_Shared_IdParser', () => {
    /** @type {TeqFw_Di_Shared_IdParser} */
    const obj = new IdParser();

    it('has right classname', async () => {
        assert.strictEqual(obj.constructor.name, 'TeqFw_Di_Shared_IdParser');
    });

    it('has all expected public methods in prototype', async () => {
        const methods = Object.getOwnPropertyNames(obj.__proto__)
            .filter(p => (typeof obj[p] === 'function' && p !== 'constructor'));
        assert.deepStrictEqual(methods.sort(), [
            'parse',
            'parseFilepathId',
            'parseLogicalNsId',
            'parseManualDiId',
        ]);
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
            const parsed = obj.parseManualDiId('namedSingleton');
            assert.strictEqual(parsed.mapKey, 'namedSingleton');
            assert.strictEqual(parsed.nameExport, undefined);
            assert.strictEqual(parsed.nameModule, undefined);
            assert.strictEqual(parsed.namePackage, undefined);
            assert.strictEqual(parsed.orig, 'namedSingleton');
            assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_MANUAL);
            assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_SINGLETON);
        });

        it('named constructor ID (namedFactory$$)', async () => {
            const parsed = obj.parseManualDiId('namedFactory$$');
            assert.strictEqual(parsed.mapKey, 'namedFactory');
            assert.strictEqual(parsed.nameExport, undefined);
            assert.strictEqual(parsed.nameModule, undefined);
            assert.strictEqual(parsed.namePackage, undefined);
            assert.strictEqual(parsed.orig, 'namedFactory$$');
            assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_MANUAL);
            assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_FACTORY);
        });
    });

    describe('should parse Logical IDs:', () => {

        describe('simple:', () => {
            it('simple (Ns_Module)', async () => {
                const parsed = obj.parseLogicalNsId('Ns_Module');
                assert.strictEqual(parsed.mapKey, 'Ns_Module');
                assert.strictEqual(parsed.nameExport, undefined);
                assert.strictEqual(parsed.nameModule, 'Ns_Module');
                assert.strictEqual(parsed.namePackage, undefined);
                assert.strictEqual(parsed.orig, 'Ns_Module');
                assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_LOGICAL);
                assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_MODULE);
            });
        });

        describe('new style (with .):', () => {

            describe('default export:', () => {
                it('simple (Ns_Module.)', async () => {
                    const parsed = obj.parseLogicalNsId('Ns_Module.');
                    assert.strictEqual(parsed.mapKey, undefined);
                    assert.strictEqual(parsed.nameExport, 'default');
                    assert.strictEqual(parsed.nameModule, 'Ns_Module');
                    assert.strictEqual(parsed.namePackage, undefined);
                    assert.strictEqual(parsed.orig, 'Ns_Module.');
                    assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_LOGICAL);
                    assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_EXPORT);
                });
                it('singleton (Ns_Module$)', async () => {
                    const parsed = obj.parseLogicalNsId('Ns_Module$');
                    assert.strictEqual(parsed.mapKey, 'Ns_Module');
                    assert.strictEqual(parsed.nameExport, 'default');
                    assert.strictEqual(parsed.nameModule, 'Ns_Module');
                    assert.strictEqual(parsed.namePackage, undefined);
                    assert.strictEqual(parsed.orig, 'Ns_Module$');
                    assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_LOGICAL);
                    assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_SINGLETON);
                });
                it('factory (Ns_Module$$)', async () => {
                    const parsed = obj.parseLogicalNsId('Ns_Module$$');
                    assert.strictEqual(parsed.mapKey, 'Ns_Module');
                    assert.strictEqual(parsed.nameExport, 'default');
                    assert.strictEqual(parsed.nameModule, 'Ns_Module');
                    assert.strictEqual(parsed.namePackage, undefined);
                    assert.strictEqual(parsed.orig, 'Ns_Module$$');
                    assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_LOGICAL);
                    assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_FACTORY);
                });
            });

            describe('named export:', () => {
                it('simple (Ns_Module.name)', async () => {
                    const parsed = obj.parseLogicalNsId('Ns_Module.name');
                    assert.strictEqual(parsed.mapKey, undefined);
                    assert.strictEqual(parsed.nameExport, 'name');
                    assert.strictEqual(parsed.nameModule, 'Ns_Module');
                    assert.strictEqual(parsed.namePackage, undefined);
                    assert.strictEqual(parsed.orig, 'Ns_Module.name');
                    assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_LOGICAL);
                    assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_EXPORT);
                });
                it('singleton (Ns_Module.name$)', async () => {
                    const parsed = obj.parseLogicalNsId('Ns_Module.name$');
                    assert.strictEqual(parsed.mapKey, 'Ns_Module.name');
                    assert.strictEqual(parsed.nameExport, 'name');
                    assert.strictEqual(parsed.nameModule, 'Ns_Module');
                    assert.strictEqual(parsed.namePackage, undefined);
                    assert.strictEqual(parsed.orig, 'Ns_Module.name$');
                    assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_LOGICAL);
                    assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_SINGLETON);
                });
                it('factory (Ns_Module.name$$)', async () => {
                    const parsed = obj.parseLogicalNsId('Ns_Module.name$$');
                    assert.strictEqual(parsed.mapKey, 'Ns_Module.name');
                    assert.strictEqual(parsed.nameExport, 'name');
                    assert.strictEqual(parsed.nameModule, 'Ns_Module');
                    assert.strictEqual(parsed.namePackage, undefined);
                    assert.strictEqual(parsed.orig, 'Ns_Module.name$$');
                    assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_LOGICAL);
                    assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_FACTORY);
                });
            });

        });

        describe('old style (with #):', () => {

            describe('default export:', () => {
                it('simple (Ns_Module#)', async () => {
                    const parsed = obj.parseLogicalNsId('Ns_Module#');
                    assert.strictEqual(parsed.mapKey, undefined);
                    assert.strictEqual(parsed.nameExport, 'default');
                    assert.strictEqual(parsed.nameModule, 'Ns_Module');
                    assert.strictEqual(parsed.namePackage, undefined);
                    assert.strictEqual(parsed.orig, 'Ns_Module#');
                    assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_LOGICAL);
                    assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_EXPORT);
                });
            });

            describe('named export:', () => {
                it('simple (Ns_Module#name)', async () => {
                    const parsed = obj.parseLogicalNsId('Ns_Module#name');
                    assert.strictEqual(parsed.mapKey, undefined);
                    assert.strictEqual(parsed.nameExport, 'name');
                    assert.strictEqual(parsed.nameModule, 'Ns_Module');
                    assert.strictEqual(parsed.namePackage, undefined);
                    assert.strictEqual(parsed.orig, 'Ns_Module#name');
                    assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_LOGICAL);
                    assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_EXPORT);
                });
                it('singleton (Ns_Module#name$)', async () => {
                    const parsed = obj.parseLogicalNsId('Ns_Module#name$');
                    assert.strictEqual(parsed.mapKey, 'Ns_Module.name');
                    assert.strictEqual(parsed.nameExport, 'name');
                    assert.strictEqual(parsed.nameModule, 'Ns_Module');
                    assert.strictEqual(parsed.namePackage, undefined);
                    assert.strictEqual(parsed.orig, 'Ns_Module#name$');
                    assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_LOGICAL);
                    assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_SINGLETON);
                });
                it('factory (Ns_Module#name$$)', async () => {
                    const parsed = obj.parseLogicalNsId('Ns_Module#name$$');
                    assert.strictEqual(parsed.mapKey, 'Ns_Module.name');
                    assert.strictEqual(parsed.nameExport, 'name');
                    assert.strictEqual(parsed.nameModule, 'Ns_Module');
                    assert.strictEqual(parsed.namePackage, undefined);
                    assert.strictEqual(parsed.orig, 'Ns_Module#name$$');
                    assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_LOGICAL);
                    assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_FACTORY);
                });
            });

        });

    });

    describe('should parse Filepath based NS:', () => {
        describe('module ID:', () => {
            it('package only (package)', async () => {
                const parsed = obj.parseFilepathId('package');
                assert.strictEqual(parsed.mapKey, undefined);
                assert.strictEqual(parsed.nameExport, undefined);
                assert.strictEqual(parsed.nameModule, undefined);
                assert.strictEqual(parsed.namePackage, 'package');
                assert.strictEqual(parsed.orig, 'package');
                assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_FILEPATH);
                assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_PACKAGE);
            });

            it('vendor/package only (@vendor/package)', async () => {
                const parsed = obj.parseFilepathId('@vendor/package');
                assert.strictEqual(parsed.mapKey, undefined);
                assert.strictEqual(parsed.nameExport, undefined);
                assert.strictEqual(parsed.nameModule, undefined);
                assert.strictEqual(parsed.namePackage, '@vendor/package');
                assert.strictEqual(parsed.orig, '@vendor/package');
                assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_FILEPATH);
                assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_PACKAGE);
            });

            it('simple (@vendor/package!module)', async () => {
                const parsed = obj.parseFilepathId('@vendor/package!module');
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
                    const parsed = obj.parseFilepathId('@vendor/package!module#name');
                    assert.strictEqual(parsed.mapKey, undefined);
                    assert.strictEqual(parsed.nameExport, 'name');
                    assert.strictEqual(parsed.nameModule, 'module');
                    assert.strictEqual(parsed.namePackage, '@vendor/package');
                    assert.strictEqual(parsed.orig, '@vendor/package!module#name');
                    assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_FILEPATH);
                    assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_EXPORT);
                });
                it('singleton (@vendor/package!module#name$)', async () => {
                    const parsed = obj.parseFilepathId('@vendor/package!module#name$');
                    assert.strictEqual(parsed.mapKey, '@vendor/package!module#name');
                    assert.strictEqual(parsed.nameExport, 'name');
                    assert.strictEqual(parsed.nameModule, 'module');
                    assert.strictEqual(parsed.namePackage, '@vendor/package');
                    assert.strictEqual(parsed.orig, '@vendor/package!module#name$');
                    assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_FILEPATH);
                    assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_SINGLETON);
                });
                it('factory (@vendor/package!module#name$$)', async () => {
                    const parsed = obj.parseFilepathId('@vendor/package!module#name$$');
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
                    const parsed = obj.parseFilepathId('@vendor/package!module#');
                    assert.strictEqual(parsed.mapKey, undefined);
                    assert.strictEqual(parsed.nameExport, 'default');
                    assert.strictEqual(parsed.nameModule, 'module');
                    assert.strictEqual(parsed.namePackage, '@vendor/package');
                    assert.strictEqual(parsed.orig, '@vendor/package!module#');
                    assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_FILEPATH);
                    assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_EXPORT);
                });
                it('singleton (@vendor/package!module$)', async () => {
                    const parsed = obj.parseFilepathId('@vendor/package!module$');
                    assert.strictEqual(parsed.mapKey, '@vendor/package!module');
                    assert.strictEqual(parsed.nameExport, 'default');
                    assert.strictEqual(parsed.nameModule, 'module');
                    assert.strictEqual(parsed.namePackage, '@vendor/package');
                    assert.strictEqual(parsed.orig, '@vendor/package!module$');
                    assert.strictEqual(parsed.typeId, ParsedId.TYPE_ID_FILEPATH);
                    assert.strictEqual(parsed.typeTarget, ParsedId.TYPE_TARGET_SINGLETON);
                });
                it('factory (@vendor/package!module$$)', async () => {
                    const parsed = obj.parseFilepathId('@vendor/package!module$$');
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
