import test from 'node:test';
import assert from 'node:assert/strict';

import TeqFw_Di_Internal_Logger, {TeqFw_Di_Internal_Logger_Noop} from '../../../src/Internal/Logger.mjs';

test('TeqFw_Di_Internal_Logger', async (t) => {
    await t.test('logs debug messages with default scope prefix', (t) => {
        const logger = new TeqFw_Di_Internal_Logger();
        /** @type {string[]} */
        const captured = [];
        t.mock.method(console, 'debug', (/** @type {string} */ message) => captured.push(message));
        logger.log('resolution-flow:entry');
        assert.deepEqual(captured, ['[teqfw/di] resolution-flow:entry']);
    });

    await t.test('logs errors with custom scope and Error stack when available', (t) => {
        const logger = new TeqFw_Di_Internal_Logger('custom/scope');
        const error = new Error('boom');
        error.stack = 'STACK_TRACE';
        /** @type {unknown[]} */
        const captured = [];
        t.mock.method(console, 'error', (/** @type {unknown} */ message) => captured.push(message));
        logger.error('failed', error);
        assert.deepEqual(captured, ['[custom/scope] failed', 'STACK_TRACE']);
    });

    await t.test('logs non-Error payloads without transformation', (t) => {
        const logger = new TeqFw_Di_Internal_Logger('custom/scope');
        const payload = Object.freeze({code: 'E_CUSTOM'});
        /** @type {unknown[]} */
        const captured = [];
        t.mock.method(console, 'error', (/** @type {unknown} */ message) => captured.push(message));
        logger.error('failed', payload);
        assert.equal(captured[0], '[custom/scope] failed');
        assert.equal(captured[1], payload);
    });

    await t.test('noop logger remains inert', (t) => {
        /** @type {unknown[]} */
        const captured = [];
        t.mock.method(console, 'debug', (/** @type {string} */ message) => captured.push(message));
        t.mock.method(console, 'error', (/** @type {string} */ message) => captured.push(message));
        TeqFw_Di_Internal_Logger_Noop.log('ignored');
        TeqFw_Di_Internal_Logger_Noop.error('ignored', new Error('ignored'));
        assert.deepEqual(captured, []);
        assert.ok(Object.isFrozen(TeqFw_Di_Internal_Logger_Noop));
    });

    await t.test('does not propagate a broken diagnostic sink', (t) => {
        const logger = new TeqFw_Di_Internal_Logger();
        t.mock.method(console, 'debug', () => { throw new Error('sink failed'); });
        t.mock.method(console, 'error', () => { throw new Error('sink failed'); });
        assert.doesNotThrow(() => logger.log('ignored'));
        assert.doesNotThrow(() => logger.error('ignored', new Error('original')));
    });
});
