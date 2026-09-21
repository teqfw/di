import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

import TeqFw_Di_Container from '@teqfw/di';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURE_DIR = path.resolve(__dirname, './fixture');

describe('Integration 80: structured introspection', () => {
    it('explains requested-to-effective Teq resolution and records actual graph relationships', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        container.enableIntrospection();
        container.addPreprocess((depId) => ({
            ...depId,
            address: depId.address === 'Fx_AliasGraphRoot'
                ? 'Fx_GraphRoot'
                : depId.address,
        }));

        const value = await container.get('Fx_AliasGraphRoot$');
        const observation = /** @type {any} */ (container.getIntrospection());
        const root = observation.graph.nodes.find((/** @type {any} */ node) => node.requested.address === 'Fx_AliasGraphRoot');
        const explanation = observation.explanation.resolutions.find((/** @type {any} */ item) => item.nodeId === root.nodeId);
        const edge = observation.graph.edges.find((/** @type {any} */ item) => item.dependencyName === 'child');

        assert.equal(value.name, 'graph-root');
        assert.equal(observation.explanation.outcome, 'success');
        assert.deepStrictEqual(Object.keys(root.requested).sort(), [
            'address',
            'addressKind',
            'exportName',
            'lifestyle',
            'wrappers',
        ]);
        assert.equal(root.requested.lifestyle, 'S');
        assert.equal(root.effective.lifestyle, 'S');
        assert.equal(root.effective.address, 'Fx_GraphRoot');
        assert.equal(edge.parentNodeId, root.nodeId);
        assert.equal(edge.requested.addressKind, 'teq');
        assert.equal(edge.effective.address, 'Fx_Child');
        assert.deepStrictEqual(explanation.preprocessing, [{
            index: 0,
            before: root.requested,
            after: root.effective,
            changed: true,
        }]);
        assert.equal(explanation.cache, 'miss');
        assert.equal(explanation.route.addressKind, 'teq');
        assert.equal(explanation.route.moduleSpecifier, path.join(FIXTURE_DIR, 'GraphRoot.mjs'));
        assert.deepStrictEqual(explanation.route.mapping, {
            prefix: 'Fx_',
            target: FIXTURE_DIR,
            defaultExt: '.mjs',
        });
        assert.equal(explanation.exportName, 'default');
        assert.equal(explanation.acquisition, 'producer');
        assert.equal(explanation.children[0].dependencyName, 'child');
        assert.equal(explanation.children[0].effective.address, 'Fx_Child');
        assert.ok(observation.trace.some((/** @type {any} */ event) => event.kind === 'child' && event.dependencyName === 'child'));
        assert.ok(Object.isFrozen(observation));
        assert.ok(Object.isFrozen(observation.graph.nodes));
        assert.ok(Object.isFrozen(explanation));
    });

    it('records a real activation only once and does not invent miss-corridor stages on a Singleton hit', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        container.enableIntrospection();
        container.addPostprocess((value) => value);

        await container.get('Fx_GraphLifestyle$');
        const observation = /** @type {any} */ (container.getIntrospection());
        const singletonResolutions = observation.explanation.resolutions.filter(
            (/** @type {any} */ one) => one.effective.address === 'Fx_ObservedSingleton'
        );
        const missExplanation = singletonResolutions.find((/** @type {any} */ one) => one.cache === 'miss');
        const hitExplanation = singletonResolutions.find((/** @type {any} */ one) => one.cache === 'hit');

        assert.ok(observation.trace.some((/** @type {any} */ event) => event.kind === 'state' && event.from === 'Preparing' && event.to === 'Resolving'));
        assert.ok(observation.trace.some((/** @type {any} */ event) => event.kind === 'state' && event.from === 'Resolving' && event.to === 'Resolved'));
        assert.equal(missExplanation.cache, 'miss');
        assert.equal(missExplanation.postprocessors, 1);
        assert.deepStrictEqual(missExplanation.wrappers, ['wrapTag']);
        assert.deepStrictEqual(missExplanation.hardening, {mode: 'frozen'});
        assert.equal(Object.hasOwn(missExplanation, 'hardened'), false);
        assert.equal(hitExplanation.cache, 'hit');
        for (const kind of ['route', 'export', 'acquisition', 'child', 'postprocess', 'wrappers', 'hardening']) {
            assert.equal(observation.trace.filter((/** @type {any} */ event) => event.nodeId === hitExplanation.nodeId && event.kind === kind).length, 0, `Singleton hit must not record ${kind}.`);
        }
    });

    it('keeps Teq mapping exclusive to the Teq route', async () => {
        const node = new TeqFw_Di_Container();
        node.enableIntrospection();
        const nodeValue = await node.get('node:fs__readFile');
        const nodeRoute = /** @type {any} */ (node.getIntrospection()).explanation.resolutions[0].route;

        const npm = new TeqFw_Di_Container();
        npm.enableIntrospection();
        const npmValue = await npm.get('npm:@teqfw/di__default');
        const npmRoute = /** @type {any} */ (npm.getIntrospection()).explanation.resolutions[0].route;

        assert.equal(typeof nodeValue, 'function');
        assert.equal(nodeRoute.addressKind, 'node');
        assert.equal(nodeRoute.moduleSpecifier, 'node:fs');
        assert.equal(Object.hasOwn(nodeRoute, 'mapping'), false);
        assert.equal(typeof npmValue, 'function');
        assert.equal(npmRoute.addressKind, 'npm');
        assert.equal(npmRoute.moduleSpecifier, '@teqfw/di');
        assert.equal(Object.hasOwn(npmRoute, 'mapping'), false);
    });

    it('records requested Teq to effective Node substitution without Namespace Mapping', async () => {
        const container = new TeqFw_Di_Container();
        container.enableIntrospection();
        container.addPreprocess((depId) => ({
            ...depId,
            addressKind: 'node',
            address: 'path',
            exportName: 'basename',
            lifestyle: 'D',
        }));

        const value = await container.get('Fx_NodeAlias');
        const explanation = /** @type {any} */ (container.getIntrospection()).explanation.resolutions[0];

        assert.equal(typeof value, 'function');
        assert.equal(value('/tmp/example.txt'), 'example.txt');
        assert.equal(explanation.requested.addressKind, 'teq');
        assert.equal(explanation.effective.addressKind, 'node');
        assert.equal(explanation.route.addressKind, 'node');
        assert.equal(explanation.route.moduleSpecifier, 'node:path');
        assert.equal(Object.hasOwn(explanation.route, 'mapping'), false);
    });

    it('records requested Teq to effective npm substitution without Namespace Mapping', async () => {
        const container = new TeqFw_Di_Container();
        container.enableIntrospection();
        container.addPreprocess((depId) => ({
            ...depId,
            addressKind: 'npm',
            address: '@teqfw/di',
            exportName: 'default',
            lifestyle: 'D',
        }));

        const value = await container.get('Fx_NpmAlias');
        const explanation = /** @type {any} */ (container.getIntrospection()).explanation.resolutions[0];

        assert.equal(typeof value, 'function');
        assert.strictEqual(value, TeqFw_Di_Container);
        assert.equal(explanation.requested.addressKind, 'teq');
        assert.equal(explanation.effective.addressKind, 'npm');
        assert.equal(explanation.route.addressKind, 'npm');
        assert.equal(explanation.route.moduleSpecifier, '@teqfw/di');
        assert.equal(Object.hasOwn(explanation.route, 'mapping'), false);
    });

    it('records Direct acquisition without producer child edges', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        container.enableIntrospection();

        await container.get('Fx_DirectProducer__Callable$$$');
        const observation = /** @type {any} */ (container.getIntrospection());

        assert.deepStrictEqual(observation.graph.edges, []);
        assert.equal(observation.explanation.resolutions[0].acquisition, 'direct');
        assert.equal(observation.trace.some((/** @type {any} */ event) => event.kind === 'child'), false);
    });

    it('records Node Address-Kind routing for a declared child dependency', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        container.enableIntrospection();

        const value = await container.get('Fx_NodeChild$');
        const observation = /** @type {any} */ (container.getIntrospection());
        const edge = observation.graph.edges.find((/** @type {any} */ item) => item.dependencyName === 'basename');
        const child = observation.explanation.resolutions.find((/** @type {any} */ item) => item.nodeId === edge.childNodeId);

        assert.deepStrictEqual(value, {name: 'node-child', basename: 'child-node.txt'});
        assert.equal(edge.requested.addressKind, 'node');
        assert.equal(edge.effective.addressKind, 'node');
        assert.equal(child.requested.addressKind, 'node');
        assert.equal(child.effective.addressKind, 'node');
        assert.equal(child.route.addressKind, 'node');
        assert.equal(child.route.moduleSpecifier, 'node:path');
        assert.equal(Object.hasOwn(child.route, 'mapping'), false);
    });

    it('records repeated Direct resolution without Singleton cache reuse', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        container.enableIntrospection();

        const root = await container.get('Fx_GraphLifestyle$');
        const observation = /** @type {any} */ (container.getIntrospection());
        const directResolutions = observation.explanation.resolutions.filter(
            (/** @type {any} */ one) => one.effective.address === 'Fx_DirectProducer' && one.effective.exportName === 'Callable'
        );
        const firstResolution = directResolutions[0];
        const secondResolution = directResolutions[1];

        assert.strictEqual(root.directA, root.directB);
        assert.equal(firstResolution.acquisition, 'direct');
        assert.equal(secondResolution.acquisition, 'direct');
        assert.equal(firstResolution.cache, 'bypass');
        assert.equal(secondResolution.cache, 'bypass');
        assert.equal(observation.trace.some((/** @type {any} */ event) => event.kind === 'cache' && event.outcome === 'hit' && event.nodeId === secondResolution.nodeId), false);
    });

    it('records Export Selection only after it succeeds and before producer traversal', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        container.enableIntrospection();

        await assert.rejects(
            () => container.get('Fx_MissingExportWithDeps$'),
            /Export 'default' is not found/
        );
        const observation = /** @type {any} */ (container.getIntrospection());
        const failure = observation.explanation.failure;
        const routeIndex = observation.trace.findIndex((/** @type {any} */ event) => event.kind === 'route');
        const failureIndex = observation.trace.findIndex((/** @type {any} */ event) => event.kind === 'failure');

        assert.equal(failure.stage, 'Export Selection');
        assert.ok(routeIndex >= 0);
        assert.ok(failureIndex > routeIndex);
        for (const kind of ['export', 'acquisition', 'child', 'producer invocation']) {
            assert.equal(observation.trace.some((/** @type {any} */ event) => event.kind === kind), false, `Missing export must not record ${kind}.`);
        }
    });

    it('orders successful producer events after Export Selection', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        container.enableIntrospection();

        await container.get('Fx_GraphRoot$');
        const trace = /** @type {any[]} */ ((/** @type {any} */ (container.getIntrospection())).trace);
        const rootNodeId = trace.find((event) => event.kind === 'requested' && event.requested.address === 'Fx_GraphRoot').nodeId;
        const rootTrace = trace.filter((event) => event.nodeId === rootNodeId);
        const indexOf = (/** @type {string} */ kind) => rootTrace.findIndex((event) => event.kind === kind);

        assert.ok(indexOf('route') < indexOf('export'));
        assert.ok(indexOf('export') < indexOf('acquisition'));
        assert.ok(indexOf('acquisition') < indexOf('child'));
        assert.ok(indexOf('child') < indexOf('producer invocation'));
    });

    it('classifies default hardening by the final candidate identity', async () => {
        const ordinary = new TeqFw_Di_Container();
        ordinary.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        ordinary.enableIntrospection();
        const ordinaryValue = await ordinary.get('Fx_Root$');
        const ordinaryObservation = /** @type {any} */ (ordinary.getIntrospection());

        const primitive = new TeqFw_Di_Container();
        primitive.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        primitive.enableIntrospection();
        const primitiveValue = await primitive.get('Fx_BadExport__ok');
        const primitiveObservation = /** @type {any} */ (primitive.getIntrospection());

        const spoofed = new TeqFw_Di_Container();
        spoofed.addNamespaceRoot('Fx_', FIXTURE_DIR, '.mjs');
        spoofed.enableIntrospection();
        const spoofedValue = await spoofed.get('Fx_SpoofedModule$');
        const spoofedObservation = /** @type {any} */ (spoofed.getIntrospection());

        const replaced = new TeqFw_Di_Container();
        const replacement = {kind: 'replacement'};
        replaced.enableIntrospection();
        replaced.addPostprocess(() => replacement);
        const replacedValue = await replaced.get('node:fs');
        const replacedObservation = /** @type {any} */ (replaced.getIntrospection());

        assert.equal(Object.isFrozen(ordinaryValue), true);
        assert.equal(ordinaryObservation.explanation.resolutions[0].hardening.mode, 'frozen');
        assert.equal(primitiveValue, 'no-default-export');
        assert.equal(primitiveObservation.explanation.resolutions[0].hardening.mode, 'primitive');
        assert.equal(Object.prototype.toString.call(spoofedValue), '[object Module]');
        assert.equal(Object.isFrozen(spoofedValue), true);
        assert.equal(spoofedObservation.explanation.resolutions[0].hardening.mode, 'frozen');
        assert.strictEqual(replacedValue, replacement);
        assert.equal(Object.isFrozen(replacedValue), true);
        assert.equal(replacedObservation.explanation.resolutions[0].hardening.mode, 'frozen');
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
        assert.equal(failure.explanation.containerState, 'Failed');
        assert.equal(failure.explanation.failure.stage, 'identifier parsing');
        assert.ok(failure.trace.some((/** @type {any} */ event) => event.kind === 'state' && event.from === 'Preparing' && event.to === 'Resolving'));
        assert.ok(failure.trace.some((/** @type {any} */ event) => event.kind === 'state' && event.from === 'Resolving' && event.to === 'Failed'));
    });
});
