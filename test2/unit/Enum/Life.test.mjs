import assert from 'node:assert';
import {describe, it} from 'node:test';

import * as moduleNs from '../../../src2/Enum/Life.mjs';
import TeqFw_Di_Enum_Life from '../../../src2/Enum/Life.mjs';

describe('TeqFw_Di_Enum_Life', () => {
    it('contains only descriptive keys with canonical values', () => {
        assert.deepStrictEqual(TeqFw_Di_Enum_Life, {
            SINGLETON: 'S',
            INSTANCE: 'I',
        });
    });

    it('is flat', () => {
        for (const value of Object.values(TeqFw_Di_Enum_Life)) {
            assert.notStrictEqual(typeof value, 'object');
        }
    });

    it('is flat and contains only primitive values', () => {
        for (const value of Object.values(TeqFw_Di_Enum_Life)) {
            const type = typeof value;
            assert.ok((type === 'string') || (type === 'number') || (type === 'boolean'));
            assert.notStrictEqual(type, 'object');
        }
    });

    it('has one-to-one key-to-value mapping', () => {
        const values = Object.values(TeqFw_Di_Enum_Life);
        assert.strictEqual(new Set(values).size, values.length);
    });

    it('has no additional exports', () => {
        assert.deepStrictEqual(Object.keys(moduleNs).sort(), ['default']);
    });
});
