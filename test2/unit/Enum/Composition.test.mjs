import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import * as moduleNs from '../../../src2/Enum/Composition.mjs';
import TeqFw_Di_Enum_Composition from '../../../src2/Enum/Composition.mjs';

describe('TeqFw_Di_Enum_Composition', () => {
    it('contains only descriptive keys with canonical values', () => {
        assert.deepStrictEqual(TeqFw_Di_Enum_Composition, {
            AS_IS: 'A',
            FACTORY: 'F',
        });
    });

    it('is flat', () => {
        for (const value of Object.values(TeqFw_Di_Enum_Composition)) {
            assert.notStrictEqual(typeof value, 'object');
        }
    });

    it('is flat and contains only primitive values', () => {
        for (const value of Object.values(TeqFw_Di_Enum_Composition)) {
            const type = typeof value;
            assert.ok((type === 'string') || (type === 'number') || (type === 'boolean'));
            assert.notStrictEqual(type, 'object');
        }
    });

    it('has one-to-one key-to-value mapping', () => {
        const values = Object.values(TeqFw_Di_Enum_Composition);
        assert.strictEqual(new Set(values).size, values.length);
    });

    it('has no additional exports', () => {
        assert.deepStrictEqual(Object.keys(moduleNs).sort(), ['default']);
    });
});
