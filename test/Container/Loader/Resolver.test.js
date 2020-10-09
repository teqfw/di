import Resolver from '../../../src/Container/Loader/Resolver';
import {describe, it} from 'mocha';
import assert from 'assert';


describe('TeqFw_Di_Container_Loader_Resolver', () => {
    /** @type {TeqFw_Di_Container_Loader_Resolver} */
    const obj = new Resolver();

    it('has right classname', (done) => {
        assert.strictEqual(obj.constructor.name, 'TeqFw_Di_Container_Loader_Resolver');
        done();
    });

    it('has all expected public methods in prototype', (done) => {
        const methods = Object.getOwnPropertyNames(obj.__proto__)
            .filter(p => (typeof obj[p] === 'function' && p !== 'constructor'));
        assert.deepStrictEqual(methods, [
            'addNamespaceRoot',
            'getSourceById',
            'list'
        ]);
        done();
    });

    it('allows to registry and to resolve namespaces', (done) => {
        obj.addNamespaceRoot({ns: 'Vendor_Project_App', path: './path/to/app/root', ext: 'js'});
        obj.addNamespaceRoot({ns: 'Vendor_Project_App_Module', path: './path/to/mod/root', ext: 'mjs'});
        const pathApp = obj.getSourceById('Vendor_Project_App_Type');
        const pathMod = obj.getSourceById('Vendor_Project_App_Module_Type');
        assert.strictEqual(pathApp, './path/to/app/root/Type.js');
        assert.strictEqual(pathMod, './path/to/mod/root/Type.mjs');
        done();
    });

    it('lists namespaces mapping', (done) => {
        const resolver = new Resolver();
        resolver.addNamespaceRoot({
            ns: 'Vendor_Project_Module_Class',
            path: './path/to/sources',
            ext: 'mjs',
            is_absolute: false
        });
        const mapping = resolver.list();
        assert.deepStrictEqual(mapping, {
            'Vendor_Project_Module_Class': {
                'ext': 'mjs',
                'is_absolute': false,
                'path': './path/to/sources'
            }
        });
        done();
    });
});
