import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import TeqFw_Di_Container_Canonicalizer from '../../../src/Container/Canonicalizer.mjs';
import TeqFw_Di_Parser from '../../../src/Parser.mjs';
import {Factory as DepIdFactory} from '../../../src/Dto/DepId.mjs';

describe('TeqFw_Di_Container_Canonicalizer', () => {
    it('keeps parsing separate from ordered effective-identity substitution', () => {
        const depIdFactory = new DepIdFactory();
        const canonicalizer = new TeqFw_Di_Container_Canonicalizer({
            parser: new TeqFw_Di_Parser(),
            depIdFactory,
        });
        /** @type {number[]} */
        const seen = [];
        canonicalizer.add((depId, context) => {
            seen.push(context.stack.length);
            return depIdFactory.create({...depId, moduleName: 'App_Effective'});
        });

        const result = canonicalizer.canonicalize('App_Requested$');

        assert.equal(result.requested.moduleName, 'App_Requested');
        assert.equal(result.effective.moduleName, 'App_Effective');
        assert.deepEqual(result.preprocessing.map((one) => one.changed), [true]);
        assert.deepEqual(seen, [1]);
    });
});
