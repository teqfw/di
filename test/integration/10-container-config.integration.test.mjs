import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

import TeqFw_Di_Container from '@teqfw/di';
import {getPolicyPreprocessorCalls} from './fixture/PolicyPreprocessor.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURE_DIR = path.resolve(__dirname, './fixture');

/** @returns {{namespaces: Array<{prefix: string, target: string, defaultExt: string}>, preprocessors?: string[], postprocessors?: string[], introspection?: boolean}} */
function createConfig() {
    return {
        namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}],
    };
}

describe('Integration 10: declarative Container configuration', () => {
    it('round-trips JSON-safe policy and materializes ordered producers once for multiple entries', async () => {
        const config = JSON.parse(JSON.stringify({
            ...createConfig(),
            preprocessors: ['Fx_PolicyPreprocessor$'],
            postprocessors: ['Fx_PolicyPostprocessor$'],
            introspection: true,
        }));
        const container = new TeqFw_Di_Container(config);
        const before = getPolicyPreprocessorCalls();

        const value = await container.get('Fx_ConfigAlias$');
        const later = await container.get('Fx_Root$');
        const observation = /** @type {any} */ (container.getIntrospection());

        assert.deepStrictEqual(value, {name: 'root', policyPostprocessed: true});
        const firstEntry = observation.entries[0];
        assert.equal(firstEntry.explanation.resolutions[0].requested.address, 'Fx_ConfigAlias');
        assert.equal(firstEntry.explanation.resolutions[0].effective.address, 'Fx_Root');
        assert.equal(Object.isFrozen(value), true);
        assert.deepStrictEqual(later, {name: 'root', policyPostprocessed: true});
        assert.equal(getPolicyPreprocessorCalls(), before + 1);
    });

    it('uses default policy when configuration declares no policy producers', async () => {
        const container = new TeqFw_Di_Container(createConfig());

        const value = await container.get('Fx_Root$');

        assert.deepStrictEqual(value, {name: 'root'});
    });

    it('fails before root resolution when policy preparation cannot resolve a declared producer', async () => {
        const container = new TeqFw_Di_Container({
            ...createConfig(),
            preprocessors: ['Fx_MissingPolicy$'],
            introspection: true,
        });

        await assert.rejects(() => container.get('Fx_Root$'), /MissingPolicy\.mjs/);
        const observation = /** @type {any} */ (container.getIntrospection());

        assert.equal(observation.explanation.containerState, 'Failed');
        assert.equal(observation.explanation.failure.stage, 'configuration');
        assert.equal(observation.graph.nodes.length, 0);
        await assert.rejects(() => container.get('Fx_Root$'), /preparation failed|unusable/i);
    });

    it('rejects a concurrent entry while policy preparation is pending', async () => {
        const container = new TeqFw_Di_Container({
            ...createConfig(),
            preprocessors: ['Fx_PolicyPreprocessor$'],
        });

        const first = container.get('Fx_ConfigAlias$');
        await assert.rejects(() => container.get('Fx_Root$'), /concurrent|re-entrant|busy/i);
        await first;
    });
});
