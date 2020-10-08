import Util from '../src/Util';
import {describe, it} from 'mocha';
import assert from 'assert';

describe('TeqFw_Di_Util', () => {

    const util = new Util();

    it('has right classname', (done) => {
        assert.strictEqual(Util.name, 'TeqFw_Di_Util');
        done();
    });

    it('has all expected public methods', (done) => {
        const methods = Object.getOwnPropertyNames(util).filter(p => (typeof util[p] === 'function'));
        assert.deepStrictEqual(methods, ['parseId']);
        done();
    });

    it('should reject invalid IDs', (done) => {
        assert.throws(() => {
                util.parseId('1Vendor_Project_Module_Dependency');
            },
            /Invalid identifier: '1Vendor_Project_Module_Dependency'./
        );
        done();
    });

    it('should parse all parts of ID', function (done) {
        const parts = util.parseId('plugin$$Vendor_Project_Module_Dependency$name');
        assert.deepStrictEqual(parts, {
            id: 'plugin$$Vendor_Project_Module_Dependency$name',
            source_part: 'Vendor_Project_Module_Dependency',
            is_instance: true,
            instance_name: 'name',
            plugin: 'plugin'
        });
        done();
    });

    it('should parse new instance ID', function (done) {
        const parts = util.parseId('Vendor_Project_Module_Dependency');
        assert.deepStrictEqual(parts, {
            id: 'Vendor_Project_Module_Dependency',
            source_part: 'Vendor_Project_Module_Dependency',
            is_instance: false,
            instance_name: "",
            plugin: undefined
        });
        done();
    });

    it('should parse singleton ID', function (done) {
        const parts = util.parseId('Vendor_Project_Module_Dependency$');
        assert.deepStrictEqual(parts, {
            id: 'Vendor_Project_Module_Dependency$',
            source_part: 'Vendor_Project_Module_Dependency',
            is_instance: true,
            instance_name: "",
            plugin: undefined
        });
        done();
    });

    it('should parse named singleton ID', function (done) {
        const parts = util.parseId('Vendor_Project_Module_Dependency$name');
        assert.deepStrictEqual(parts, {
            id: 'Vendor_Project_Module_Dependency$name',
            source_part: 'Vendor_Project_Module_Dependency',
            is_instance: true,
            instance_name: 'name',
            plugin: undefined
        });
        done();
    });

})
;
