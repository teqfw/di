import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {executeResolution} from '../../../src/Container/Resolution.mjs';
import TeqFw_Di_Enum_ObservationEvent from '../../../src/Enum/ObservationEvent.mjs';

describe('TeqFw_Di_Container_Resolution', () => {
    it('observes route before load and keeps export selection before production', async () => {
        const depId = Object.freeze({addressKind: 'teq', address: 'App_Service', exportName: 'default', lifestyle: 'S', wrappers: Object.freeze([])});
        /** @type {string[]} */
        const order = [];
        /** @type {string[]} */
        const events = [];
        const namespace = {default: () => ({value: 42})};
        const result = await executeResolution(/** @type {any} */ ({
            canonicalizer: {
                parse() { return depId; },
                preprocess() { return {effective: depId, preprocessing: []}; },
            },
            lifecycle: {lookup() { return 'miss'; }, async apply(/** @type {TeqFw_Di_Dto_DepId} */ _depId, /** @type {() => Promise<unknown>} */ onMiss) { return onMiss(); }, evict() {}},
            moduleRouter: {route() { order.push('route'); return {specifier: '/App/Service.mjs'}; }},
            moduleLoader: {
                async load() { order.push('load'); return namespace; },
            },
            producer: {produce(/** @type {Function} */ selected) { order.push('produce'); return selected(); }},
            postprocessor: {apply(/** @type {unknown} */ value) { order.push('postprocess'); return value; }, count() { return 0; }},
            wrapper: {execute(/** @type {TeqFw_Di_Dto_DepId} */ _depId, /** @type {unknown} */ value) { order.push('wrapper'); return value; }},
            hardener: {registerRuntimeOwned() {}, harden(/** @type {unknown} */ value) { order.push('harden'); return {value: Object.freeze(value), mode: 'frozen'}; }},
            findMock() { return {found: false, value: undefined}; },
            logger: {log() {}, error() {}},
            observer: {addNode() {}, addEdge() {}, record(/** @type {string} */ kind) { events.push(kind); }, complete() {}, getSnapshot() { return null; }},
        }), 'App_Service$');

        assert.deepEqual(result.value, {value: 42});
        assert.deepEqual(order, ['route', 'load', 'produce', 'postprocess', 'wrapper', 'harden']);
        assert.ok(events.includes(TeqFw_Di_Enum_ObservationEvent.ROUTE));
        assert.ok(events.includes(TeqFw_Di_Enum_ObservationEvent.SETTLEMENT));
    });
});
