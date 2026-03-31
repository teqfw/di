import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

import TeqFw_Di_Container from '../../src/Container.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURE_DIR = path.resolve(__dirname, '../fixtures/deps');

describe('Integration 35: dependency fixture forms', () => {
    it('resolves hierarchical __deps__ for default and named exports', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('TestSample_', FIXTURE_DIR, '.mjs');
        container.enableTestMode();

        const defaultValue = await container.get('TestSample_Canonical$');
        const factoryValue = await container.get('TestSample_Canonical__Factory$');

        assert.equal(typeof defaultValue.start, 'function');
        assert.equal(typeof defaultValue.getStartedAt, 'function');
        assert.equal(defaultValue.getStartedAt(), null);

        const startedAt = defaultValue.start();
        assert.equal(startedAt.toISOString(), '2026-03-31T00:00:00.000Z');
        assert.equal(defaultValue.getStartedAt().toISOString(), '2026-03-31T00:00:00.000Z');

        assert.equal(typeof factoryValue.create, 'function');
        const created = factoryValue.create('canonical');
        assert.equal(created.name, 'canonical');
        assert.equal(created.createdAt.toISOString(), '2026-03-31T00:00:00.000Z');
    });

    it('resolves flat shorthand __deps__ for single-export form', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('TestSample_', FIXTURE_DIR, '.mjs');
        container.enableTestMode();

        const value = await container.get('TestSample_Shorthand$');

        assert.equal(typeof value.start, 'function');
        assert.equal(value.start().toISOString(), '2026-03-31T00:00:00.000Z');
    });

    it('resolves empty descriptor modules without mock dependencies', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('TestSample_', FIXTURE_DIR, '.mjs');

        const value = await container.get('TestSample_Empty$');

        assert.equal(typeof value.start, 'function');
        assert.equal(value.getStartedAt(), null);
        const startedAt = value.start();
        assert.equal(typeof startedAt, 'number');
        assert.ok(Number.isFinite(startedAt));
        assert.ok(startedAt > 0);
    });
});
