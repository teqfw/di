// @ts-check

/**
 * @namespace TeqFw_Di_Container_Pipeline_Test
 */

import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {executeContainerPipeline} from '../../../src/Container/Pipeline.mjs';
import TeqFw_Di_Container_Instantiate from '../../../src/Container/Instantiate.mjs';
import TeqFw_Di_Container_Lifecycle from '../../../src/Container/Lifecycle.mjs';
import {Factory as TeqFw_Di_Dto_DepId_Factory} from '../../../src/Dto/DepId.mjs';
import TeqFw_Di_Enum_Life from '../../../src/Enum/Life.mjs';
import TeqFw_Di_Enum_Platform from '../../../src/Enum/Platform.mjs';

/** @type {TeqFw_Di_Dto_DepId__Factory} */
const factory = new TeqFw_Di_Dto_DepId_Factory();

/**
 * @param {Partial<TeqFw_Di_Dto_DepId>} [patch]
 * @returns {TeqFw_Di_Dto_DepId}
 */
function createDepId(patch = {}) {
    return factory.create({
        moduleName: 'App_Mod',
        platform: TeqFw_Di_Enum_Platform.TEQ,
        exportName: 'default',
        life: TeqFw_Di_Enum_Life.SINGLETON,
        origin: 'App_Mod$',
        ...patch,
    });
}

/**
 * Creates a minimal pipeline context with controllable collaborators.
 *
 * @param {object} [overrides]
 * @returns {Parameters<typeof executeContainerPipeline>[0]}
 */
function makeContext(overrides = {}) {
    const depId = createDepId();
    /** @type {{log(message: string): void, error(message: string, error?: unknown): void}} */
    const logger = {log() {}, error() {}};
    /** @type {object} */
    const namespace = {default: () => ({value: 42})};
    const resolver = /** @type {TeqFw_Di_Resolver} */ (/** @type {unknown} */ ({
        async resolveWithDetails() {
            return {namespace, specifier: '/App/Mod.mjs', cache: 'miss'};
        },
        async resolve() {
            return namespace;
        },
    }));

    return {
        canonicalize() { return {requested: depId, effective: depId, preprocessing: []}; },
        resolver,
        lifecycle: new TeqFw_Di_Container_Lifecycle(),
        instantiator: {
            select(/** @type {TeqFw_Di_Dto_DepId} */ _depId, /** @type {object} */ loadedNamespace) {
                return /** @type {Record<string, unknown>} */ (loadedNamespace).default;
            },
            produce() { return {value: 42}; },
        },
        wrapperExecutor: {
            execute(_depId, value) { return value; },
        },
        logger,
        harden(value) { return {value, mode: 'frozen'}; },
        registerRuntimeOwnedNamespace() {},
        findMock() { return {found: false, value: undefined}; },
        applyPostprocess(value) { return value; },
        postprocessCount: 0,
        ...overrides,
    };
}

