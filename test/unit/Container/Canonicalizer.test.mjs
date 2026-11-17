import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import TeqFw_Di_Container_Canonicalizer from '../../../src/Container/Canonicalizer.mjs';

const baseDepId = Object.freeze({addressKind: 'teq', address: 'App_Requested', exportName: 'default', lifestyle: 'S', wrappers: Object.freeze([])});

/** @param {object} data @returns {any} */
function fakeDepIdFactory(data) {
    const wrappers = /** @type {{wrappers?: string[]}} */ (data).wrappers ?? [];
    return Object.freeze({...data, wrappers: Object.freeze([...wrappers])});
}

/** @returns {any} */
function fakeParser() {
    return {parse() { return baseDepId; }};
}

describe('TeqFw_Di_Container_Canonicalizer', () => {
    it('keeps parsing separate from ordered effective-identity substitution', () => {
        const depIdFactory = {create: fakeDepIdFactory};
        const canonicalizer = new TeqFw_Di_Container_Canonicalizer({
            parser: /** @type {any} */ (fakeParser()),
            depIdFactory,
        });
        /** @type {number[]} */
        const seen = [];
        canonicalizer.add((depId, context) => {
            seen.push(context.stack.length);
            return depIdFactory.create({...depId, address: 'App_Effective'});
        });

        const requested = canonicalizer.parse('App_Requested$');
        const result = canonicalizer.preprocess(requested);

        assert.equal(requested.address, 'App_Requested');
        assert.equal(result.effective.address, 'App_Effective');
        assert.deepEqual(result.preprocessing.map((one) => one.changed), [true]);
        assert.deepEqual(seen, [1]);
    });

    it('rejects incoherent Preprocessor output before it becomes effective identity', () => {
        const canonicalizer = new TeqFw_Di_Container_Canonicalizer({
            parser: /** @type {any} */ (fakeParser()),
            depIdFactory: {create: fakeDepIdFactory},
        });
        canonicalizer.add((depId) => ({...depId, lifestyle: 'invalid'}));

        assert.throws(() => canonicalizer.canonicalize('App_Requested$'), /Unsupported Dependency Lifestyle/);
    });
});
