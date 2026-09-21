import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {executeResolution} from '../../../src/Container/Resolution.mjs';
import TeqFw_Di_Container_Hardener from '../../../src/Container/Hardener.mjs';
import TeqFw_Di_Container_Lifecycle from '../../../src/Container/Lifecycle.mjs';
import TeqFw_Di_Container_Postprocessor from '../../../src/Container/Postprocessor.mjs';
import TeqFw_Di_Container_Producer from '../../../src/Container/Producer.mjs';
import TeqFw_Di_Container_Wrapper from '../../../src/Container/Wrapper.mjs';
import {createObserver} from '../../../src/Container/Observer.mjs';
import TeqFw_Di_Enum_Life from '../../../src/Enum/Life.mjs';
import TeqFw_Di_Enum_ObservationEvent from '../../../src/Enum/ObservationEvent.mjs';
import TeqFw_Di_Enum_Platform from '../../../src/Enum/Platform.mjs';
import {Factory as DepIdFactory} from '../../../src/Dto/DepId.mjs';

const factory = new DepIdFactory();

describe('TeqFw_Di_Container_Resolution', () => {
    it('observes route before load and keeps export selection before production', async () => {
        const depId = factory.create({
            moduleName: 'App_Service',
            platform: TeqFw_Di_Enum_Platform.TEQ,
            exportName: 'default',
            life: TeqFw_Di_Enum_Life.SINGLETON,
            wrappers: [],
        });
        const observer = createObserver('App_Service$');
        /** @type {string[]} */
        const order = [];
        const namespace = {default: () => ({value: 42})};
        const result = await executeResolution(/** @type {any} */ ({
            canonicalizer: {canonicalize() { return {requested: depId, effective: depId, preprocessing: []}; }},
            lifecycle: new TeqFw_Di_Container_Lifecycle(),
            moduleRouter: {route() { order.push('route'); return {specifier: '/App/Service.mjs'}; }},
            moduleLoader: {
                async load() { order.push('load'); return namespace; },
            },
            producer: new TeqFw_Di_Container_Producer(),
            postprocessor: new TeqFw_Di_Container_Postprocessor(),
            wrapper: new TeqFw_Di_Container_Wrapper(),
            hardener: new TeqFw_Di_Container_Hardener(),
            findMock() { return {found: false, value: undefined}; },
            logger: {log() {}, error() {}},
            observer,
        }), 'App_Service$');

        assert.deepEqual(result, {value: 42});
        assert.deepEqual(order, ['route', 'load']);
        observer.complete('success', 'Resolved');
        const snapshot = /** @type {any} */ (observer.getSnapshot());
        const events = /** @type {any[]} */ (snapshot.trace).map((event) => event.kind);
        assert.ok(events.includes(TeqFw_Di_Enum_ObservationEvent.ROUTE));
    });
});
