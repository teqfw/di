import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

import TeqFw_Di_Container from '@teqfw/di';
import {getProducerCalls} from './fixture/ObservedSingleton.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURE_DIR = path.resolve(__dirname, './fixture');

describe('Integration 90: entry and preparation failures', () => {
    it('retains a successful child Singleton when a later child fails', async () => {
        const container = new TeqFw_Di_Container({introspection: true, namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}]});
        const before = getProducerCalls();

        await assert.rejects(container.get('Fx_FailureAfterChild$'), /MissingChild\.mjs/);
        const child = await container.get('Fx_ObservedSingleton$');
        assert.equal(child.producerCalls, before + 1);
        const snapshot = /** @type {any} */ (container.getIntrospection());
        assert.equal(snapshot.explanation.resolutions[0].cache, 'hit');
    });

    it('records a native module-loading entry failure and permits a later entry', async () => {
        const container = new TeqFw_Di_Container({introspection: true, namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}]});

        await assert.rejects(
            () => container.get('Fx_UnavailableModule$'),
            /UnavailableModule\.mjs/
        );
        const observation = /** @type {any} */ (container.getIntrospection());

        assert.equal(observation.explanation.containerState, 'Running');
        assert.equal(observation.explanation.failure.stage, 'module loading');
        const route = observation.explanation.resolutions[0].route;
        assert.equal(route.addressKind, 'teq');
        assert.deepStrictEqual(route.mapping, {
            prefix: 'Fx_',
            target: FIXTURE_DIR,
            defaultExt: '.mjs',
        });
        assert.equal(route.moduleSpecifier, path.join(FIXTURE_DIR, 'UnavailableModule.mjs'));
        const routeIndex = observation.trace.findIndex((/** @type {any} */ event) => event.kind === 'route');
        const failureIndex = observation.trace.findIndex((/** @type {any} */ event) => event.kind === 'failure');
        assert.ok(routeIndex >= 0);
        assert.ok(failureIndex > routeIndex);
        const root = await container.get('Fx_Root$');
        assert.deepEqual(root, {name: 'root'});
        assert.equal((/** @type {any} */ (container.getIntrospection())).entries.length, 2);
    });

    it('locks configuration but permits a later valid entry after failure', async () => {
        const container = new TeqFw_Di_Container({namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}]});

        await assert.rejects(() => container.get('Fx_BadExport$'), /Export 'default' is not found/);
        const root = await container.get('Fx_Root$');
        assert.deepEqual(root, {name: 'root'});

        assert.throws(() => container.enableTestMode());
        assert.throws(() => container.register('Fx_Root$', {mock: true}));
    });

    it('isolates parsing, preprocessing, and mapping entry failures', async () => {
        const cases = [
            {
                config: {},
                specifier: 'teq:Fx_Root$',
                stage: 'identifier parsing',
            },
            {
                config: {preprocessors: ['Fx_Policies__FailPreprocessingOnce$']},
                specifier: 'Fx_Root$',
                stage: 'preprocessing',
            },
            {
                config: {},
                specifier: 'NoMapping_Root$',
                stage: 'route selection',
            },
        ];

        for (const one of cases) {
            const container = new TeqFw_Di_Container({...one.config, introspection: true, namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}]});

            await assert.rejects(() => container.get(one.specifier));
            const observation = /** @type {any} */ (container.getIntrospection());
            assert.equal(observation.explanation.failure.stage, one.stage);
            const root = await container.get('Fx_Root$');
            assert.deepEqual(root, {name: 'root'});
        }
    });

    it('isolates child, producer, postprocessing, and Wrapper entry failures', async () => {
        const cases = [
            {
                name: 'child resolution',
                config: {preprocessors: ['Fx_Policies__BadChild$']},
                specifier: 'Fx_GraphRoot$',
                expected: /Export 'default' is not found/,
                stage: 'Export Selection',
                requiresChildTrace: true,
            },
            {
                name: 'producer invocation',
                config: {},
                specifier: 'Fx_ThrowingProducer$',
                expected: /producer failure/,
                stage: 'producer invocation',
            },
            {
                name: 'Postprocessor execution',
                config: {postprocessors: ['Fx_Policies__FailPostprocessingOnce$']},
                specifier: 'Fx_Root$',
                expected: /postprocessor failure/,
                stage: 'Postprocessor execution',
            },
            {
                name: 'Wrapper execution',
                config: {},
                specifier: 'Fx_Wrapped$_wrapThenable',
                expected: /must return synchronously \(non-Promise\)/,
                stage: 'Wrapper execution',
            },
        ];

        for (const one of cases) {
            const container = new TeqFw_Di_Container({...one.config, introspection: true, namespaces: [{prefix: 'Fx_', target: FIXTURE_DIR, defaultExt: '.mjs'}]});

            await assert.rejects(() => container.get(one.specifier), one.expected);
            const observation = /** @type {any} */ (container.getIntrospection());
            assert.equal(observation.explanation.failure.stage, one.stage, one.name);
            if (one.requiresChildTrace) {
                assert.equal(
                    observation.trace.some((/** @type {any} */ event) => event.kind === 'child'),
                    true,
                    'child resolution must begin before its nested failure'
                );
            }
            const root = await container.get('Fx_Root$');
            assert.deepEqual(root, {name: 'root'});
        }
    });
});
