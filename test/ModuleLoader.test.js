import ModuleLoader from '../src/ModuleLoader.mjs';
import ResolveDetails from '../src/Api/ResolveDetails.mjs';
import Resolver from '../src/Resolver.mjs';
import {describe, it} from 'mocha';
import assert from 'assert';

describe('TeqFw_Di_ModuleLoader', function () {

    it('has right classname', async () => {
        const resolver = new Resolver();
        const loader = new ModuleLoader(resolver);
        assert.strictEqual(loader.constructor.name, 'TeqFw_Di_ModuleLoader');
    });

    it('has all expected public methods', async () => {
        const resolver = new Resolver();
        const loader = new ModuleLoader(resolver);
        const methods = Object.getOwnPropertyNames(loader)
            .filter(p => (typeof loader[p] === 'function'));
        assert.deepStrictEqual(methods.sort(), [
            'getModule',
        ]);
    });

    it('allows to load modules', async () => {
        const resolver = new Resolver();
        const nsMap = new ResolveDetails();
        nsMap.ns = '@flancer64/test';
        nsMap.ext = 'mjs';
        nsMap.path = __dirname + '/.data/ModuleLoader';
        nsMap.isAbsolute = true;
        resolver.addNamespaceRoot(nsMap);
        const loader = new ModuleLoader(resolver);
        const module = await loader.getModule('@flancer64/test!path/to/main');
        const def = module.default;
        assert(def.prototype.constructor.name === 'Default');
    });

    it('throws exception on unknown module', async () => {
        const resolver = new Resolver();
        const nsMap = new ResolveDetails();
        nsMap.ns = '@flancer64/test';
        nsMap.ext = 'mjs';
        nsMap.path = __dirname + '/.data/ModuleLoader';
        nsMap.isAbsolute = true;
        resolver.addNamespaceRoot(nsMap);
        const loader = new ModuleLoader(resolver);
        try {
            await loader.getModule('@flancer64/test!path/to/unknown');
            assert(false);
        } catch (e) {
            assert(/^Cannot find module \.*/.test(e.message));
        }
    });

});
