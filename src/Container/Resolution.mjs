// @ts-check

/**
 * @namespace TeqFw_Di_Container_Resolution
 * @description One root Dependency Resolution session and its recursive corridor.
 */

import {buildDependencyKey} from '../Internal/DependencyKey.mjs';
import {readDepsDecl} from '../Internal/DepsDecl.mjs';
import {makePromiseSafe} from '../Internal/PromiseSafe.mjs';
import TeqFw_Di_Enum_ObservationEvent from '../Enum/ObservationEvent.mjs';
import TeqFw_Di_Enum_ResolutionStage from '../Enum/ResolutionStage.mjs';
import {createResolutionContext} from './ResolutionContext.mjs';

/**
 * @typedef {object} TeqFw_Di_Container_Resolution_Context
 * @property {TeqFw_Di_Container_Canonicalizer} canonicalizer
 * @property {TeqFw_Di_Container_Lifecycle} lifecycle
 * @property {TeqFw_Di_Container_ModuleRouter} moduleRouter
 * @property {TeqFw_Di_Container_ModuleLoader} moduleLoader
 * @property {TeqFw_Di_Container_Producer} producer
 * @property {TeqFw_Di_Container_Postprocessor} postprocessor
 * @property {TeqFw_Di_Container_Wrapper} wrapper
 * @property {TeqFw_Di_Container_Hardener} hardener
 * @property {(depId: TeqFw_Di_Dto_DepId) => {found: boolean, value: unknown}} findMock
 * @property {TeqFw_Di_Internal_Logger_Contract} logger
 * @property {TeqFw_Di_Container_Observer_Contract} observer
 */

/**
 * Converts an identity into the public observation carrier.
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
 * Selects one export without entering producer traversal.
 *
 * @param {TeqFw_Di_Dto_DepId} depId
 * @param {object} namespace
 * @returns {unknown}
 */
const selectExport = function (depId, namespace) {
    if (depId.exportName === null) return namespace;
    if (!(depId.exportName in namespace)) {
        throw new Error(`Export '${depId.exportName}' is not found in module namespace.`);
    }
    return /** @type {Record<string, unknown>} */ (namespace)[depId.exportName];
};

/**
 * Executes one root request and all recursive child requests. Request-local
 * active graph state is created here and never stored in Container scope.
 *
 * @param {TeqFw_Di_Container_Resolution_Context} ctx
 * @param {string} specifier
 * @returns {Promise<any>}
 */
