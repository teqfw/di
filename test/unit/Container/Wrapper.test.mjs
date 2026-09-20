import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import TeqFw_Di_Container_Wrapper from '../../../src/Container/Wrapper.mjs';

describe('TeqFw_Di_Container_Wrapper', () => {
    it('looks up and applies selected wrappers in order', () => {
        const wrapper = new TeqFw_Di_Container_Wrapper();
        const depId = /** @type {any} */ ({wrappers: ['first', 'second']});
        const namespace = {
            first: (/** @type {unknown} */ value) => `${value}:first`,
            second: (/** @type {unknown} */ value) => `${value}:second`,
        };

        assert.equal(wrapper.execute(depId, 'value', namespace), 'value:first:second');
        assert.throws(() => wrapper.execute(/** @type {any} */ ({wrappers: ['missing']}), 'value', namespace), /not found/);
    });
});
