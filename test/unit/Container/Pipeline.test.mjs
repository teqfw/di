// @ts-check

/**
 * @namespace TeqFw_Di_Container_Pipeline_Test
 */

import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {executeContainerPipeline} from '../../../src/Container/Pipeline.mjs';
import {Factory as TeqFw_Di_Dto_DepId_Factory} from '../../../src/Dto/DepId.mjs';
import TeqFw_Di_Enum_Composition from '../../../src/Enum/Composition.mjs';
import TeqFw_Di_Enum_Life from '../../../src/Enum/Life.mjs';
import TeqFw_Di_Enum_Platform from '../../../src/Enum/Platform.mjs';

/** @type {TeqFw_Di_Dto_DepId__Factory} */
const factory = new TeqFw_Di_Dto_DepId_Factory();

/**
 * Creates a minimal pipeline context with required stubs.
 *
 * @param {object} [overrides]
 * @returns {TeqFw_Di_Container_Pipeline_Context}
 */
function makeContext(overrides = {}) {
    /** @type {TeqFw_Di_Dto_DepId__DTO} */
    const rootDepId = factory.create({
        moduleName: 'App_Mod',
        platform: TeqFw_Di_Enum_Platform.TEQ,
        exportName: 'default',
        composition: TeqFw_Di_Enum_Composition.FACTORY,
        life: TeqFw_Di_Enum_Life.SINGLETON,
    });

    /** @type {{log(message: string): void, error(message: string, error?: unknown): void}} */
    const logger = {log() {}, error() {}};

    return {
        parser: {
            parse() { return rootDepId; },
        },
        resolver: {
            resolve() { return Promise.resolve({}); },
        },
        graphResolver: {
            resolve() {
                const map = new Map();
                map.set('teq::App_Mod::default::F::S::', {depId: rootDepId, namespace: {}});
                return Promise.resolve(map);
            },
        },
        lifecycle: {
            apply(_depId, producer) { return producer(); },
        },
        instantiator: {
            instantiate() { return {value: 42}; },
        },
        wrapperExecutor: {
            execute(_depId, value) { return value; },
        },
        logger,
        testMode: false,
        mockRegistry: new Map(),
        freeze(value) { return value; },
        applyPreprocess(depId) { return depId; },
        applyPostprocess(value) { return value; },
        ...overrides,
    };
}

describe('TeqFw_Di_Container_Pipeline', () => {
    it('resolves simple dependency through full pipeline', async () => {
        const ctx = makeContext();
        const result = await executeContainerPipeline(ctx, 'App_Mod$');
        assert.deepStrictEqual(result, {value: 42});
    });

    it('returns frozen mock when test mode is enabled and mock is registered', async () => {
        /** @type {TeqFw_Di_Dto_DepId__DTO} */
        const depId = factory.create({
            moduleName: 'App_Mod',
            platform: TeqFw_Di_Enum_Platform.TEQ,
            exportName: 'default',
            composition: TeqFw_Di_Enum_Composition.FACTORY,
            life: TeqFw_Di_Enum_Life.SINGLETON,
        });
        const mockValue = {mocked: true};
        const mockRegistry = new Map();
        mockRegistry.set('teq::App_Mod::default::F::S::', mockValue);
        const ctx = makeContext({
            parser: {parse() { return depId; }},
            testMode: true,
            mockRegistry,
        });
        const result = await executeContainerPipeline(ctx, 'App_Mod$');
        assert.strictEqual(result, mockValue);
    });

    it('bypasses mock when testMode is false even if registry has entry', async () => {
        const mockRegistry = new Map();
        mockRegistry.set('teq::App_Mod::default::F::S::', {mocked: true});
        const ctx = makeContext({testMode: false, mockRegistry});
        const result = await executeContainerPipeline(ctx, 'App_Mod$');
        assert.deepStrictEqual(result, {value: 42});
    });

    it('calls preprocess on parsed depId', async () => {
        /** @type {TeqFw_Di_Dto_DepId__DTO} */
        const original = factory.create({
            moduleName: 'App_Mod',
            platform: TeqFw_Di_Enum_Platform.TEQ,
            exportName: 'default',
            composition: TeqFw_Di_Enum_Composition.FACTORY,
            life: TeqFw_Di_Enum_Life.SINGLETON,
        });
        /** @type {TeqFw_Di_Dto_DepId__DTO} */
        const modified = factory.create({
            moduleName: 'App_Mod',
            platform: TeqFw_Di_Enum_Platform.TEQ,
            exportName: 'Factory',
            composition: TeqFw_Di_Enum_Composition.FACTORY,
            life: TeqFw_Di_Enum_Life.SINGLETON,
        });
        let preprocessCalled = false;
        const ctx = makeContext({
            parser: {parse() { return original; }},
            applyPreprocess(depId) {
                preprocessCalled = true;
                assert.strictEqual(depId.exportName, 'default');
                return modified;
            },
            graphResolver: {
                resolve() {
                    const map = new Map();
                    map.set('teq::App_Mod::Factory::F::S::', {depId: modified, namespace: {}});
                    return Promise.resolve(map);
                },
            },
        });
        await executeContainerPipeline(ctx, 'App_Mod$');
        assert.ok(preprocessCalled);
    });

    it('calls postprocess on instantiated value', async () => {
        /** @type {unknown} */
        let received;
        const ctx = makeContext({
            applyPostprocess(value) { received = value; return value; },
        });
        await executeContainerPipeline(ctx, 'App_Mod$');
        assert.deepStrictEqual(received, {value: 42});
    });

    it('calls wrapper executor after postprocess', async () => {
        /** @type {unknown} */
        let received;
        const ctx = makeContext({
            wrapperExecutor: {
                execute(_depId, value, _ns) {
                    received = value;
                    return value;
                },
            },
        });
        await executeContainerPipeline(ctx, 'App_Mod$');
        assert.deepStrictEqual(received, {value: 42});
    });

    it('throws on parser failure', async () => {
        const ctx = makeContext({
            parser: {
                parse() { throw new Error('parse error'); },
            },
        });
        await assert.rejects(
            () => executeContainerPipeline(ctx, 'bad'),
            /parse error/,
        );
    });

    it('throws on graph resolver failure', async () => {
        const ctx = makeContext({
            graphResolver: {
                resolve() { return Promise.reject(new Error('resolve error')); },
            },
        });
        await assert.rejects(
            () => executeContainerPipeline(ctx, 'App_Mod$'),
            /resolve error/,
        );
    });

    it('throws when graph node is missing for resolved key', async () => {
        const ctx = makeContext({
            graphResolver: {
                resolve() {
                    const map = new Map();
                    // node is missing
                    return Promise.resolve(map);
                },
            },
        });
        await assert.rejects(
            () => executeContainerPipeline(ctx, 'App_Mod$'),
            /graph node is missing/,
        );
    });

    it('throws when infrastructure is not initialized', async () => {
        const ctx = makeContext({
            resolver: undefined,
            graphResolver: undefined,
            lifecycle: undefined,
        });
        await assert.rejects(
            () => executeContainerPipeline(ctx, 'App_Mod$'),
            /infrastructure is not initialized/,
        );
    });
});
