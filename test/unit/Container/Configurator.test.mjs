import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import TeqFw_Di_Parser from '../../../src/Parser.mjs';
import {Factory as ContainerConfigFactory} from '../../../src/Dto/Container/Config.mjs';
import {Factory as DepIdFactory} from '../../../src/Dto/DepId.mjs';
import TeqFw_Di_Container_Canonicalizer from '../../../src/Container/Canonicalizer.mjs';
import {configureContainer} from '../../../src/Container/Configurator.mjs';
import TeqFw_Di_Container_Hardener from '../../../src/Container/Hardener.mjs';
import TeqFw_Di_Container_Postprocessor from '../../../src/Container/Postprocessor.mjs';
import TeqFw_Di_Container_Producer from '../../../src/Container/Producer.mjs';
import TeqFw_Di_Container_Wrapper from '../../../src/Container/Wrapper.mjs';
import {TeqFw_Di_Internal_Logger_Noop} from '../../../src/Internal/Logger.mjs';

const FIXTURE_DIR = '/controlled/fixtures';

/**
 * @param {Record<string, object>} namespaces
 * @returns {any}
 */
function controlledLoader(namespaces) {
    return {
        route(/** @type {TeqFw_Di_Dto_DepId} */ depId) { return {specifier: depId.address}; },
        async load(/** @type {{specifier: string}} */ route) {
            if (!(route.specifier in namespaces)) throw new Error(`${route.specifier}.mjs is unavailable.`);
            return namespaces[route.specifier];
        },
    };
}

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
        const policies = {
            Fx_PolicyPreprocessor: {default: () => (/** @type {TeqFw_Di_Dto_DepId} */ depId) => ({...depId, address: depId.address === 'Fx_ConfigAlias' ? 'Fx_Root' : depId.address})},
            Fx_PolicyPostprocessor: {default: () => (/** @type {any} */ value) => ({...value, policyPostprocessed: true})},
        };
        const moduleRouter = controlledLoader(policies);

        await configureContainer({
            config,
            canonicalizer,
            moduleRouter,
            moduleLoader: moduleRouter,
            producer: new TeqFw_Di_Container_Producer(),
            wrapper: new TeqFw_Di_Container_Wrapper(),
            hardener: new TeqFw_Di_Container_Hardener(),
            postprocessor,
            logger: TeqFw_Di_Internal_Logger_Noop,
            enqueue: async () => undefined,
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
            moduleRouter: controlledLoader({Fx_PolicyPreprocessor: {default: () => (/** @type {TeqFw_Di_Dto_DepId} */ depId) => depId}}),
            moduleLoader: controlledLoader({Fx_PolicyPreprocessor: {default: () => (/** @type {TeqFw_Di_Dto_DepId} */ depId) => depId}}),
            producer: new TeqFw_Di_Container_Producer(),
            wrapper: new TeqFw_Di_Container_Wrapper(),
            hardener: new TeqFw_Di_Container_Hardener(),
            postprocessor,
            logger: TeqFw_Di_Internal_Logger_Noop,
            enqueue: async () => undefined,
        }), /MissingPolicy\.mjs/);

        assert.equal(canonicalizer.canonicalize('Fx_ConfigAlias$').effective.address, 'Fx_ConfigAlias');
        assert.equal(postprocessor.count(), 0);
    });
});
