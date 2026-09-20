import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

import TeqFw_Di_Container from '../../src/Container.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURE_DIR = path.resolve(__dirname, './fixture');

describe('Integration 90: failed state', () => {
    it('makes a native module-loading failure terminal after Teq mapping succeeds', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        container.enableIntrospection();

        await assert.rejects(
            () => container.get('Fx_UnavailableModule$'),
            /UnavailableModule\.mjs/
        );
        const observation = /** @type {any} */ (container.getIntrospection());

        assert.equal(observation.explanation.failure.stage, 'route selection');
        assert.equal(observation.trace.some((/** @type {any} */ event) => event.kind === 'route'), false);
        await assert.rejects(() => container.get('Fx_Root$'), /failed state/i);
    });

    it('enters failed state after Dependency Resolution failure and rejects subsequent get/config calls', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');

        await assert.rejects(() => container.get('Fx_BadExport$'), /Export 'default' is not found/);
        await assert.rejects(() => container.get('Fx_Root$'), /failed state/i);

        assert.throws(() => container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs'));
        assert.throws(() => container.enableLogging());
        assert.throws(() => container.enableTestMode());
        assert.throws(() => container.addPreprocess((depId) => depId));
        assert.throws(() => container.addPostprocess((value) => value));
        assert.throws(() => container.register('Fx_Root$', {mock: true}));
    });

    it('makes parsing, preprocessing, and mapping failures terminal', async () => {
        const cases = [
            {
                configure(/** @type {TeqFw_Di_Container} */ _container) {},
                specifier: 'teq:Fx_Root$',
            },
            {
                configure(/** @type {TeqFw_Di_Container} */ container) {
                    container.addPreprocess(() => { throw new Error('preprocess failed'); });
                },
                specifier: 'Fx_Root$',
            },
            {
                configure(/** @type {TeqFw_Di_Container} */ _container) {},
                specifier: 'NoMapping_Root$',
            },
        ];

        for (const one of cases) {
            const container = new TeqFw_Di_Container();
            container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
            one.configure(container);

            await assert.rejects(() => container.get(one.specifier));
            await assert.rejects(() => container.get('Fx_Root$'), /failed state/i);
        }
    });

    it('makes child, producer, postprocessing, and Wrapper failures terminal', async () => {
        const cases = [
            {
                name: 'child resolution',
                configure(/** @type {TeqFw_Di_Container} */ container) {
                    container.addPreprocess((depId) => ({
                        ...depId,
                        moduleName: depId.moduleName === 'Fx_Child'
                            ? 'Fx_BadExport'
                            : depId.moduleName,
                    }));
                },
                specifier: 'Fx_GraphRoot$',
                expected: /Export 'default' is not found/,
                stage: 'Export Selection',
                requiresChildTrace: true,
            },
            {
                name: 'producer invocation',
                configure(/** @type {TeqFw_Di_Container} */ _container) {},
                specifier: 'Fx_ThrowingProducer$',
                expected: /producer failure/,
                stage: 'producer invocation',
            },
            {
                name: 'Postprocessor execution',
                configure(/** @type {TeqFw_Di_Container} */ container) {
                    container.addPostprocess(() => {
                        throw new Error('postprocessor failure');
                    });
                },
                specifier: 'Fx_Root$',
                expected: /postprocessor failure/,
                stage: 'Postprocessor execution',
            },
            {
                name: 'Wrapper execution',
                configure(/** @type {TeqFw_Di_Container} */ _container) {},
                specifier: 'Fx_Wrapped$_wrapThenable',
                expected: /must return synchronously \(non-Promise\)/,
                stage: 'Wrapper execution',
            },
        ];

        for (const one of cases) {
            const container = new TeqFw_Di_Container();
            container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
            container.enableIntrospection();
            one.configure(container);

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
            await assert.rejects(() => container.get('Fx_Root$'), /failed state/i);
        }
    });
});
