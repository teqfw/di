import Resolver from '../src/Resolver';
import ResolveDetails from '../src/Api/ResolveDetails.mjs';
import {describe, it} from 'mocha';
import assert from 'assert';


describe('TeqFw_Di_Container_Resolver', () => {
    /** @type {TeqFw_Di_Container_Resolver} */
    const obj = new Resolver();

    it('has right classname', async () => {
        assert.strictEqual(obj.constructor.name, 'TeqFw_Di_Container_Resolver');
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
        const details = Object.assign(new ResolveDetails(), {
            ns: 'Vendor_Project_Module_Class',
            path: '/path/to/sources',
            ext: 'mjs',
            isAbsolute: true
        });
        resolver.addNamespaceRoot(details);
        const mapping = resolver.list();
        const detailsOut = mapping.Vendor_Project_Module_Class;
        assert.deepStrictEqual(details, detailsOut);
    });
});
