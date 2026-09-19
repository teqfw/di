import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

import TeqFw_Di_Container from '../../src/Container.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURE_DIR = path.resolve(__dirname, './fixture');

describe('Integration 80: structured introspection', () => {
    it('exposes correlated graph, trace, and explanation for substituted producer resolution', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        container.enableIntrospection();
        container.addPreprocess((depId) => ({
            ...depId,
            moduleName: depId.moduleName === 'Fx_AliasGraphRoot'
                ? 'Fx_GraphRoot'
                : depId.moduleName,
        }));

        const value = await container.get('Fx_AliasGraphRoot$$');
        const observation = /** @type {any} */ (container.getIntrospection());

        assert.equal(value.name, 'graph-root');
        assert.equal(observation.explanation.outcome, 'success');
        assert.ok(Array.isArray(observation.graph.nodes));
        assert.ok(Array.isArray(observation.graph.edges));
        assert.ok(Array.isArray(observation.trace));
        assert.ok(Array.isArray(observation.explanation.decisions));
        assert.ok(observation.graph.edges.some((/** @type {any} */ edge) => edge.dependencyName === 'child'));
        const root = observation.graph.nodes.find((/** @type {any} */ node) => node.requested.address === 'Fx_AliasGraphRoot');
        assert.equal(root.effective.address, 'Fx_GraphRoot');
        assert.ok(observation.trace.some((/** @type {any} */ event) => event.kind === 'route'));
        assert.ok(observation.trace.some((/** @type {any} */ event) => event.kind === 'acquisition' && event.mode === 'producer'));
        assert.ok(Object.isFrozen(observation));
    });

    it('records Singleton miss and hit without re-recording a module route on the hit', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        container.enableIntrospection();

        await container.get('Fx_ObservedSingleton$');
        const miss = /** @type {any} */ (container.getIntrospection());
        await container.get('Fx_ObservedSingleton$');
        const hit = /** @type {any} */ (container.getIntrospection());

        assert.ok(miss.trace.some((/** @type {any} */ event) => event.kind === 'cache' && event.outcome === 'miss'));
        assert.ok(hit.trace.some((/** @type {any} */ event) => event.kind === 'cache' && event.outcome === 'hit'));
        assert.equal(hit.trace.some((/** @type {any} */ event) => event.kind === 'route'), false);
    });

    it('records failure and preserves equivalent resolution when observation is disabled', async () => {
        const observed = new TeqFw_Di_Container();
        const plain = new TeqFw_Di_Container();
        observed.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        plain.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        observed.enableIntrospection();

        const observedValue = await observed.get('Fx_Root$');
        const plainValue = await plain.get('Fx_Root$');

        assert.deepStrictEqual(observedValue, plainValue);

        const failing = new TeqFw_Di_Container();
        failing.enableIntrospection();
        await assert.rejects(() => failing.get('teq:Fx_Root$'));
        const failure = /** @type {any} */ (failing.getIntrospection());

        assert.equal(failure.explanation.outcome, 'failure');
        assert.equal(failure.explanation.containerState, 'failed');
        assert.ok(failure.trace.some((/** @type {any} */ event) => event.kind === 'failure'));
    });
});
