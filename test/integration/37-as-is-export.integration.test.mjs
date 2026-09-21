import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

import TeqFw_Di_Container from '@teqfw/di';
import Clock from '../fixtures/deps/Helper/Clock.mjs';
import Logger from '../fixtures/deps/Helper/Logger.mjs';
import {
    Callable,
    DirectClass,
    getCallableCalls,
    getClassCalls,
} from './fixture/DirectProducer.mjs';
import {value as alreadyFrozen} from './fixture/AlreadyFrozen.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURE_DIR = path.resolve(__dirname, '../fixtures/deps');

describe('Integration 37: as-is export resolution', () => {
    it('resolves default export as-is and allows manual instantiation', async () => {
        const container = new TeqFw_Di_Container();
        container.addNamespaceRoot('TestSample_', FIXTURE_DIR, '.mjs');

        const RootClass = await container.get('TestSample_Canonical__default');

        assert.equal(typeof RootClass, 'function');

        const clock = new Clock();
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

        const clock = new Clock();
        const logger = new Logger();
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

    it('does not invoke callable or class Direct exports or inspect their producer declarations', async () => {
        const directFixtureDir = path.resolve(__dirname, './fixture');

        const callableContainer = new TeqFw_Di_Container();
        callableContainer.addNamespaceRoot('Fx_', directFixtureDir, '.mjs');
        callableContainer.enableIntrospection();
        const callable = await callableContainer.get('Fx_DirectProducer__Callable');
        const callableObservation = /** @type {any} */ (callableContainer.getIntrospection());

        const classContainer = new TeqFw_Di_Container();
        classContainer.addNamespaceRoot('Fx_', directFixtureDir, '.mjs');
        classContainer.enableIntrospection();
        const directClass = await classContainer.get('Fx_DirectProducer__DirectClass');
        const classObservation = /** @type {any} */ (classContainer.getIntrospection());

        assert.strictEqual(callable, Callable);
        assert.strictEqual(directClass, DirectClass);
        assert.equal(Object.isFrozen(callable), true);
        assert.equal(Object.isFrozen(directClass), true);
        assert.equal(callableObservation.explanation.resolutions[0].hardening.mode, 'frozen');
        assert.equal(classObservation.explanation.resolutions[0].hardening.mode, 'frozen');
        assert.equal(getCallableCalls(), 0);
        assert.equal(getClassCalls(), 0);
    });

    it('keeps explicit $$$ Direct as-is before applicable wrapper adaptation', async () => {
        const directFixtureDir = path.resolve(__dirname, './fixture');

        const explicitContainer = new TeqFw_Di_Container();
        explicitContainer.addNamespaceRoot('Fx_', directFixtureDir, '.mjs');
        const explicitDirect = await explicitContainer.get('Fx_DirectProducer$$$');

        const wrappedContainer = new TeqFw_Di_Container();
        wrappedContainer.addNamespaceRoot('Fx_', directFixtureDir, '.mjs');
        const value = await wrappedContainer.get('Fx_DirectProducer__Callable$$$_wrapIdentity');

        assert.strictEqual(explicitDirect, DirectClass);
        assert.strictEqual(value.value, Callable);
        assert.equal(value.wrapped, true);
        assert.ok(Object.isFrozen(value));
        assert.equal(getCallableCalls(), 0);
        assert.equal(getClassCalls(), 0);
    });

    it('preserves an already frozen Direct value', async () => {
        const container = new TeqFw_Di_Container();
        const directFixtureDir = path.resolve(__dirname, './fixture');
        container.addNamespaceRoot('Fx_', directFixtureDir, '.mjs');
        container.enableIntrospection();

        const value = await container.get('Fx_AlreadyFrozen__value');
        const observation = /** @type {any} */ (container.getIntrospection());

        assert.strictEqual(value, alreadyFrozen);
        assert.equal(Object.isFrozen(value), true);
        assert.equal(observation.explanation.resolutions[0].hardening.mode, 'already-frozen');
    });

    it('exposes a native ES Module Namespace through Direct without freezing it', async () => {
        const expected = await import('node:fs');
        const container = new TeqFw_Di_Container();
        container.enableIntrospection();

        const value = await container.get('node:fs');
        const observation = /** @type {any} */ (container.getIntrospection());

        assert.strictEqual(value, expected);
        assert.equal(Object.prototype.toString.call(value), '[object Module]');
        assert.equal(Object.isFrozen(value), false);
        assert.equal(observation.explanation.resolutions[0].hardening.mode, 'runtime-owned');
        assert.equal(observation.trace.find((/** @type {any} */ event) => event.kind === 'hardening').mode, 'runtime-owned');
    });
});
