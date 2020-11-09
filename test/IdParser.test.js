import IdParser from '../src/IdParser.mjs';
import {describe, it} from 'mocha';
import assert from 'assert';

describe('TeqFw_Di_IdParser', () => {
    /** @type {TeqFw_Di_IdParser} */
    const obj = new IdParser();

    it('has right classname', (done) => {
        assert.strictEqual(obj.constructor.name, 'TeqFw_Di_IdParser');
        done();
    });

    it('has all expected public methods in prototype', (done) => {
        const methods = Object.getOwnPropertyNames(obj.__proto__)
            .filter(p => (typeof obj[p] === 'function' && p !== 'constructor'));
        assert.deepStrictEqual(methods, ['parse']);
        done();
    });

    it('should reject invalid IDs', (done) => {
        assert.throws(
            () => {
                obj.parse('1Vendor_Project_Module_Dependency');
            },
            /Invalid identifier: '1Vendor_Project_Module_Dependency'./
        );
        done();
    });

    it('should parse named object ID', (done) => {
        const parsed = obj.parse('dbConnection');
        assert.strictEqual(parsed.id, 'dbConnection');
        assert.strictEqual(parsed.isConstructor, false);
        assert.strictEqual(parsed.isModule, false);
        assert.strictEqual(parsed.isObjectId, true);
        assert.strictEqual(parsed.isSingleton, true);
        assert.strictEqual(parsed.moduleName, undefined);
        done();
    });

    it('should parse module ID', (done) => {
        const parsed = obj.parse('Vendor_Module');
        assert.strictEqual(parsed.id, 'Vendor_Module');
        assert.strictEqual(parsed.isConstructor, false);
        assert.strictEqual(parsed.isModule, true);
        assert.strictEqual(parsed.isObjectId, false);
        assert.strictEqual(parsed.isSingleton, false);
        assert.strictEqual(parsed.moduleName, 'Vendor_Module');
        done();
    });

    it('should parse new object constructor ID', (done) => {
        const parsed = obj.parse('Vendor_Module$');
        assert.strictEqual(parsed.id, 'Vendor_Module$');
        assert.strictEqual(parsed.isConstructor, true);
        assert.strictEqual(parsed.isModule, false);
        assert.strictEqual(parsed.isObjectId, false);
        assert.strictEqual(parsed.isSingleton, false);
        assert.strictEqual(parsed.moduleName, 'Vendor_Module');
        done();
    });

    it('should parse default export singleton ID', (done) => {
        const parsed = obj.parse('Vendor_Module$$');
        assert.strictEqual(parsed.id, 'Vendor_Module$$');
        assert.strictEqual(parsed.isConstructor, false);
        assert.strictEqual(parsed.isModule, false);
        assert.strictEqual(parsed.isObjectId, false);
        assert.strictEqual(parsed.isSingleton, true);
        assert.strictEqual(parsed.moduleName, 'Vendor_Module');
        done();
    });

});
