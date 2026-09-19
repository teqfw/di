// @ts-check

/**
 * @namespace TeqFw_Di_Container_Pipeline
 * @description Internal resolution pipeline executor for the container entry point.
 */

import {buildDependencyKey} from '../Internal/DependencyKey.mjs';
import {readDepsDecl} from '../Internal/DepsDecl.mjs';
import {makePromiseSafe} from '../Internal/PromiseSafe.mjs';
import {createResolutionContext} from './ResolutionContext.mjs';

/**
 * @typedef {{index: number, before: TeqFw_Di_Dto_DepId, after: TeqFw_Di_Dto_DepId, changed: boolean}} TeqFw_Di_Container_Pipeline_PreprocessEffect
 */

/**
 * @typedef {object} TeqFw_Di_Container_Pipeline_Context
 * @property {TeqFw_Di_Resolver|undefined} resolver
 * @property {TeqFw_Di_Container_Lifecycle|undefined} lifecycle
 * @property {TeqFw_Di_Container_Instantiate} instantiator
 * @property {TeqFw_Di_Container_Executor} wrapperExecutor
 * @property {TeqFw_Di_Internal_Logger_Contract} logger
 * @property {(value: unknown) => {value: unknown, mode: string}} harden
 * @property {(namespace: object) => void} registerRuntimeOwnedNamespace
 * @property {(specifier: string, ancestors?: readonly TeqFw_Di_Dto_DepId[]) => {requested: TeqFw_Di_Dto_DepId, effective: TeqFw_Di_Dto_DepId, preprocessing: TeqFw_Di_Container_Pipeline_PreprocessEffect[]}} canonicalize
 * @property {(depId: TeqFw_Di_Dto_DepId) => {found: boolean, value: unknown}} findMock
 * @property {(value: unknown, context: TeqFw_Di_Container_ResolutionContext) => unknown} applyPostprocess
 * @property {number} postprocessCount
 * @property {{addNode(data: Record<string, unknown>): void, addEdge(data: Record<string, unknown>): void, record(kind: string, data: Record<string, unknown>): void}|null} [observer]
 */

/**
 * Converts an internal identity carrier into public-observation facts.
 *
 * @param {TeqFw_Di_Dto_DepId} depId
 * @returns {{addressKind: string, address: string, exportName: string|null, life: string|null, wrappers: string[], origin: string}}
 */
const describeDepId = function (depId) {
    return {
        addressKind: depId.platform,
        address: depId.moduleName,
        exportName: depId.exportName,
        life: depId.life,
        wrappers: [...depId.wrappers],
        origin: depId.origin,
    };
};

/**
 * Executes the full container pipeline for a Dependency Identifier.
 *
 * @param {TeqFw_Di_Container_Pipeline_Context} ctx
 * @param {string} specifier
 * @returns {Promise<any>}
 */
