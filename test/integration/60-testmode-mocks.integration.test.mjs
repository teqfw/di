import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {beforeEach, describe, it} from 'node:test';

import TeqFw_Di_Container from '@teqfw/di';
import {effects, resetEffects} from './fixture/Policies.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURE_DIR = path.resolve(__dirname, './fixture');

describe('Integration 60: test mode and mocks', () => {
    beforeEach(resetEffects);
    it('throws on register when test mode is disabled', () => {
        const container = new TeqFw_Di_Container({namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}]});

        assert.throws(() => container.register('Fx_Root$', {mock: true}), /test mode is disabled/);
    });

    it('sends a substituted value through postprocessing, wrappers, hardening, and Singleton reuse', async () => {
        const container = new TeqFw_Di_Container({hardener: 'Fx_Policies__FreezeSelected$', postprocessors: ['Fx_Policies__AdaptMock$'], namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}]});
        container.enableTestMode();
        const mock = {steps: ['mock']};
        container.register('Fx_MockTarget$_wrapFirst', mock);

        const root = await container.get('Fx_GraphLifestyle$');
        const first = root.mockA;
        const second = root.mockB;

        assert.deepEqual(first.steps, ['mock', 'postprocessor', 'wrapFirst']);
        assert.strictEqual(first, second);
        assert.equal(Object.isFrozen(first), true);
        assert.equal(effects.postprocessCalls, 1);
        assert.equal(effects.hardeningCalls, 1);
    });

    it('uses the effective mock registered after preprocessing', async () => {
        const container = new TeqFw_Di_Container({preprocessors: ['Fx_Policies__MockAlias$'], namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}]});
        container.enableTestMode();
        const mock = {source: 'effective-mock'};
        container.register('Fx_Root$', mock);

        const value = await container.get('Fx_AliasForMock$');

        assert.strictEqual(value, mock);
        assert.equal(Object.isFrozen(value), true);
    });

    it('finalizes a registered substitution through the complete preprocessing policy', async () => {
        const container = new TeqFw_Di_Container({preprocessors: ['Fx_Policies__MockAlias$'], namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}]});
        container.enableTestMode();
        const mock = {source: 'configured-effective-mock'};
        container.register('Fx_AliasForMock$', mock);

        const value = await container.get('Fx_AliasForMock$');

        assert.strictEqual(value, mock);
        assert.equal(Object.isFrozen(value), true);
    });

    it('finalizes substitutions that change Address Kind', async () => {
        const container = new TeqFw_Di_Container({preprocessors: ['Fx_Policies__NpmAliases$'], namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}]});
        container.enableTestMode();
        const mock = {source: 'npm-effective-mock'};
        container.register('Fx_NpmAliasOne$', mock);

        const value = await container.get('Fx_NpmAliasOne$');

        assert.strictEqual(value, mock);
        assert.equal(Object.isFrozen(value), true);
    });

    it('fails during substitution finalization before publishing an entry snapshot', async () => {
        const container = new TeqFw_Di_Container({preprocessors: ['Fx_Policies__BrokenRegistration$'], introspection: true, namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}]});
        container.enableTestMode();
        container.register('Fx_BrokenSubstitution$', {source: 'must-not-run'});

        await assert.rejects(() => container.get('Fx_Root$'), /registered substitution canonicalization failed/);
        assert.equal(container.getIntrospection(), null);
        await assert.rejects(() => container.get('Fx_Root$'), /preparation failed|unusable/i);
    });

    it('rejects deferred syntax in test registration identifiers', async () => {
        const container = new TeqFw_Di_Container({introspection: true});
        container.enableTestMode();
        container.register('~NoRoute_Value$', {value: true});
        await assert.rejects(container.get('node:path'), Error);
        assert.equal(container.getIntrospection(), null);
    });

    it('substitutes an unresolved address without module loading and preserves the common output corridor', async () => {
        const container = new TeqFw_Di_Container({namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}], hardener: 'Fx_Policies__FreezeSelected$', postprocessors: ['Fx_Policies__AdaptUnresolved$'], introspection: true});
        container.enableTestMode();
        const mock = {steps: ['mock']};
        container.register('NoRoute_Unresolvable$', mock);

        const root = await container.get('Fx_MockRoot$');
        const first = root.first;
        const second = root.second;
        const observation = /** @type {any} */ (container.getIntrospection());

        assert.deepEqual(first.steps, ['mock', 'postprocessor']);
        assert.strictEqual(first, second);
        assert.equal(effects.postprocessCalls, 1);
        assert.equal(effects.hardeningCalls, 1);
        assert.ok(observation.explanation.resolutions.some((/** @type {any} */ resolution) => resolution.cache === 'hit'));
        const noRoute = observation.explanation.resolutions.find(
            (/** @type {any} */ resolution) => resolution.effective.address === 'NoRoute_Unresolvable'
        );
        assert.equal(
            observation.trace.some((/** @type {any} */ event) => event.kind === 'route' && event.nodeId === noRoute.nodeId),
            false
        );
    });

    it('retains an arbitrary function substitution for a later sequential entry', async () => {
        const container = new TeqFw_Di_Container({
            namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}],
        });
        const mockFunction = function () {
            return 'test-only value';
        };
        container.enableTestMode();
        container.register('NoRoute_Function', mockFunction);

        await container.get('Fx_Root$');
        const value = await container.get('NoRoute_Function');

        assert.strictEqual(value, mockFunction);
        assert.equal(Object.isFrozen(value), true);
    });

    it('does not cache or publish success when a late then accessor breaks delivery', async () => {
        const container = new TeqFw_Di_Container({introspection: true});
        let reads = 0;
        const unstable = {get then() {
            reads += 1;
            if (reads > 1) throw new Error('late delivery failed');
            return undefined;
        }};
        container.enableTestMode();
        container.register('NoRoute_Unstable$', unstable);

        await assert.rejects(container.get('NoRoute_Unstable$'), /late delivery failed|safely through native Promise delivery/);
        const failed = /** @type {any} */ (container.getIntrospection());
        assert.equal(failed.explanation.outcome, 'failure');
        assert.equal(failed.explanation.failure.stage, 'value exposure');
        assert.equal(failed.explanation.resolutions[0].cache, 'miss');
        await assert.rejects(container.get('NoRoute_Unstable$'), /late delivery failed|safely through native Promise delivery/);
        assert.equal((/** @type {any} */ (container.getIntrospection())).explanation.resolutions[0].cache, 'miss');
    });

    it('does not cache a Singleton whose adapted Promise rejects', async () => {
        const container = new TeqFw_Di_Container({introspection: true});
        const rejected = Object.freeze({
            then(/** @type {(value: unknown) => void} */ resolve, /** @type {(reason: Error) => void} */ reject) {
                void resolve;
                reject(new Error('singleton settlement rejected'));
            },
        });
        container.enableTestMode();
        container.register('NoRoute_Rejecting$', rejected);

        await assert.rejects(container.get('NoRoute_Rejecting$'), /singleton settlement rejected/);
        const first = /** @type {any} */ (container.getIntrospection());
        assert.equal(first.explanation.failure.stage, 'value settlement');
        assert.equal(first.explanation.resolutions[0].cache, 'miss');
        await assert.rejects(container.get('NoRoute_Rejecting$'), /singleton settlement rejected/);
        const second = /** @type {any} */ (container.getIntrospection());
        assert.equal(second.explanation.resolutions[0].cache, 'miss');
    });
});
