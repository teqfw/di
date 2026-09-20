import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import TeqFw_Di_Container_Postprocessor from '../../../src/Container/Postprocessor.mjs';

describe('TeqFw_Di_Container_Postprocessor', () => {
    it('applies configured processors in registration order and rejects async output', () => {
        const postprocessor = new TeqFw_Di_Container_Postprocessor();
        postprocessor.add((value) => `${value}:first`);
        postprocessor.add((value) => `${value}:second`);

        assert.equal(postprocessor.count(), 2);
        assert.equal(postprocessor.apply('value', /** @type {any} */ ({})), 'value:first:second');

        const invalid = new TeqFw_Di_Container_Postprocessor();
        invalid.add(() => Promise.resolve('later'));
        assert.throws(() => invalid.apply('value', /** @type {any} */ ({})), /synchronously/);
    });
});
