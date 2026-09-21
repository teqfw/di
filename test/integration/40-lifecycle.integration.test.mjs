import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

import TeqFw_Di_Container from '@teqfw/di';
import {getProducerCalls} from './fixture/ObservedSingleton.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURE_DIR = path.resolve(__dirname, './fixture');

describe('Integration 40: lifecycle', () => {
    it('verifies Singleton, Transient, and Direct through repeated child occurrences', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        const before = getProducerCalls();
        const root = await container.get('Fx_GraphLifestyle$');

        assert.strictEqual(root.singletonA, root.singletonB);
        assert.notStrictEqual(root.transientA, root.transientB);
        assert.strictEqual(root.directA, root.directB);
        assert.equal(getProducerCalls(), before + 1);
    });

    it('keeps Running when an entry hardening failure occurs', async () => {
        const container = new TeqFw_Di_Container({introspection: true});
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');

        await assert.rejects(container.get('Fx_ProtectedProxy$'), /defineProperty is forbidden/);
        const observation = /** @type {any} */ (container.getIntrospection());

        assert.equal(observation.explanation.failure.stage, 'hardening');
        assert.equal(observation.explanation.containerState, 'Running');
        const value = await container.get('Fx_Root$');
        assert.deepEqual(value, {name: 'root'});
    });

    it('uses a configured hardener as the full host policy', async () => {
        const container = new TeqFw_Di_Container({introspection: true});
        /** @type {unknown} */
        let received;
        container.setHardener((value) => {
            received = value;
            return value;
        });

        const namespace = await container.get('node:fs');
        const observation = /** @type {any} */ (container.getIntrospection());

        assert.strictEqual(received, namespace);
        assert.equal(Object.prototype.toString.call(namespace), '[object Module]');
        assert.equal(observation.explanation.resolutions[0].hardening.mode, 'configured');
    });

    it('attributes a hostile Hardener result to native value exposure', async () => {
        const container = new TeqFw_Di_Container({introspection: true});
        const hostile = new Proxy({}, {
            get(target, property, receiver) {
                if (property === 'then') throw new Error('then access is blocked');
                return Reflect.get(target, property, receiver);
            },
        });
        container.setHardener(() => hostile);

        await assert.rejects(container.get('node:fs'), /then access is blocked/);
        const observation = /** @type {any} */ (container.getIntrospection());

        assert.equal(observation.explanation.resolutions[0].hardening.mode, 'configured');
        assert.equal(observation.explanation.failure.stage, 'value exposure');
        assert.equal(observation.explanation.containerState, 'Running');
    });

    it('keeps singleton identities separate for default and named exports from same module', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');

        const root = await container.get('Fx_GraphLifestyle$');

        assert.equal(root.defaultA.kind, 'default');
        assert.equal(root.factoryA.kind, 'factory');
        assert.strictEqual(root.defaultA, root.defaultB);
        assert.strictEqual(root.factoryA, root.factoryB);
        assert.notStrictEqual(root.defaultA, root.factoryA);
    });

    it('applies preprocess and postprocess in registration order', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        container.addPreprocess((depId, _context) => ({...depId, address: depId.address.replace('Singleton', 'Transient')}));
        container.addPostprocess((value, _context) => {
            /** @type {{steps?: string[]}} */
            const post1 = /** @type {{steps?: string[]}} */ (value);
            return {...post1, steps: [...(post1.steps ?? []), 'post1']};
        });
        container.addPostprocess((value, _context) => {
            /** @type {{steps: string[]}} */
            const post2 = /** @type {{steps: string[]}} */ (value);
            return {...post2, steps: [...post2.steps, 'post2']};
        });

        const value = await container.get('Fx_Singleton$');

        assert.deepStrictEqual(value.steps, ['post1', 'post2']);
    });

    it('caches the final singleton value after postprocessing, wrapping, and hardening', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        const producerBefore = getProducerCalls();
        let postprocessCalls = 0;
        let hardeningCalls = 0;
        container.addPostprocess((value, context) => {
            if (context.depId.address !== 'Fx_ObservedSingleton') return value;
            postprocessCalls += 1;
            const observed = /** @type {{producerCalls: number, steps: string[]}} */ (value);
            return {...observed, steps: [...observed.steps, 'postprocessor']};
        });
        container.setHardener((value) => {
            if (typeof value === 'object' && value !== null && 'steps' in value
                && /** @type {{steps: string[]}} */ (value).steps.includes('postprocessor')) {
                hardeningCalls += 1;
            }
            return Object.freeze(/** @type {object} */ (value));
        });

        const root = await container.get('Fx_GraphLifestyle$');
        const first = root.singletonA;
        const second = root.singletonB;

        assert.strictEqual(first, second);
        assert.equal(getProducerCalls(), producerBefore + 1);
        assert.deepStrictEqual(first.steps, ['producer', 'postprocessor', 'wrapper']);
        assert.equal(postprocessCalls, 1);
        assert.equal(hardeningCalls, 1);
        assert.ok(Object.isFrozen(first));
    });

    it('uses effective substituted identity before Singleton lookup', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        const producerBefore = getProducerCalls();
        container.addPreprocess((depId) => ({
            ...depId,
            address: depId.address.startsWith('Fx_Alias')
                ? 'Fx_ObservedSingleton'
                : depId.address,
        }));

        const root = await container.get('Fx_GraphLifestyle$');
        const first = root.aliasOne;
        const second = root.aliasTwo;

        assert.strictEqual(first, second);
        assert.equal(getProducerCalls(), producerBefore + 1);
    });

    it('uses effective npm identity for Singleton aliases', async () => {
        const container = new TeqFw_Di_Container({introspection: true});
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        container.addPreprocess((depId) => ({
            ...depId,
            ...(depId.address.startsWith('Fx_NpmAlias') ? {
                addressKind: 'npm',
                address: '@teqfw/di',
                exportName: 'default',
            } : {}),
        }));

        const root = await container.get('Fx_GraphLifestyle$');
        const observation = /** @type {any} */ (container.getIntrospection());
        const explanations = observation.explanation.resolutions;
        const npm = explanations.filter((/** @type {any} */ one) => one.effective.address === '@teqfw/di');
        const missExplanation = npm.find((/** @type {any} */ one) => one.cache === 'miss');
        const hitExplanation = npm.find((/** @type {any} */ one) => one.cache === 'hit');

        assert.strictEqual(root.npmAliasOne, root.npmAliasTwo);
        assert.equal(missExplanation.requested.addressKind, 'teq');
        assert.equal(missExplanation.effective.addressKind, 'npm');
        assert.equal(missExplanation.effective.address, '@teqfw/di');
        assert.equal(missExplanation.route.addressKind, 'npm');
        assert.equal(Object.hasOwn(missExplanation.route, 'mapping'), false);
        assert.equal(hitExplanation.requested.address, 'Fx_NpmAliasTwo');
        assert.equal(hitExplanation.effective.address, '@teqfw/di');
        assert.equal(hitExplanation.cache, 'hit');
    });

    it('rejects a concurrent entry while an entry is resolving', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        const first = container.get('Fx_Root$');
        await assert.rejects(container.get('Fx_Singleton$'), /concurrent|re-entrant|busy/i);
        await first;
    });

    it('shares a Singleton cache and retains entry provenance across sequential entries', async () => {
        const container = new TeqFw_Di_Container({introspection: true});
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        const before = getProducerCalls();
        const first = await container.get('Fx_GraphLifestyle$');
        const second = await container.get('Fx_ObservedSingleton$_wrapTag');
        const observation = /** @type {any} */ (container.getIntrospection());

        assert.strictEqual(first.singletonA, second);
        assert.equal(getProducerCalls(), before + 1);
        assert.equal(observation.entries.length, 2);
        assert.equal(observation.entries[0].explanation.entryId, 'entry-0');
        assert.equal(observation.entries[1].explanation.entryId, 'entry-1');
        assert.equal(observation.entries[1].explanation.resolutions[0].cache, 'hit');
    });

    it('applies Postprocessors, Wrappers, and Hardener to every sequential entry', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        /** @type {string[]} */
        const postprocessedRoots = [];
        let hardeningCalls = 0;
        container.addPostprocess((value, context) => {
            postprocessedRoots.push(context.root.address);
            return value;
        });
        container.setHardener((value) => {
            hardeningCalls += 1;
            return Object.freeze(/** @type {object} */ (value));
        });

        const first = await container.get('Fx_Wrapped$_wrapFirst');
        const second = await container.get('Fx_Wrapped$_wrapSecond');

        assert.deepStrictEqual(first.steps, ['core', 'wrapFirst']);
        assert.deepStrictEqual(second.steps, ['core', 'wrapSecond']);
        assert.deepStrictEqual(postprocessedRoots, ['Fx_Wrapped', 'Fx_Wrapped']);
        assert.equal(hardeningCalls, 2);
    });
});
