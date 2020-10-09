import Util from '../src/Util';
import {describe, it} from 'mocha';
import assert from 'assert';

describe('TeqFw_Di_Util', () => {
    /** @type {TeqFw_Di_Util} */
    const obj = new Util();

    it('has right classname', (done) => {
        assert.strictEqual(obj.constructor.name, 'TeqFw_Di_Util');
        done();
    });

    it('has all expected public methods in prototype', (done) => {
        const methods = Object.getOwnPropertyNames(obj.__proto__)
            .filter(p => (typeof obj[p] === 'function' && p !== 'constructor'));
        assert.deepStrictEqual(methods, ['parseId']);
        done();
    });

    it('should reject invalid IDs', (done) => {
        assert.throws(
            () => {
                obj.parseId('1Vendor_Project_Module_Dependency');
            },
            /Invalid identifier: '1Vendor_Project_Module_Dependency'./
        );
        done();
    });

    it('should parse all parts of ID', (done) => {
        const parts = obj.parseId('plugin$$Vendor_Project_Module_Dependency$name');
        assert.deepStrictEqual(parts, {
            id: 'plugin$$Vendor_Project_Module_Dependency$name',
            source_part: 'Vendor_Project_Module_Dependency',
            is_instance: true,
            instance_name: 'name',
            plugin: 'plugin'
        });
        done();
    });

    it('should parse new instance ID', (done) => {
        const parts = obj.parseId('Vendor_Project_Module_Dependency');
        assert.deepStrictEqual(parts, {
            id: 'Vendor_Project_Module_Dependency',
            source_part: 'Vendor_Project_Module_Dependency',
            is_instance: false,
            instance_name: '',
            plugin: undefined
        });
        done();
    });

    it('should parse singleton ID', (done) => {
        const parts = obj.parseId('Vendor_Project_Module_Dependency$');
        assert.deepStrictEqual(parts, {
            id: 'Vendor_Project_Module_Dependency$',
            source_part: 'Vendor_Project_Module_Dependency',
            is_instance: true,
            instance_name: '',
            plugin: undefined
        });
        done();
    });

    it('should parse named singleton ID', (done) => {
        const parts = obj.parseId('Vendor_Project_Module_Dependency$name');
        assert.deepStrictEqual(parts, {
            id: 'Vendor_Project_Module_Dependency$name',
            source_part: 'Vendor_Project_Module_Dependency',
            is_instance: true,
            instance_name: 'name',
            plugin: undefined
        });
        done();
    });

});
