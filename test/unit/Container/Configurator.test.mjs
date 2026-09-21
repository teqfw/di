import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

import TeqFw_Di_Parser from '../../../src/Parser.mjs';
import {Factory as ContainerConfigFactory} from '../../../src/Dto/Container/Config.mjs';
import {Factory as DepIdFactory} from '../../../src/Dto/DepId.mjs';
import {Factory as ModuleRouterConfigFactory} from '../../../src/Dto/ModuleRouter/Config.mjs';
import TeqFw_Di_Container_Canonicalizer from '../../../src/Container/Canonicalizer.mjs';
import {configureContainer} from '../../../src/Container/Configurator.mjs';
import TeqFw_Di_Container_Hardener from '../../../src/Container/Hardener.mjs';
import TeqFw_Di_Container_ModuleLoader from '../../../src/Container/ModuleLoader.mjs';
import TeqFw_Di_Container_ModuleRouter from '../../../src/Container/ModuleRouter.mjs';
import TeqFw_Di_Container_Postprocessor from '../../../src/Container/Postprocessor.mjs';
import TeqFw_Di_Container_Producer from '../../../src/Container/Producer.mjs';
import TeqFw_Di_Container_Wrapper from '../../../src/Container/Wrapper.mjs';
import {TeqFw_Di_Internal_Logger_Noop} from '../../../src/Internal/Logger.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURE_DIR = path.resolve(__dirname, '../../integration/fixture');

describe('TeqFw_Di_Container_Configurator', () => {
    it('materializes ordered policy producers with default policy before they are installed', async () => {
        const config = new ContainerConfigFactory().create({
            namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}],
            preprocessors: ['Fx_PolicyPreprocessor$'],
            postprocessors: ['Fx_PolicyPostprocessor$'],
        });
        const parser = new TeqFw_Di_Parser();
        const canonicalizer = new TeqFw_Di_Container_Canonicalizer({
            parser,
            depIdFactory: new DepIdFactory(),
        });
        const postprocessor = new TeqFw_Di_Container_Postprocessor();
        const moduleRouter = new TeqFw_Di_Container_ModuleRouter({
            config: new ModuleRouterConfigFactory().create({namespaces: [...config.namespaces]}),
        });

        await configureContainer({
            config,
            canonicalizer,
            moduleRouter,
            moduleLoader: new TeqFw_Di_Container_ModuleLoader(),
            producer: new TeqFw_Di_Container_Producer(),
            wrapper: new TeqFw_Di_Container_Wrapper(),
            hardener: new TeqFw_Di_Container_Hardener(),
            postprocessor,
            logger: TeqFw_Di_Internal_Logger_Noop,
        });

        const effective = canonicalizer.canonicalize('Fx_ConfigAlias$').effective;
        const adapted = postprocessor.apply({name: 'root'}, /** @type {any} */ ({}));

        assert.equal(effective.address, 'Fx_Root');
        assert.deepStrictEqual(adapted, {name: 'root', policyPostprocessed: true});
    });

    it('does not install partially materialized policy after a producer failure', async () => {
        const config = new ContainerConfigFactory().create({
            namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}],
            preprocessors: ['Fx_PolicyPreprocessor$', 'Fx_MissingPolicy$'],
        });
        const canonicalizer = new TeqFw_Di_Container_Canonicalizer({
            parser: new TeqFw_Di_Parser(),
            depIdFactory: new DepIdFactory(),
        });
        const postprocessor = new TeqFw_Di_Container_Postprocessor();

        await assert.rejects(() => configureContainer({
            config,
            canonicalizer,
            moduleRouter: new TeqFw_Di_Container_ModuleRouter({
                config: new ModuleRouterConfigFactory().create({namespaces: [...config.namespaces]}),
            }),
            moduleLoader: new TeqFw_Di_Container_ModuleLoader(),
            producer: new TeqFw_Di_Container_Producer(),
            wrapper: new TeqFw_Di_Container_Wrapper(),
            hardener: new TeqFw_Di_Container_Hardener(),
            postprocessor,
            logger: TeqFw_Di_Internal_Logger_Noop,
        }), /MissingPolicy\.mjs/);

        assert.equal(canonicalizer.canonicalize('Fx_ConfigAlias$').effective.address, 'Fx_ConfigAlias');
        assert.equal(postprocessor.count(), 0);
    });
});