describe('TeqFw_Di_Container_Pipeline', () => {
    it('resolves a producer through the full common output corridor', async () => {
        const ctx = makeContext();

        const result = await executeContainerPipeline(ctx, 'App_Mod$');

        assert.deepStrictEqual(result, {value: 42});
    });

    it('applies postprocessing and hardening to a test substitution', async () => {
        const mock = {source: 'mock'};
        let postprocessCalls = 0;
        let hardeningCalls = 0;
        /** @type {{kind: string, data: Record<string, unknown>}[]} */
        const records = [];
        const ctx = makeContext({
            findMock() { return {found: true, value: mock}; },
            applyPostprocess(/** @type {unknown} */ value) {
                postprocessCalls += 1;
                return {.../** @type {object} */ (value), postprocessed: true};
            },
            harden(/** @type {unknown} */ value) {
                hardeningCalls += 1;
                return {value: Object.freeze(/** @type {object} */ (value)), mode: 'configured'};
            },
            observer: {
                addNode() {},
                addEdge() {},
                record(/** @type {string} */ kind, /** @type {Record<string, unknown>} */ data) { records.push({kind, data}); },
            },
        });

        const result = await executeContainerPipeline(ctx, 'App_Mod$');

        assert.deepStrictEqual(result, {source: 'mock', postprocessed: true});
        assert.ok(Object.isFrozen(result));
        assert.equal(postprocessCalls, 1);
        assert.equal(hardeningCalls, 1);
        assert.equal(records.find((record) => record.kind === 'hardening')?.data.mode, 'configured');
    });

    it('returns a singleton hit before resolver and output processing repeat', async () => {
        let resolverCalls = 0;
        let producerCalls = 0;
        let postprocessCalls = 0;
        let wrapperCalls = 0;
        let hardeningCalls = 0;
        const ctx = makeContext({
            resolver: /** @type {TeqFw_Di_Resolver} */ (/** @type {unknown} */ ({
                async resolveWithDetails() {
                    resolverCalls += 1;
                    return {namespace: {default: () => ({})}, specifier: '/App/Mod.mjs', cache: 'miss'};
                },
                async resolve() { return {default: () => ({})}; },
            })),
            instantiator: {
                select(/** @type {TeqFw_Di_Dto_DepId} */ _depId, /** @type {object} */ namespace) {
                    return /** @type {Record<string, unknown>} */ (namespace).default;
                },
                produce() {
                    producerCalls += 1;
                    return {value: producerCalls};
                },
            },
            applyPostprocess(/** @type {unknown} */ value) {
                postprocessCalls += 1;
                return value;
            },
            wrapperExecutor: {
                execute(/** @type {TeqFw_Di_Dto_DepId} */ _depId, /** @type {unknown} */ value) {
                    wrapperCalls += 1;
                    return value;
                },
            },
            harden(/** @type {unknown} */ value) {
                hardeningCalls += 1;
                return {value: Object.freeze(/** @type {object} */ (value)), mode: 'frozen'};
            },
        });

        const first = await executeContainerPipeline(ctx, 'App_Mod$');
        const second = await executeContainerPipeline(ctx, 'App_Mod$');

        assert.strictEqual(first, second);
        assert.equal(resolverCalls, 1);
        assert.equal(producerCalls, 1);
        assert.equal(postprocessCalls, 1);
        assert.equal(wrapperCalls, 1);
        assert.equal(hardeningCalls, 1);
    });

    it('passes requested and effective identifiers to the observation collector', async () => {
        const requested = createDepId({moduleName: 'App_Request', origin: 'App_Request$'});
        const effective = createDepId({moduleName: 'App_Effective', origin: 'App_Request$'});
        /** @type {{kind: string, data: Record<string, unknown>}[]} */
        const records = [];
        /** @type {Record<string, unknown>[]} */
        const nodes = [];
        const ctx = makeContext({
            canonicalize() { return {requested, effective, preprocessing: []}; },
            observer: {
                addNode(/** @type {Record<string, unknown>} */ data) { nodes.push(data); },
                addEdge(/** @type {Record<string, unknown>} */ _data) {},
                record(/** @type {string} */ kind, /** @type {Record<string, unknown>} */ data) { records.push({kind, data}); },
            },
        });

        await executeContainerPipeline(ctx, 'App_Request$');

        assert.equal((/** @type {{requested: {address: string}, effective: {address: string}}} */ (nodes[0])).requested.address, 'App_Request');
        assert.equal((/** @type {{requested: {address: string}, effective: {address: string}}} */ (nodes[0])).effective.address, 'App_Effective');
        assert.equal((/** @type {{effective: {address: string}}} */ (records.find((record) => record.kind === 'effective')?.data)).effective.address, 'App_Effective');
    });

    it('propagates canonicalization and module-loading failures', async () => {
        await assert.rejects(
            () => executeContainerPipeline(makeContext({canonicalize() { throw new Error('parse error'); }}), 'bad'),
            /parse error/
        );
        await assert.rejects(
            () => executeContainerPipeline(makeContext({
                resolver: /** @type {TeqFw_Di_Resolver} */ (/** @type {unknown} */ ({
                    async resolveWithDetails() { throw new Error('resolve error'); },
                    async resolve() { throw new Error('resolve error'); },
                })),
            }), 'App_Mod$'),
            /resolve error/
        );
    });

    it('fails missing Export Selection before reading producer declarations', async () => {
        let declarationReads = 0;
        /** @type {{kind: string, data: Record<string, unknown>}[]} */
        const records = [];
        const ctx = makeContext({
            resolver: /** @type {TeqFw_Di_Resolver} */ (/** @type {unknown} */ ({
                async resolveWithDetails() {
                    return {
                        namespace: {
                            get __deps__() {
                                declarationReads += 1;
                                return {child: 'App_Child$'};
                            },
                        },
                        specifier: '/App/Mod.mjs',
                        cache: 'miss',
                    };
                },
            })),
            instantiator: new TeqFw_Di_Container_Instantiate(),
            observer: {
                addNode() {},
                addEdge() {},
                record(/** @type {string} */ kind, /** @type {Record<string, unknown>} */ data) { records.push({kind, data}); },
            },
        });

        await assert.rejects(
            () => executeContainerPipeline(ctx, 'App_Mod$'),
            /Export 'default' is not found/
        );

        assert.equal(declarationReads, 0);
        assert.ok(records.some((record) => record.kind === 'route'));
        assert.equal(records.some((record) => record.kind === 'export'), false);
        assert.equal(records.some((record) => record.kind === 'child'), false);
        assert.equal(records.find((record) => record.kind === 'failure')?.data.stage, 'Export Selection');
    });

    it('throws when infrastructure is not initialized', async () => {
        const ctx = makeContext({resolver: undefined, lifecycle: undefined});
        await assert.rejects(
            () => executeContainerPipeline(ctx, 'App_Mod$'),
            /infrastructure is not initialized/
        );
    });
});
