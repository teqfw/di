import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import * as moduleNs from '../../../src/Enum/AddressKind.mjs';
import TeqFw_Di_Enum_AddressKind from '../../../src/Enum/AddressKind.mjs';

describe('TeqFw_Di_Enum_AddressKind', () => {
    it('contains descriptive keys with canonical lowercase values', () => {
        assert.deepStrictEqual(TeqFw_Di_Enum_AddressKind, {
            TEQ: 'teq',
            NODE: 'node',
            NPM: 'npm',
        });
    });

    it('is a flat one-to-one value map with only a default export', () => {
        const values = Object.values(TeqFw_Di_Enum_AddressKind);
        assert.ok(values.every((value) => ['string', 'number', 'boolean'].includes(typeof value)));
        assert.equal(new Set(values).size, values.length);
        assert.deepStrictEqual(Object.keys(moduleNs).sort(), ['default']);
    });
});