export async function executeContainerPipeline(ctx, specifier) {
    const {
        resolver,
        lifecycle,
        instantiator,
        wrapperExecutor,
        logger,
        harden,
        registerRuntimeOwnedNamespace,
        canonicalize,
        findMock,
        applyPostprocess,
        postprocessCount,
        observer = null,
    } = ctx;

    if (!resolver || !lifecycle) {
        throw new Error('Container infrastructure is not initialized.');
    }

    /** @type {Set<string>} */
    const active = new Set();
    /** @type {string[]} */
    const chain = [];
    let nextNodeId = 0;

    /**
     * Records one best-effort trace fact without changing resolution.
     *
     * @param {string} kind
     * @param {Record<string, unknown>} data
     * @returns {void}
     */
    const observe = function (kind, data) {
        if (observer) observer.record(kind, data);
    };

    /**
     * Resolves one requested identifier through its effective identity.
     *
     * @param {string} requestedSpecifier
     * @param {readonly TeqFw_Di_Dto_DepId[]} ancestors
     * @param {string|null} parentNodeId
     * @param {string|null} dependencyName
     * @returns {Promise<unknown>}
     */
    const resolveOne = async function (requestedSpecifier, ancestors, parentNodeId, dependencyName) {
        const nodeId = `resolution-${nextNodeId++}`;
        let key = '';
        let activeHere = false;
        let stage = 'identifier parsing';

        try {
            const identifiers = canonicalize(requestedSpecifier, ancestors);
            const requested = identifiers.requested;
            const depId = identifiers.effective;
            const context = createResolutionContext(depId, ancestors);
            key = buildDependencyKey(depId);
            const mock = findMock(depId);

            if (observer) {
                observer.addNode({
                    nodeId,
                    key,
                    parentNodeId,
                    dependencyName,
                    requested: describeDepId(requested),
                    effective: describeDepId(depId),
                });
            }
            observe('requested', {nodeId, key, requested: describeDepId(requested)});
            for (const effect of identifiers.preprocessing) {
                observe('preprocess', {
                    nodeId,
                    key,
                    index: effect.index,
                    before: describeDepId(effect.before),
                    after: describeDepId(effect.after),
                    changed: effect.changed,
                });
            }
            observe('effective', {nodeId, key, effective: describeDepId(depId)});
            if (parentNodeId !== null && observer) {
                observer.addEdge({
                    parentNodeId,
                    childNodeId: nodeId,
                    dependencyName,
                    requested: describeDepId(requested),
                    effective: describeDepId(depId),
                });
            }

            stage = 'cycle detection';
            if (active.has(key)) {
                throw new Error(`Cyclic dependency detected: ${[...chain, key].join(' -> ')}`);
            }
            active.add(key);
            chain.push(key);
            activeHere = true;

            stage = 'Singleton cache lookup';
            const cache = lifecycle.lookup(depId);
            observe('cache', {nodeId, key, outcome: cache});
            logger.log(`Container.pipeline: cache:${cache} '${depId.platform}::${depId.moduleName}'.`);

            return await lifecycle.apply(depId, async function () {
                /** @type {object} */
                let namespace = {};
                /** @type {unknown} */
                let acquired;

                if (mock.found) {
                    stage = 'test substitution';
                    observe('acquisition', {nodeId, key, mode: 'test-substitution'});
                    logger.log(`Container.pipeline: mock-lookup:hit '${key}'.`);
                    if (depId.wrappers.length > 0) {
                        stage = 'route selection';
                        const resolved = await resolver.resolveWithDetails(depId);
                        namespace = resolved.namespace;
                        registerRuntimeOwnedNamespace(namespace);
                        observe('route', {
                            nodeId,
                            key,
                            addressKind: depId.platform,
                            moduleSpecifier: resolved.specifier,
                            moduleCache: resolved.cache,
                            ...(resolved.mapping ? {mapping: resolved.mapping} : {}),
                        });
                    }
                    acquired = mock.value;
                } else {
                    stage = 'route selection';
                    logger.log(`Container.pipeline: resolve:entry '${depId.platform}::${depId.moduleName}'.`);
                    const resolved = await resolver.resolveWithDetails(depId);
                    namespace = resolved.namespace;
                    registerRuntimeOwnedNamespace(namespace);
                    observe('route', {
                        nodeId,
                        key,
                        addressKind: depId.platform,
                        moduleSpecifier: resolved.specifier,
                        moduleCache: resolved.cache,
                        ...(resolved.mapping ? {mapping: resolved.mapping} : {}),
                    });

                    stage = 'Export Selection';
                    const selected = instantiator.select(depId, namespace);
                    observe('export', {nodeId, key, exportName: depId.exportName});
                    /** @type {Record<string, unknown>} */
                    const dependencies = {};
                    if (depId.life !== null) {
                        stage = 'producer acquisition';
                        observe('acquisition', {nodeId, key, mode: 'producer'});
                        const declared = readDepsDecl(namespace, depId);
                        for (const [name, childSpecifier] of Object.entries(declared)) {
                            stage = 'child dependency resolution';
                            observe('child', {nodeId, key, dependencyName: name, requestedSpecifier: childSpecifier});
                            dependencies[name] = await resolveOne(
                                /** @type {string} */ (childSpecifier),
                                context.stack,
                                nodeId,
                                name
                            );
                        }
                        stage = 'producer invocation';
                        observe('producer invocation', {nodeId, key});
                        acquired = instantiator.produce(selected, dependencies);
                    } else {
                        stage = 'Direct acquisition';
                        observe('acquisition', {nodeId, key, mode: 'direct'});
                        acquired = selected;
                    }
                }

                stage = 'Postprocessor execution';
                logger.log(`Container.pipeline: postprocess:entry '${depId.platform}::${depId.moduleName}'.`);
                const postprocessed = applyPostprocess(acquired, context);
                if (postprocessCount > 0) {
                    observe('postprocess', {nodeId, key, count: postprocessCount});
                }

                stage = 'Wrapper execution';
                const wrapped = wrapperExecutor.execute(depId, postprocessed, namespace);
                if (depId.wrappers.length > 0) {
                    observe('wrappers', {nodeId, key, wrappers: [...depId.wrappers]});
                }

                stage = 'hardening';
                const hardening = harden(wrapped);
                const hardened = makePromiseSafe(hardening.value);
                observe('hardening', {nodeId, key, mode: hardening.mode});
                logger.log(`Container.pipeline: return:node '${depId.platform}::${depId.moduleName}'.`);
                return hardened;
            });
        } catch (error) {
            observe('failure', {
                nodeId,
                key: key || null,
                stage,
                cause: error instanceof Error ? error.message : String(error),
            });
            throw error;
        } finally {
            if (activeHere) {
                chain.pop();
                active.delete(key);
            }
        }
    };

    try {
        logger.log(`Container.get: specifier='${specifier}'.`);
        return makePromiseSafe(await resolveOne(specifier, [], null, null));
    } catch (error) {
        logger.error('Container.pipeline: failed.', error);
        throw error;
    }
}
