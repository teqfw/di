import assert from 'assert';
import ModuleLoader from '../../src/Shared/ModuleLoader.mjs';
import ResolveDetails from '../../src/Back/Api/Dto/Resolve.mjs';
import Resolver from '../../src/Shared/Resolver.mjs';
import {describe, it} from 'mocha';
import {dirname, join} from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_ROOT = join(__dirname, '../.data');

describe('TeqFw_Di_Shared_ModuleLoader', function () {

    it('has right classname', async () => {
        const resolver = new Resolver();
        const loader = new ModuleLoader(resolver);
        assert.strictEqual(loader.constructor.name, 'TeqFw_Di_Shared_ModuleLoader');
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
        nsMap.path = join(DATA_ROOT, 'ModuleLoader');
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
        nsMap.path = join(DATA_ROOT, 'ModuleLoader');
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
