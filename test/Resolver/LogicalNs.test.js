import LogicalNs from '../../src/Resolver/LogicalNs.mjs';
import ResolveDetails from '../../src/Api/ResolveDetails.mjs';
import {describe, it} from 'mocha';
import assert from 'assert';


describe('TeqFw_Di_Resolver_LogicalNs', () => {
    /** @type {TeqFw_Di_Resolver_LogicalNs} */
    const obj = new LogicalNs();

    it('has right classname', async () => {
        assert.strictEqual(obj.constructor.name, 'TeqFw_Di_Resolver_LogicalNs');
    });

    it('has all expected public methods in prototype', async () => {
        const methods = Object.getOwnPropertyNames(obj.__proto__)
            .filter(p => (typeof obj[p] === 'function' && p !== 'constructor'));
        assert.deepStrictEqual(methods.sort(), [
            'addNamespaceRoot',
            'list',
            'resolveModuleId',
        ]);
    });

    it('allows to registry and to resolve namespaces', async () => {
        obj.addNamespaceRoot(Object.assign(new ResolveDetails(), {
            ns: 'Ns_App',
            path: './path/to/package/src',
            ext: 'js',
            isAbsolute: false
        }));
        obj.addNamespaceRoot(Object.assign(new ResolveDetails(), {
            ns: 'Ns_App_Project',
            path: './path/to/other/pkg/src',
            ext: 'mjs',
            isAbsolute: false
        }));
        const pathPkg = obj.resolveModuleId('Ns_App_Some_Mod');
        const pathVnd = obj.resolveModuleId('Ns_App_Project_Mod_Util');
        assert.strictEqual(pathPkg, './path/to/package/src/Some/Mod.js');
        assert.strictEqual(pathVnd, './path/to/other/pkg/src/Mod/Util.mjs');
    });

    it('lists namespaces mapping', async () => {
        const resolver = new LogicalNs();
        const details = Object.assign(new ResolveDetails(), {
            ns: 'Ns_App',
            path: '/path/to/sources',
            ext: 'mjs',
            isAbsolute: true
        });
        resolver.addNamespaceRoot(details);
        const mapping = resolver.list();
        const detailsOut = mapping['Ns_App'];
        assert.deepStrictEqual(details, detailsOut);
    });
});
