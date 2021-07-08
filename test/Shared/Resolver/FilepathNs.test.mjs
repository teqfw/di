import FilepathNs from '../../../src/Shared/Resolver/FilepathNs.mjs';
import DAutoload from '../../../src/Shared/Api/Dto/Plugin/Desc/Autoload.mjs';
import {describe, it} from 'mocha';
import assert from 'assert';


describe('TeqFw_Di_Shared_Resolver_FilepathNs', () => {
    /** @type {TeqFw_Di_Shared_Resolver_FilepathNs} */
    const obj = new FilepathNs();

    it('has right classname', async () => {
        assert.strictEqual(obj.constructor.name, 'TeqFw_Di_Shared_Resolver_FilepathNs');
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
        obj.addNamespaceRoot(Object.assign(new DAutoload(), {
            ns: 'package',
            path: './path/to/package/src',
            ext: 'js',
            isAbsolute: false
        }));
        obj.addNamespaceRoot(Object.assign(new DAutoload(), {
            ns: '@vendor/package',
            path: 'https://domain.com/lib/@vendor/package/dist',
            ext: 'mjs',
            isAbsolute: true
        }));
        const pathPkg = obj.resolveModuleId('package!path/to/module');
        const pathVnd = obj.resolveModuleId('@vendor/package!path/to/module');
        assert.strictEqual(pathPkg, './path/to/package/src/path/to/module.js');
        assert.strictEqual(pathVnd, 'https://domain.com/lib/@vendor/package/dist/path/to/module.mjs');
    });

    it('lists namespaces mapping', async () => {
        const resolver = new FilepathNs();
        const details = Object.assign(new DAutoload(), {
            ns: '@vendor/package',
            path: '/path/to/sources',
            ext: 'mjs',
            isAbsolute: true
        });
        resolver.addNamespaceRoot(details);
        const mapping = resolver.list();
        const detailsOut = mapping['@vendor/package'];
        assert.deepStrictEqual(details, detailsOut);
    });
});
