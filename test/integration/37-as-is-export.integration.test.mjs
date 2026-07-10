import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

import TeqFw_Di_Container from '../../src/Container.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURE_DIR = path.resolve(__dirname, '../fixtures/deps');

describe('Integration 37: as-is export resolution', () => {
    it('resolves default export as-is and allows manual instantiation', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('TestSample_', FIXTURE_DIR, '.mjs');

        const RootClass = await container.get('TestSample_Canonical__default');

        assert.equal(typeof RootClass, 'function');

        const clock = await container.get('TestSample_Helper_Clock$');
        const instance = new RootClass({clock});

        assert.equal(typeof instance.start, 'function');
        const startedAt = instance.start();
        assert.ok(startedAt instanceof Date);
        assert.equal(startedAt.toISOString(), '2026-03-31T00:00:00.000Z');
    });

    it('resolves named export as-is and allows manual instantiation', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('TestSample_', FIXTURE_DIR, '.mjs');

        const FactoryClass = await container.get('TestSample_Canonical__Factory');

        assert.equal(typeof FactoryClass, 'function');

        const clock = await container.get('TestSample_Helper_Clock$');
        const logger = await container.get('TestSample_Helper_Logger$');
        const factory = new FactoryClass({logger, clock});

        assert.equal(typeof factory.create, 'function');
        const result = factory.create('as-is-test');
        assert.equal(result.name, 'as-is-test');
        assert.ok(result.createdAt instanceof Date);
    });

    it('resolves singleton with lifecycle marker still produces instance', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('TestSample_', FIXTURE_DIR, '.mjs');

        const instance = await container.get('TestSample_Canonical$');

        assert.equal(typeof instance.start, 'function');
        assert.notEqual(typeof instance, 'function');
        const startedAt = instance.start();
        assert.equal(startedAt.toISOString(), '2026-03-31T00:00:00.000Z');
    });

    it('resolves whole namespace as-is without export name', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('TestSample_', FIXTURE_DIR, '.mjs');

        const namespace = await container.get('TestSample_Canonical');

        assert.equal(typeof namespace, 'object');
        assert.equal(typeof namespace.default, 'function');
        assert.equal(typeof namespace.__deps__, 'object');
    });
});
