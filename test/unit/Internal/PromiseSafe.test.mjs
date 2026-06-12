// @ts-check

/**
 * @namespace TeqFw_Di_Internal_PromiseSafe_Test
 */

import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {makePromiseSafe} from '../../../src/Internal/PromiseSafe.mjs';

describe('TeqFw_Di_Internal_PromiseSafe', () => {
    it('returns primitives as-is', () => {
        assert.strictEqual(makePromiseSafe(null), null);
        assert.strictEqual(makePromiseSafe(undefined), undefined);
        assert.strictEqual(makePromiseSafe(42), 42);
        assert.strictEqual(makePromiseSafe('hello'), 'hello');
        assert.strictEqual(makePromiseSafe(true), true);
    });

    it('returns frozen object without then as-is', () => {
        const obj = Object.freeze({a: 1});
        assert.strictEqual(makePromiseSafe(obj), obj);
    });

    it('returns non-thenable object as-is', () => {
        const obj = {a: 1, b: 2};
        assert.strictEqual(makePromiseSafe(obj), obj);
    });

    it('returns object with safe then prop as-is', () => {
        const obj = {then: 42};
        assert.strictEqual(makePromiseSafe(obj), obj);
    });

    it('wraps proxy that throws on then access', () => {
        const target = {value: 42};
        const proxy = new Proxy(target, {
            get(obj, prop) {
                if (prop === 'then') throw new Error('blocked');
                return obj[prop];
            },
        });
        const safe = makePromiseSafe(proxy);
        assert.notStrictEqual(safe, proxy);
        assert.strictEqual(safe.value, 42);
        assert.strictEqual(safe.then, undefined);
    });

    it('caches wrapped proxy and returns same wrapper', () => {
        const target = {value: 42};
        const proxy = new Proxy(target, {
            get(obj, prop) {
                if (prop === 'then') throw new Error('blocked');
                return obj[prop];
            },
        });
        const safe1 = makePromiseSafe(proxy);
        const safe2 = makePromiseSafe(proxy);
        assert.strictEqual(safe1, safe2);
    });

    it('does not wrap non-object values', () => {
        assert.strictEqual(makePromiseSafe(null), null);
        assert.strictEqual(makePromiseSafe(undefined), undefined);
        assert.strictEqual(makePromiseSafe(0), 0);
        assert.strictEqual(makePromiseSafe(''), '');
    });

    it('preserves property access on wrapped proxy', () => {
        const target = {a: 1, b: 2};
        const proxy = new Proxy(target, {
            get(obj, prop) {
                if (prop === 'then') throw new Error('blocked');
                return obj[prop];
            },
        });
        const safe = makePromiseSafe(proxy);
        assert.strictEqual(safe.a, 1);
        assert.strictEqual(safe.b, 2);
        assert.strictEqual(safe.then, undefined);
    });

    it('is deterministic for identical inputs', () => {
        const obj = {x: 10};
        const r1 = makePromiseSafe(obj);
        const r2 = makePromiseSafe(obj);
        assert.strictEqual(r1, r2);
    });
});
