import assert from 'node:assert';
import {describe, it} from 'node:test';

import * as moduleNs from '../../../src2/Enum/Platform.mjs';
import TeqFw_Di_Enum_Platform from '../../../src2/Enum/Platform.mjs';

describe('TeqFw_Di_Enum_Platform', () => {
    it('contains descriptive keys with canonical lowercase values', () => {
        assert.deepStrictEqual(TeqFw_Di_Enum_Platform, {
            TEQ: 'teq',
            NODE: 'node',
            NPM: 'npm',
        });
    });

    it('is flat', () => {
        for (const value of Object.values(TeqFw_Di_Enum_Platform)) {
            assert.notStrictEqual(typeof value, 'object');
        }
    });

    it('is flat and contains only primitive values', () => {
        for (const value of Object.values(TeqFw_Di_Enum_Platform)) {
            const type = typeof value;
            assert.ok((type === 'string') || (type === 'number') || (type === 'boolean'));
            assert.notStrictEqual(type, 'object');
        }
    });

    it('has one-to-one key-to-value mapping', () => {
        const values = Object.values(TeqFw_Di_Enum_Platform);
        assert.strictEqual(new Set(values).size, values.length);
    });

    it('has no additional exports', () => {
        assert.deepStrictEqual(Object.keys(moduleNs).sort(), ['default']);
    });
});
