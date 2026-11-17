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
    it('keeps resolution and original failures independent of a broken console sink', async (t) => {
        t.mock.method(console, 'debug', () => { throw new Error('diagnostic sink failed'); });
        t.mock.method(console, 'error', () => { throw new Error('diagnostic sink failed'); });
        const container = new TeqFw_Di_Container({logging: true});
        const value = await container.get('node:path');
        assert.equal(typeof value.join, 'function');

        const failing = new TeqFw_Di_Container({logging: true});
        await assert.rejects(failing.get('teq:invalid'), /Explicit teq: prefix is forbidden/);
    });

    it('captures mappings and producer lists independently of caller mutation', async () => {
        const config = {...createConfig(), preprocessors: ['Fx_PolicyPreprocessor$']};
        const container = new TeqFw_Di_Container(config);
        config.namespaces[0].target = '/unavailable-after-construction';
        config.preprocessors.push('Fx_MissingPolicy$');
        assert.deepEqual(await container.get('Fx_ConfigAlias$'), {name: 'root'});
    });

    it('enables optional diagnostics through the construction DTO', async (t) => {
        const debug = t.mock.method(console, 'debug', () => {});
        const logged = new TeqFw_Di_Container({...createConfig(), logging: true});
        const plain = new TeqFw_Di_Container(createConfig());
        assert.deepEqual(await logged.get('Fx_Root$'), await plain.get('Fx_Root$'));
        assert.ok(debug.mock.callCount() > 0);
    });

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

    it('finalizes a registered substitution through configured preprocessing', async () => {
        const container = new TeqFw_Di_Container({
            ...createConfig(),
            preprocessors: ['Fx_PolicyPreprocessor$'],
            introspection: true,
        });
        const mock = {name: 'configured-effective-mock'};
        container.enableTestMode();
        container.register('Fx_ConfigAlias$', mock);

        const value = await container.get('Fx_ConfigAlias$');

        assert.strictEqual(value, mock);
        assert.equal(Object.isFrozen(value), true);
    });

    it('materializes every configured policy producer under default policy before installation', async () => {
        const container = new TeqFw_Di_Container({
            ...createConfig(),
            preprocessors: ['Fx_PolicyRedirectingPreprocessor$', 'Fx_LaterPreprocessor$'],
            postprocessors: ['Fx_LaterPostprocessor$'],
            hardener: 'Fx_LaterHardener$',
        });

        const value = await container.get('Fx_LaterAlias$');

        assert.deepStrictEqual(value, {
            name: 'root',
            policyPostprocessor: 'later',
            policyHardener: 'later',
        });
    });

    it('does not apply configured Postprocessors or Hardener during policy materialization', async () => {
        const container = new TeqFw_Di_Container({
            ...createConfig(),
            postprocessors: ['Fx_PolicyPreparationGuardPostprocessor$', 'Fx_LaterPostprocessor$'],
            hardener: 'Fx_PolicyPreparationGuardHardener$',
        });

        const value = await container.get('Fx_Root$');

        assert.deepStrictEqual(value, {
            name: 'root',
            policyHardener: 'guard',
            policyPostprocessor: 'later',
        });
    });

    it('does not use registered test substitutions to materialize configured policy producers', async () => {
        const container = new TeqFw_Di_Container({
            ...createConfig(),
            preprocessors: ['Fx_PolicyPreprocessor$'],
            postprocessors: ['Fx_LaterPostprocessor$'],
            hardener: 'Fx_LaterHardener$',
        });
        const mustNotMaterialize = function () {
            throw new Error('A test substitution must not materialize Container policy.');
        };
        container.enableTestMode();
        container.register('Fx_PolicyPreprocessor$', mustNotMaterialize);
        container.register('Fx_LaterPostprocessor$', mustNotMaterialize);
        container.register('Fx_LaterHardener$', mustNotMaterialize);

        const value = await container.get('Fx_ConfigAlias$');

        assert.deepStrictEqual(value, {
            name: 'root',
            policyPostprocessor: 'later',
            policyHardener: 'later',
        });
    });

    it('fails before entry resolution when policy preparation cannot resolve a declared producer', async () => {
        const container = new TeqFw_Di_Container({
            ...createConfig(),
            preprocessors: ['Fx_MissingPolicy$'],
            introspection: true,
        });

        const first = container.get('Fx_Root$');
        const waiting = container.get('Fx_ConfigAlias$');
        const failures = await Promise.allSettled([first, waiting]);
        assert.deepEqual(failures.map((result) => result.status), ['rejected', 'rejected']);
        assert.equal(container.getIntrospection(), null);
        await assert.rejects(() => container.get('Fx_Root$'), /preparation failed|unusable/i);
    });

    it('rejects declaration timing syntax at public and policy entry boundaries', async () => {
        const publicContainer = new TeqFw_Di_Container({introspection: true});
        await assert.rejects(publicContainer.get('~Fx_Root$'), Error);
        assert.equal((/** @type {any} */ (publicContainer.getIntrospection())).explanation.containerState, 'Running');

        const policyContainer = new TeqFw_Di_Container({preprocessors: ['~Fx_PolicyPreprocessor$']});
        const active = policyContainer.get('node:path');
        const waiting = policyContainer.get('node:os');
        const outcomes = await Promise.allSettled([active, waiting]);
        assert.deepEqual(outcomes.map((one) => one.status), ['rejected', 'rejected']);
        assert.equal(policyContainer.getIntrospection(), null);
    });

    it('queues entries while policy preparation is pending', async () => {
        const container = new TeqFw_Di_Container({
            ...createConfig(),
            preprocessors: ['Fx_PolicyPreprocessor$'],
            introspection: true,
        });

        const first = container.get('Fx_ConfigAlias$');
        const second = container.get('Fx_Root$');
        const [firstValue, secondValue] = await Promise.all([first, second]);
        assert.ok(firstValue && typeof firstValue === 'object');
        assert.ok(secondValue && typeof secondValue === 'object');
        assert.deepEqual((/** @type {any} */ (container.getIntrospection())).entries.map((/** @type {any} */ entry) => entry.explanation.requestedSpecifier), ['Fx_ConfigAlias$', 'Fx_Root$']);
    });
});
