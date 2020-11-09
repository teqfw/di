import Resolver from '../../../src/Container/Loader/Resolver';
import TeqFw_Di_Api_ResolveDetails from '../../../src/Api/ResolveDetails.mjs';
import {describe, it} from 'mocha';
import assert from 'assert';


describe('TeqFw_Di_Container_Loader_Resolver', () => {
    /** @type {TeqFw_Di_Container_Loader_Resolver} */
    const obj = new Resolver();

    it('has right classname', async () => {
        assert.strictEqual(obj.constructor.name, 'TeqFw_Di_Container_Loader_Resolver');
    });

    it('has all expected public methods in prototype', async () => {
        const methods = Object.getOwnPropertyNames(obj.__proto__)
            .filter(p => (typeof obj[p] === 'function' && p !== 'constructor'));
        assert.deepStrictEqual(methods, [
            'addNamespaceRoot',
            'getSourceById',
            'list'
        ]);
    });

    it('allows to registry and to resolve namespaces', async () => {
        obj.addNamespaceRoot({ns: 'Vendor_Project_App', path: './path/to/app/root', ext: 'js', isAbsolute: false});
        obj.addNamespaceRoot({
            ns: 'Vendor_Project_App_Module',
            path: './path/to/mod/root',
            ext: 'mjs',
            isAbsolute: false
        });
        const pathApp = obj.getSourceById('Vendor_Project_App_Type');
        const pathMod = obj.getSourceById('Vendor_Project_App_Module_Type');
        assert.strictEqual(pathApp, './path/to/app/root/Type.js');
        assert.strictEqual(pathMod, './path/to/mod/root/Type.mjs');
    });

    it('lists namespaces mapping', async () => {
        const resolver = new Resolver();
        const data = {
            ns: 'Vendor_Project_Module_Class',
            path: '/path/to/sources',
            ext: 'mjs',
            isAbsolute: true
        };
        resolver.addNamespaceRoot(data);
        const mapping = resolver.list();
        const details = mapping.Vendor_Project_Module_Class;
        assert(details instanceof TeqFw_Di_Api_ResolveDetails);
        const props = Object.assign({}, details);
        assert.deepStrictEqual(props, data);
    });
});
