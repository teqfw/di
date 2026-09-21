import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import TeqFw_Di_Enum_ObservationEvent from '../../../src/Enum/ObservationEvent.mjs';
import {createObserver} from '../../../src/Container/Observer.mjs';

describe('TeqFw_Di_Container_Observer', () => {
    it('records graph, trace, and explanation facts in one immutable snapshot', () => {
        const observer = createObserver('Root$');
        observer.addNode({nodeId: 'root', key: 'root', requested: {address: 'Root'}, effective: {address: 'Root'}});
        observer.addNode({nodeId: 'child', key: 'child', requested: {address: 'Child'}, effective: {address: 'Child'}});
        observer.addEdge({
            parentNodeId: 'root',
            childNodeId: 'child',
            dependencyName: 'child',
            requested: {address: 'Child'},
            effective: {address: 'Child'},
        });
        observer.record(TeqFw_Di_Enum_ObservationEvent.ROUTE, {
            nodeId: 'root',
            addressKind: 'teq',
            moduleSpecifier: '/Root.mjs',
        });
        observer.record(TeqFw_Di_Enum_ObservationEvent.FAILURE, {
            nodeId: 'root',
            stage: 'module loading',
            cause: 'missing module',
        });
        observer.complete('failure', 'Failed');

        const snapshot = /** @type {any} */ (observer.getSnapshot());
        assert.ok(snapshot);
        assert.equal(snapshot.explanation.requestedSpecifier, 'Root$');
        assert.equal(snapshot.graph.nodes.length, 2);
        assert.equal(snapshot.graph.edges[0].dependencyName, 'child');
        assert.equal(snapshot.explanation.resolutions[0].route.moduleSpecifier, '/Root.mjs');
        assert.equal(snapshot.explanation.failure.stage, 'module loading');
        assert.ok(Object.isFrozen(snapshot));
        assert.ok(Object.isFrozen(snapshot.graph));
        assert.ok(Object.isFrozen(snapshot.explanation));
    });

    it('keeps malformed observation operations from escaping the session boundary', () => {
        const observer = createObserver('Root$');
        assert.doesNotThrow(() => observer.addNode(/** @type {any} */ (null)));
        assert.doesNotThrow(() => observer.record('failure', /** @type {any} */ (null)));
        assert.doesNotThrow(() => observer.complete('failure', 'Failed'));
    });
});
