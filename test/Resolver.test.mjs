import Resolver from '../src/Resolver.mjs';
import ResolveDetails from '../src/Api/ResolveDetails.mjs';
import {describe, it} from 'mocha';
import assert from 'assert';


describe('TeqFw_Di_Resolver', () => {
    /** @type {TeqFw_Di_Resolver} */
    const obj = new Resolver();

    it('has right classname', async () => {
        assert.strictEqual(obj.constructor.name, 'TeqFw_Di_Resolver');
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
            ns: 'package',
            path: './path/to/package/src',
            ext: 'js',
            isAbsolute: false
        }));
        obj.addNamespaceRoot(Object.assign(new ResolveDetails(), {
            ns: '@vendor/package',
            path: 'https://domain.com/lib/@vendor/package/dist',
            ext: 'mjs',
            isAbsolute: true
        }));
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
        const pathPkg = obj.resolveModuleId('package!path/to/module');
        const pathVnd = obj.resolveModuleId('@vendor/package!path/to/module');
        const pathMod = obj.resolveModuleId('Ns_App_Some_Mod');
        const pathUtil = obj.resolveModuleId('Ns_App_Project_Mod_Util');
        assert.strictEqual(pathPkg, './path/to/package/src/path/to/module.js');
        assert.strictEqual(pathVnd, 'https://domain.com/lib/@vendor/package/dist/path/to/module.mjs');
        assert.strictEqual(pathMod, './path/to/package/src/Some/Mod.js');
        assert.strictEqual(pathUtil, './path/to/other/pkg/src/Mod/Util.mjs');
    });

    it('lists namespaces mapping', async () => {
        const resolver = new Resolver();
        const detailsFile = Object.assign(new ResolveDetails(), {
            ns: '@vendor/package',
            path: '/path/to/sources',
            ext: 'mjs',
            isAbsolute: true
        });
        const detailsLogical = Object.assign(new ResolveDetails(), {
            ns: 'Ns_App',
            path: '/path/to/sources',
            ext: 'mjs',
            isAbsolute: true
        });
        resolver.addNamespaceRoot(detailsFile);
        resolver.addNamespaceRoot(detailsLogical);
        const {filepathNs, logicalNs} = resolver.list();
        assert.deepStrictEqual(detailsFile, filepathNs['@vendor/package']);
        assert.deepStrictEqual(detailsLogical, logicalNs['Ns_App']);
    });
});
