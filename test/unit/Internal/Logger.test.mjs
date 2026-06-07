import test from 'node:test';
import assert from 'node:assert/strict';

import TeqFw_Di_Internal_Logger, {TeqFw_Di_Internal_Logger_Noop} from '../../../src/Internal/Logger.mjs';

test('TeqFw_Di_Internal_Logger', async (t) => {
    /**
     * Captures console traffic for isolated logger checks.
     *
     * @param {() => Promise<void> | void} action
     * @returns {Promise<{debug: string[], error: unknown[]}>}
     */
    async function withCapturedConsole(action) {
        const originalDebug = console.debug;
        const originalError = console.error;
        const captured = {debug: [], error: []};
        console.debug = (message) => captured.debug.push(message);
        console.error = (message) => captured.error.push(message);
        try {
            await action();
            return captured;
        } finally {
            console.debug = originalDebug;
            console.error = originalError;
        }
    }

    await t.test('logs debug messages with default scope prefix', async () => {
        const logger = new TeqFw_Di_Internal_Logger();
        const captured = await withCapturedConsole(() => {
            logger.log('pipeline:entry');
        });
        assert.deepEqual(captured.debug, ['[teqfw/di] pipeline:entry']);
        assert.deepEqual(captured.error, []);
    });

    await t.test('logs errors with custom scope and Error stack when available', async () => {
        const logger = new TeqFw_Di_Internal_Logger('custom/scope');
        const error = new Error('boom');
        error.stack = 'STACK_TRACE';
        const captured = await withCapturedConsole(() => {
            logger.error('failed', error);
        });
        assert.deepEqual(captured.debug, []);
        assert.deepEqual(captured.error, ['[custom/scope] failed', 'STACK_TRACE']);
    });

    await t.test('logs non-Error payloads without transformation', async () => {
        const logger = new TeqFw_Di_Internal_Logger('custom/scope');
        const payload = Object.freeze({code: 'E_CUSTOM'});
        const captured = await withCapturedConsole(() => {
            logger.error('failed', payload);
        });
        assert.deepEqual(captured.debug, []);
        assert.equal(captured.error[0], '[custom/scope] failed');
        assert.equal(captured.error[1], payload);
    });

    await t.test('noop logger remains inert', async () => {
        const captured = await withCapturedConsole(() => {
            TeqFw_Di_Internal_Logger_Noop.log('ignored');
            TeqFw_Di_Internal_Logger_Noop.error('ignored', new Error('ignored'));
        });
        assert.deepEqual(captured.debug, []);
        assert.deepEqual(captured.error, []);
        assert.ok(Object.isFrozen(TeqFw_Di_Internal_Logger_Noop));
    });
});
