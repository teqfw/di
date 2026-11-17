import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {beforeEach, describe, it} from 'node:test';

import TeqFw_Di_Container from '@teqfw/di';
import {effects, resetEffects} from './fixture/Policies.mjs';
import {getProducerCalls} from './fixture/ObservedSingleton.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURE_DIR = path.resolve(__dirname, './fixture');

describe('Integration 40: lifecycle', () => {
    beforeEach(resetEffects);
    it('verifies Singleton, Transient, and Direct through repeated child occurrences', async () => {
        const container = new TeqFw_Di_Container({introspection: true, namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}]});
        const before = getProducerCalls();
        const root = await container.get('Fx_GraphLifestyle$');

        assert.strictEqual(root.singletonA, root.singletonB);
        assert.notStrictEqual(root.transientA, root.transientB);
        assert.strictEqual(root.directA, root.directB);
        assert.equal(getProducerCalls(), before + 1);
    });

    it('keeps Running when an entry hardening failure occurs', async () => {
        const container = new TeqFw_Di_Container({introspection: true, namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}]});

        await assert.rejects(container.get('Fx_ProtectedProxy$'), /defineProperty is forbidden/);
        const observation = /** @type {any} */ (container.getIntrospection());

        assert.equal(observation.explanation.failure.stage, 'hardening');
        assert.equal(observation.explanation.containerState, 'Running');
        const value = await container.get('Fx_Root$');
        assert.deepEqual(value, {name: 'root'});
    });

    it('uses a DTO-selected hardener on the acquired value', async () => {
        const container = new TeqFw_Di_Container({namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}], hardener: 'Fx_Policies__IdentityHardener$', introspection: true});

        const namespace = await container.get('node:fs');
        const observation = /** @type {any} */ (container.getIntrospection());

        assert.strictEqual(effects.hardened, namespace);
        assert.equal(Object.prototype.toString.call(namespace), '[object Module]');
        assert.equal(observation.explanation.resolutions[0].hardening.mode, 'configured');
    });

    it('settles named Promise exports, frozen carrying Promises, and nested thenables before hardening', async () => {
        const container = new TeqFw_Di_Container({
            hardener: 'Fx_Policies__RecordHardening$',
            namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}],
        });

        for (const [specifier, expected] of [
            ['Fx_PromiseValues__namedPromise', 'named-promise'],
            ['Fx_PromiseValues__frozenCarrier', 'frozen-carrier'],
            ['Fx_PromiseValues__nestedThenable', 'nested-thenable'],
        ]) {
            const value = await container.get(specifier);
            assert.equal(value.kind, expected);
            assert.equal(Object.isFrozen(value), true);
            assert.strictEqual(effects.hardened, value);
        }
    });

    it('records adapted rejection before Hardener and continues the Container', async () => {
        const container = new TeqFw_Di_Container({introspection: true, namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}]});
        await assert.rejects(container.get('Fx_PromiseValues__rejected'), /adapted value rejected/);
        const observation = /** @type {any} */ (container.getIntrospection());
        assert.equal(observation.explanation.failure.stage, 'value settlement');
        assert.equal(observation.explanation.resolutions[0].hardening, undefined);
        assert.deepEqual(await container.get('Fx_Root$'), {name: 'root'});
    });

    it('attributes a hostile Hardener result to native value exposure', async () => {
        const container = new TeqFw_Di_Container({namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}], hardener: 'Fx_Policies__HostileHardener$', introspection: true});

        await assert.rejects(container.get('node:fs'), /then access is blocked/);
        const observation = /** @type {any} */ (container.getIntrospection());

        assert.equal(observation.explanation.resolutions[0].hardening, undefined);
        assert.equal(observation.explanation.failure.stage, 'hardening');
        assert.equal(observation.explanation.containerState, 'Running');
    });

    it('keeps singleton identities separate for default and named exports from same module', async () => {
        const container = new TeqFw_Di_Container({namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}]});

        const root = await container.get('Fx_GraphLifestyle$');

        assert.equal(root.defaultA.kind, 'default');
        assert.equal(root.factoryA.kind, 'factory');
        assert.strictEqual(root.defaultA, root.defaultB);
        assert.strictEqual(root.factoryA, root.factoryB);
        assert.notStrictEqual(root.defaultA, root.factoryA);
    });

    it('applies preprocess and postprocess in registration order', async () => {
        const container = new TeqFw_Di_Container({postprocessors: ['Fx_Policies__FirstStep$', 'Fx_Policies__SecondStep$'], preprocessors: ['Fx_Policies__SelectTransient$'], namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}]});

        const value = await container.get('Fx_Singleton$');

        assert.deepStrictEqual(value.steps, ['post1', 'post2']);
    });

    it('caches the final singleton value after postprocessing, wrapping, and hardening', async () => {
        const container = new TeqFw_Di_Container({hardener: 'Fx_Policies__FreezeSelected$', postprocessors: ['Fx_Policies__AdaptObserved$'], namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}]});
        const producerBefore = getProducerCalls();

        const root = await container.get('Fx_GraphLifestyle$');
        const first = root.singletonA;
        const second = root.singletonB;

        assert.strictEqual(first, second);
        assert.equal(getProducerCalls(), producerBefore + 1);
        assert.deepStrictEqual(first.steps, ['producer', 'postprocessor', 'wrapper']);
        assert.equal(effects.postprocessCalls, 1);
        assert.equal(effects.hardeningCalls, 1);
        assert.ok(Object.isFrozen(first));
    });

    it('uses effective substituted identity before Singleton lookup', async () => {
        const container = new TeqFw_Di_Container({preprocessors: ['Fx_Policies__ObservedAliases$'], namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}]});
        const producerBefore = getProducerCalls();

        const root = await container.get('Fx_GraphLifestyle$');
        const first = root.aliasOne;
        const second = root.aliasTwo;

        assert.strictEqual(first, second);
        assert.equal(getProducerCalls(), producerBefore + 1);
    });

    it('uses effective npm identity for Singleton aliases', async () => {
        const container = new TeqFw_Di_Container({preprocessors: ['Fx_Policies__NpmAliases$'], introspection: true, namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}]});

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

    it('queues concurrent entries and resolves them in order', async () => {
        const container = new TeqFw_Di_Container({introspection: true, namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}]});
        const first = container.get('Fx_Root$');
        const second = container.get('Fx_Singleton$');
        const [root, singleton] = await Promise.all([first, second]);
        assert.deepEqual(root, {name: 'root'});
        assert.ok(singleton && typeof singleton === 'object');
        assert.deepEqual((/** @type {any} */ (container.getIntrospection())).entries.map((/** @type {any} */ entry) => entry.explanation.requestedSpecifier), ['Fx_Root$', 'Fx_Singleton$']);
    });

    it('creates frozen deferred Providers without resolving their targets', async () => {
        const container = new TeqFw_Di_Container({introspection: true, namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}]});
        const before = getProducerCalls();
        const parent = await container.get('Fx_DeferredRoot$');
        const parentSnapshot = container.getIntrospection();

        /** @type {any} */
        const snapshot = parentSnapshot;

        assert.equal(getProducerCalls(), before);
        assert.deepEqual(Object.keys(parent.target), ['resolve']);
        assert.equal(Object.isFrozen(parent.target), true);
        assert.equal(snapshot.graph.nodes.length, 1);
        assert.equal(snapshot.graph.edges.length, 0);
        assert.equal(snapshot.explanation.resolutions[0].providers.length, 1);

        const firstRequest = parent.target.resolve();
        const ordinaryRequest = container.get('Fx_Root$');
        const secondRequest = parent.target.resolve();
        const [first, ordinary, second] = await Promise.all([firstRequest, ordinaryRequest, secondRequest]);
        assert.strictEqual(first, second);
        assert.deepEqual(first.steps, ['producer', 'wrapper']);
        assert.deepEqual(ordinary, {name: 'root'});
        assert.equal(getProducerCalls(), before + 1);
        assert.deepEqual((/** @type {any} */ (container.getIntrospection())).entries.map((/** @type {any} */ entry) => entry.explanation.requestedSpecifier), [
            'Fx_DeferredRoot$', 'Fx_ObservedSingleton$_wrapTag', 'Fx_Root$', 'Fx_ObservedSingleton$_wrapTag',
        ]);
    });

    it('creates a parent Provider without importing an unavailable target', async () => {
        const container = new TeqFw_Di_Container({introspection: true, namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}]});
        const parent = await container.get('Fx_DeferredUnavailable$');
        assert.equal(Object.isFrozen(parent.target), true);
        assert.equal((/** @type {any} */ (container.getIntrospection())).explanation.outcome, 'success');
        await assert.rejects(parent.target.resolve(), /UnavailableDeferredTarget\.mjs/);
        assert.equal((/** @type {any} */ (container.getIntrospection())).explanation.failure.stage, 'module loading');
    });

    it('supports deferred Direct, Singleton, and Transient target lifestyles', async () => {
        const container = new TeqFw_Di_Container({namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}]});
        const declarations = await container.get('Fx_DeferredMatrix$');
        const direct = await declarations.direct.resolve();
        const npmContainer = await declarations.npm.resolve();
        const [singletonA, singletonB] = await Promise.all([
            declarations.singleton.resolve(),
            declarations.singleton.resolve(),
        ]);
        const transientA = await declarations.transient.resolve();
        const transientB = await declarations.transient.resolve();

        assert.equal(direct('file.txt'), 'file.txt');
        assert.equal(typeof npmContainer, 'function');
        assert.equal(Object.isFrozen(npmContainer), true);
        assert.strictEqual(singletonA, singletonB);
        assert.notStrictEqual(transientA, transientB);
    });

    it('applies configured substitutions and test substitutions in a Provider entry', async () => {
        const container = new TeqFw_Di_Container({
            preprocessors: ['Fx_Policies__RecordPreprocessing$', 'Fx_Policies__MockAlias$'],
            postprocessors: ['Fx_Policies__RecordPostprocessing$'],
            namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}],
        });
        container.enableTestMode();
        const mock = {source: 'deferred-test-substitution'};
        container.register('Fx_AliasForMock$', mock);
        const parent = await container.get('Fx_DeferredMock$');
        const before = effects.preprocessing.filter((context) => context.depId.address === 'Fx_AliasForMock').length;
        const postprocessorsBefore = effects.postprocessing.length;
        const value = await parent.target.resolve();

        assert.strictEqual(value, mock);
        assert.equal(Object.isFrozen(value), true);
        assert.equal(effects.preprocessing.filter((context) => context.depId.address === 'Fx_AliasForMock').length, before + 1);
        assert.equal(effects.postprocessing.length, postprocessorsBefore + 1);
        const targetContext = effects.preprocessing.at(-1);
        assert.ok(targetContext);
        assert.equal(targetContext.parent, null);
        assert.equal(targetContext.stack.length, 1);
    });

    it('lets a synchronous hook enqueue a later entry without overlapping graphs', async () => {
        const container = new TeqFw_Di_Container({
            introspection: true,
            postprocessors: ['Fx_Policies__EnqueueEntry$'],
            namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}],
        });
        effects.enqueue = () => container.get('node:path');

        const first = await container.get('Fx_Root$');
        const second = /** @type {any} */ (await effects.queuedEntry);

        assert.deepEqual(first, {name: 'root'});
        assert.equal(typeof second.join, 'function');
        assert.deepEqual(effects.queueEvents, ['hook-start', 'hook-end', 'queued-entry']);
        assert.deepEqual((/** @type {any} */ (container.getIntrospection())).entries.map((/** @type {any} */ entry) => entry.explanation.requestedSpecifier), ['Fx_Root$', 'node:path']);
    });

    it('shares a Singleton cache and retains entry provenance across sequential entries', async () => {
        const container = new TeqFw_Di_Container({introspection: true, namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}]});
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

    it('isolates Singleton values by Container while preserving equivalent outcomes', async () => {
        const firstContainer = new TeqFw_Di_Container({introspection: true, namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}]});
        const secondContainer = new TeqFw_Di_Container({introspection: true, namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}]});
        const first = await firstContainer.get('Fx_Singleton$');
        const second = await secondContainer.get('Fx_Singleton$');

        assert.notStrictEqual(first, second);
        assert.deepEqual(first, second);
        const firstDecisions = /** @type {any} */ (firstContainer.getIntrospection()).explanation.resolutions;
        const secondDecisions = /** @type {any} */ (secondContainer.getIntrospection()).explanation.resolutions;
        assert.deepEqual(firstDecisions.map((/** @type {any} */ item) => [item.effective, item.cache, item.hardening]), secondDecisions.map((/** @type {any} */ item) => [item.effective, item.cache, item.hardening]));
    });

    it('applies Postprocessors, Wrappers, and Hardener to every sequential entry', async () => {
        const container = new TeqFw_Di_Container({hardener: 'Fx_Policies__RecordHardening$', postprocessors: ['Fx_Policies__RecordPostprocessing$'], namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}]});

        const first = await container.get('Fx_Wrapped$_wrapFirst');
        const second = await container.get('Fx_Wrapped$_wrapSecond');

        assert.deepStrictEqual(first.steps, ['core', 'wrapFirst']);
        assert.deepStrictEqual(second.steps, ['core', 'wrapSecond']);
        assert.deepStrictEqual(effects.postprocessing.map((context) => context.root.address), ['Fx_Wrapped', 'Fx_Wrapped']);
        assert.equal(effects.hardeningCalls, 2);
    });
});
