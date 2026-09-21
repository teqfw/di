import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

import TeqFw_Di_Container from '@teqfw/di';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURE_DIR = path.resolve(__dirname, './fixture');

describe('Integration 60: test mode and mocks', () => {
    it('throws on register when test mode is disabled', () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');

        assert.throws(() => container.register('Fx_Root$', {mock: true}), /test mode is disabled/);
    });

    it('sends a substituted value through postprocessing, wrappers, hardening, and Singleton reuse', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        container.enableTestMode();
        const mock = {steps: ['mock']};
        let postprocessCalls = 0;
        let hardeningCalls = 0;
        container.register('Fx_MockTarget$_wrapFirst', mock);
        container.addPostprocess((value, context) => {
            if (context.depId.address !== 'Fx_MockTarget') return value;
            postprocessCalls += 1;
            const observed = /** @type {{steps: string[]}} */ (value);
            return {steps: [...observed.steps, 'postprocessor']};
        });
        container.setHardener((value) => {
            if (typeof value === 'object' && value !== null && 'steps' in value
                && /** @type {{steps: string[]}} */ (value).steps.includes('postprocessor')) {
                hardeningCalls += 1;
            }
            return Object.freeze(/** @type {object} */ (value));
        });

        const root = await container.get('Fx_GraphLifestyle$');
        const first = root.mockA;
        const second = root.mockB;

        assert.deepEqual(first.steps, ['mock', 'postprocessor', 'wrapFirst']);
        assert.strictEqual(first, second);
        assert.equal(Object.isFrozen(first), true);
        assert.equal(postprocessCalls, 1);
        assert.equal(hardeningCalls, 1);
    });

    it('uses the effective mock registered after preprocessing', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        container.enableTestMode();
        const mock = {source: 'effective-mock'};
        container.register('Fx_Root$', mock);
        container.addPreprocess((depId) => ({
            ...depId,
            address: depId.address === 'Fx_AliasForMock'
                ? 'Fx_Root'
                : depId.address,
        }));

        const value = await container.get('Fx_AliasForMock$');

        assert.strictEqual(value, mock);
        assert.equal(Object.isFrozen(value), true);
    });

    it('finalizes a compatibility substitution through the complete preprocessing policy', async () => {
        const container = new TeqFw_Di_Container();
        container.enableTestMode();
        const mock = {source: 'compatibility-effective-mock'};
        container.register('Fx_AliasForMock$', mock);
        container.addPreprocess((depId) => depId.address === 'Fx_AliasForMock'
            ? {...depId, address: 'Fx_Root'}
            : depId);

        const value = await container.get('Fx_AliasForMock$');

        assert.strictEqual(value, mock);
        assert.equal(Object.isFrozen(value), true);
    });

    it('finalizes substitutions that change Address Kind', async () => {
        const container = new TeqFw_Di_Container();
        container.enableTestMode();
        const mock = {source: 'npm-effective-mock'};
        container.register('Fx_NpmAliasOne$', mock);
        container.addPreprocess((depId) => depId.address === 'Fx_NpmAliasOne'
            ? {...depId, addressKind: 'npm', address: '@teqfw/di', exportName: 'default'}
            : depId);

        const value = await container.get('Fx_NpmAliasOne$');

        assert.strictEqual(value, mock);
        assert.equal(Object.isFrozen(value), true);
    });

    it('fails during substitution finalization before publishing an entry snapshot', async () => {
        const container = new TeqFw_Di_Container({introspection: true});
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        container.enableTestMode();
        container.register('Fx_BrokenSubstitution$', {source: 'must-not-run'});
        container.addPreprocess((depId) => {
            if (depId.address === 'Fx_BrokenSubstitution') {
                throw new Error('registered substitution canonicalization failed');
            }
            return depId;
        });

        await assert.rejects(() => container.get('Fx_Root$'), /registered substitution canonicalization failed/);
        assert.equal(container.getIntrospection(), null);
        await assert.rejects(() => container.get('Fx_Root$'), /preparation failed|unusable/i);
    });

    it('substitutes an unresolved address without module loading and preserves the common output corridor', async () => {
        const container = new TeqFw_Di_Container({introspection: true});
        container.enableTestMode();
        const mock = {steps: ['mock']};
        let postprocessCalls = 0;
        let hardeningCalls = 0;
        container.register('NoRoute_Unresolvable$', mock);
        container.addPostprocess((value, context) => {
            if (context.depId.address !== 'NoRoute_Unresolvable') return value;
            postprocessCalls += 1;
            const observed = /** @type {{steps: string[]}} */ (value);
            return {steps: [...observed.steps, 'postprocessor']};
        });
        container.setHardener((value) => {
            if (typeof value === 'object' && value !== null && 'steps' in value
                && /** @type {{steps: string[]}} */ (value).steps.includes('postprocessor')) {
                hardeningCalls += 1;
            }
            return Object.freeze(/** @type {object} */ (value));
        });

        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        const root = await container.get('Fx_MockRoot$');
        const first = root.first;
        const second = root.second;
        const observation = /** @type {any} */ (container.getIntrospection());

        assert.deepEqual(first.steps, ['mock', 'postprocessor']);
        assert.strictEqual(first, second);
        assert.equal(postprocessCalls, 1);
        assert.equal(hardeningCalls, 1);
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
});
