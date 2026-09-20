import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import TeqFw_Di_Enum_ObservationEvent from '../../../src/Enum/ObservationEvent.mjs';
import {createObserver, protectObserver} from '../../../src/Container/Observer.mjs';

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
            moduleCache: 'miss',
        });
        observer.record(TeqFw_Di_Enum_ObservationEvent.FAILURE, {
            nodeId: 'root',
            stage: 'module loading',
            cause: 'missing module',
        });
        observer.complete('failure', 'failed');

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

    it('swallows observation-operation failures at the publication boundary', () => {
        let afterFailure = false;
        const observer = {
            addNode() {
                throw new Error('observer failure');
            },
            addEdge() {},
            record() {},
            complete() {},
            getSnapshot() {
                return null;
            },
        };

        const protectedObserver = protectObserver(observer);
        protectedObserver.addNode({});
        protectedObserver.record('failure', {});
        afterFailure = true;

        assert.equal(afterFailure, true);
    });
});
