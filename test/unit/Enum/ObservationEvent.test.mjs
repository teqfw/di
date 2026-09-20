import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import * as moduleNs from '../../../src/Enum/ObservationEvent.mjs';
import TeqFw_Di_Enum_ObservationEvent from '../../../src/Enum/ObservationEvent.mjs';

describe('TeqFw_Di_Enum_ObservationEvent', () => {
    it('contains the canonical closed event vocabulary', () => {
        assert.deepStrictEqual(TeqFw_Di_Enum_ObservationEvent, {
            REQUESTED: 'requested',
            PREPROCESS: 'preprocess',
            EFFECTIVE: 'effective',
            CACHE: 'cache',
            ROUTE: 'route',
            EXPORT: 'export',
            ACQUISITION: 'acquisition',
            CHILD: 'child',
            PRODUCER_INVOCATION: 'producer invocation',
            POSTPROCESS: 'postprocess',
            WRAPPERS: 'wrappers',
            HARDENING: 'hardening',
            FAILURE: 'failure',
            STATE: 'state',
        });
        assert.equal(new Set(Object.values(TeqFw_Di_Enum_ObservationEvent)).size, Object.keys(TeqFw_Di_Enum_ObservationEvent).length);
    });

    it('exports only one flat default enum', () => {
        assert.deepStrictEqual(Object.keys(moduleNs), ['default']);
        assert.ok(Object.isFrozen(TeqFw_Di_Enum_ObservationEvent));
        for (const value of Object.values(TeqFw_Di_Enum_ObservationEvent)) assert.equal(typeof value, 'string');
    });
});