export async function executeResolution(ctx, specifier) {
    const {
        canonicalizer,
        lifecycle,
        moduleRouter,
        moduleLoader,
        producer,
        postprocessor,
        wrapper,
        hardener,
        findMock,
        logger,
        observer,
    } = ctx;

    /** @type {Set<string>} */
    const active = new Set();
    /** @type {string[]} */
    const chain = [];
    let nextNodeId = 0;

    /**
     * Resolves one dependency node through the effective identity.
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
        let stage = TeqFw_Di_Enum_ResolutionStage.IDENTIFIER_PARSING;

        try {
            const requested = canonicalizer.parse(requestedSpecifier);
            stage = TeqFw_Di_Enum_ResolutionStage.PREPROCESSING;
            const identifiers = canonicalizer.preprocess(requested, ancestors);
            const depId = identifiers.effective;
            const context = createResolutionContext(depId, ancestors);
            key = buildDependencyKey(depId);
            const mock = findMock(depId);

            observer.addNode({
                nodeId,
                key,
                parentNodeId,
                dependencyName,
                requested: describeDepId(requested),
                effective: describeDepId(depId),
            });
            observer.record(TeqFw_Di_Enum_ObservationEvent.REQUESTED, {
                nodeId,
                key,
                requested: describeDepId(requested),
            });
            for (const effect of identifiers.preprocessing) {
                observer.record(TeqFw_Di_Enum_ObservationEvent.PREPROCESS, {
                    nodeId,
                    key,
                    index: effect.index,
                    before: describeDepId(effect.before),
                    after: describeDepId(effect.after),
                    changed: effect.changed,
                });
            }
            observer.record(TeqFw_Di_Enum_ObservationEvent.EFFECTIVE, {
                nodeId,
                key,
                effective: describeDepId(depId),
            });
            if (parentNodeId !== null) {
                observer.addEdge({
                    parentNodeId,
                    childNodeId: nodeId,
                    dependencyName,
                    requested: describeDepId(requested),
                    effective: describeDepId(depId),
                });
            }

            stage = TeqFw_Di_Enum_ResolutionStage.CYCLE_DETECTION;
            if (active.has(key)) {
                throw new Error(`Cyclic dependency detected: ${[...chain, key].join(' -> ')}`);
            }
            active.add(key);
            chain.push(key);
            activeHere = true;

            stage = TeqFw_Di_Enum_ResolutionStage.SINGLETON_CACHE_LOOKUP;
            const cache = lifecycle.lookup(depId);
            observer.record(TeqFw_Di_Enum_ObservationEvent.CACHE, {nodeId, key, outcome: cache});
            logger.log(`Resolution.cache: ${cache} '${depId.platform}::${depId.moduleName}'.`);

            return await lifecycle.apply(depId, async function () {
                /** @type {object} */
                let namespace = {};
                /** @type {unknown} */
                let acquired;

                /**
                 * Routes and loads only when the acquisition corridor needs a
                 * module namespace. Route observation intentionally precedes load.
                 *
                 * @returns {Promise<object>}
                 */
                const loadNamespace = async function () {
                    stage = TeqFw_Di_Enum_ResolutionStage.ROUTE_SELECTION;
                    const route = moduleRouter.route(depId);
                    observer.record(TeqFw_Di_Enum_ObservationEvent.ROUTE, {
                        nodeId,
                        key,
                        addressKind: depId.platform,
                        moduleSpecifier: route.specifier,
                        ...(route.mapping ? {mapping: route.mapping} : {}),
                    });
                    stage = TeqFw_Di_Enum_ResolutionStage.MODULE_LOADING;
                    const loaded = await moduleLoader.load(route);
                    hardener.registerRuntimeOwned(loaded);
                    return loaded;
                };

                if (mock.found) {
                    stage = TeqFw_Di_Enum_ResolutionStage.TEST_SUBSTITUTION;
                    observer.record(TeqFw_Di_Enum_ObservationEvent.ACQUISITION, {
                        nodeId,
                        key,
                        mode: 'test-substitution',
                    });
                    logger.log(`Resolution.mock: hit '${key}'.`);
                    if (depId.wrappers.length > 0) namespace = await loadNamespace();
                    acquired = mock.value;
                } else {
                    logger.log(`Resolution.route: entry '${depId.platform}::${depId.moduleName}'.`);
                    namespace = await loadNamespace();

                    stage = TeqFw_Di_Enum_ResolutionStage.EXPORT_SELECTION;
                    const selected = selectExport(depId, namespace);
                    observer.record(TeqFw_Di_Enum_ObservationEvent.EXPORT, {
                        nodeId,
                        key,
                        exportName: depId.exportName,
                    });
                    /** @type {Record<string, unknown>} */
                    const dependencies = {};
                    if (depId.life !== null) {
                        stage = TeqFw_Di_Enum_ResolutionStage.PRODUCER_ACQUISITION;
                        observer.record(TeqFw_Di_Enum_ObservationEvent.ACQUISITION, {
                            nodeId,
                            key,
                            mode: 'producer',
                        });
                        const declared = readDepsDecl(namespace, depId);
                        for (const [name, childSpecifier] of Object.entries(declared)) {
                            stage = TeqFw_Di_Enum_ResolutionStage.CHILD_DEPENDENCY_RESOLUTION;
                            observer.record(TeqFw_Di_Enum_ObservationEvent.CHILD, {
                                nodeId,
                                key,
                                dependencyName: name,
                                requestedSpecifier: childSpecifier,
                            });
                            dependencies[name] = await resolveOne(
                                /** @type {string} */ (childSpecifier),
                                context.stack,
                                nodeId,
                                name
                            );
                        }
                        stage = TeqFw_Di_Enum_ResolutionStage.PRODUCER_INVOCATION;
                        observer.record(TeqFw_Di_Enum_ObservationEvent.PRODUCER_INVOCATION, {nodeId, key});
                        acquired = producer.produce(selected, dependencies);
                    } else {
                        stage = TeqFw_Di_Enum_ResolutionStage.DIRECT_ACQUISITION;
                        observer.record(TeqFw_Di_Enum_ObservationEvent.ACQUISITION, {
                            nodeId,
                            key,
                            mode: 'direct',
                        });
                        acquired = selected;
                    }
                }

                stage = TeqFw_Di_Enum_ResolutionStage.POSTPROCESSOR_EXECUTION;
                const postprocessed = postprocessor.apply(acquired, context);
                if (postprocessor.count() > 0) {
                    observer.record(TeqFw_Di_Enum_ObservationEvent.POSTPROCESS, {
                        nodeId,
                        key,
                        count: postprocessor.count(),
                    });
                }

                stage = TeqFw_Di_Enum_ResolutionStage.WRAPPER_EXECUTION;
                const wrapped = wrapper.execute(depId, postprocessed, namespace);
                if (depId.wrappers.length > 0) {
                    observer.record(TeqFw_Di_Enum_ObservationEvent.WRAPPERS, {
                        nodeId,
                        key,
                        wrappers: [...depId.wrappers],
                    });
                }

                stage = TeqFw_Di_Enum_ResolutionStage.HARDENING;
                const hardening = hardener.harden(wrapped);
                const hardened = makePromiseSafe(hardening.value);
                observer.record(TeqFw_Di_Enum_ObservationEvent.HARDENING, {
                    nodeId,
                    key,
                    mode: hardening.mode,
                });
                logger.log(`Resolution.return: '${depId.platform}::${depId.moduleName}'.`);
                return hardened;
            });
        } catch (error) {
            observer.record(TeqFw_Di_Enum_ObservationEvent.FAILURE, {
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
        logger.error('Resolution: failed.', error);
        throw error;
    }
}
