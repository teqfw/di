import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import * as moduleNs from '../../../src/Enum/Lifestyle.mjs';
import TeqFw_Di_Enum_Lifestyle from '../../../src/Enum/Lifestyle.mjs';

describe('TeqFw_Di_Enum_Lifestyle', () => {
    it('contains Direct, Singleton, and Transient canonical values', () => {
        assert.deepStrictEqual(TeqFw_Di_Enum_Lifestyle, {
            DIRECT: 'D',
            SINGLETON: 'S',
            TRANSIENT: 'T',
        });
    });

    it('is a flat one-to-one value map with only a default export', () => {
        const values = Object.values(TeqFw_Di_Enum_Lifestyle);
        assert.ok(values.every((value) => ['string', 'number', 'boolean'].includes(typeof value)));
        assert.equal(new Set(values).size, values.length);
        assert.deepStrictEqual(Object.keys(moduleNs).sort(), ['default']);
    });
});
