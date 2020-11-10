import IdParser from '../src/IdParser.mjs';
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

    it('should parse named singleton ID', async () => {
        const parsed = obj.parse('namedSingleton');
        assert.strictEqual(parsed.isConstructor, false);
        assert.strictEqual(parsed.isModule, false);
        assert.strictEqual(parsed.isNamedObject, true);
        assert.strictEqual(parsed.isSingleton, true);
        assert.strictEqual(parsed.mapKey, 'namedSingleton');
        assert.strictEqual(parsed.moduleName, undefined);
        assert.strictEqual(parsed.orig, 'namedSingleton');
    });

    it('should parse named constructor ID', async () => {
        const parsed = obj.parse('namedConstructor$');
        assert.strictEqual(parsed.isConstructor, true);
        assert.strictEqual(parsed.isModule, false);
        assert.strictEqual(parsed.isNamedObject, true);
        assert.strictEqual(parsed.isSingleton, false);
        assert.strictEqual(parsed.mapKey, 'namedConstructor');
        assert.strictEqual(parsed.moduleName, undefined);
        assert.strictEqual(parsed.orig, 'namedConstructor$');
    });

    it('should parse module ID', async () => {
        const parsed = obj.parse('Vendor_Module');
        assert.strictEqual(parsed.isConstructor, false);
        assert.strictEqual(parsed.isModule, true);
        assert.strictEqual(parsed.isNamedObject, false);
        assert.strictEqual(parsed.isSingleton, false);
        assert.strictEqual(parsed.mapKey, 'Vendor_Module');
        assert.strictEqual(parsed.moduleName, 'Vendor_Module');
        assert.strictEqual(parsed.orig, 'Vendor_Module');
    });

    it('should parse default export constructor ID', async () => {
        const parsed = obj.parse('Vendor_Module$');
        assert.strictEqual(parsed.isConstructor, true);
        assert.strictEqual(parsed.isModule, false);
        assert.strictEqual(parsed.isNamedObject, false);
        assert.strictEqual(parsed.isSingleton, false);
        assert.strictEqual(parsed.mapKey, 'Vendor_Module');
        assert.strictEqual(parsed.moduleName, 'Vendor_Module');
        assert.strictEqual(parsed.orig, 'Vendor_Module$');
    });

    it('should parse default export singleton ID', async () => {
        const parsed = obj.parse('Vendor_Module$$');
        assert.strictEqual(parsed.isConstructor, false);
        assert.strictEqual(parsed.isModule, false);
        assert.strictEqual(parsed.isNamedObject, false);
        assert.strictEqual(parsed.isSingleton, true);
        assert.strictEqual(parsed.mapKey, 'Vendor_Module');
        assert.strictEqual(parsed.moduleName, 'Vendor_Module');
        assert.strictEqual(parsed.orig, 'Vendor_Module$$');
    });

});
