// @ts-check

/**
 * @namespace TeqFw_Di_Container
 * @description DI container orchestration entry point.
 */

import TeqFw_Di_Parser from './Parser.mjs';
import {Factory as TeqFw_Di_Dto_DepId_Factory} from './Dto/DepId.mjs';
import {Factory as TeqFw_Di_Dto_Resolver_Config_Factory} from './Dto/Resolver/Config.mjs';
import TeqFw_Di_Resolver from './Container/Resolver.mjs';
import TeqFw_Di_Container_Instantiate from './Container/Instantiate.mjs';
import TeqFw_Di_Container_Lifecycle from './Container/Lifecycle.mjs';
import TeqFw_Di_Container_Executor from './Container/Executor.mjs';
import {executeContainerPipeline} from './Container/Pipeline.mjs';
import {createResolutionContext} from './Container/ResolutionContext.mjs';
import TeqFw_Di_Internal_Logger, {TeqFw_Di_Internal_Logger_Noop} from './Internal/Logger.mjs';
import {buildDependencyKey} from './Internal/DependencyKey.mjs';

/**
 * @typedef {'notConfigured'|'operational'|'failed'} TeqFw_Di_Container_State
 */

/**
 * @typedef {'primitive'|'already-frozen'|'runtime-owned'|'frozen'|'configured'} TeqFw_Di_Container_Hardening_Mode
 */

/**
 * @typedef {{value: unknown, mode: TeqFw_Di_Container_Hardening_Mode}} TeqFw_Di_Container_Hardening_Result
 */

/**
 * Container orchestration boundary.
 *
 * @LLM-DOC
 * Spec: ./ctx/docs/code/components/container.md
 */
export default class TeqFw_Di_Container {
    constructor() {
        /** @type {TeqFw_Di_Container_State} */
        let state = 'notConfigured';
        /** @type {((depId: TeqFw_Di_Dto_DepId, context: TeqFw_Di_Container_ResolutionContext) => TeqFw_Di_Dto_DepId)[]} */
        const preprocess = [];
        /** @type {((value: unknown, context: TeqFw_Di_Container_ResolutionContext) => unknown)[]} */
        const postprocess = [];
        /** @type {TeqFw_Di_Dto_Resolver_Config_Namespace[]} */
        const namespaceRoots = [];
        /** @type {Map<string, unknown>} */
        const mockRegistry = new Map();
        let testMode = false;
        let loggingEnabled = false;
        let introspectionEnabled = false;
        /** @type {object|null} */
        let lastIntrospection = null;
        /** @type {TeqFw_Di_Parser} */
        const parser = new TeqFw_Di_Parser();
        /** @type {TeqFw_Di_Dto_DepId__Factory} */
        const depIdFactory = new TeqFw_Di_Dto_DepId_Factory();
        /** @type {TeqFw_Di_Dto_Resolver_Config__Factory} */
        const configFactory = new TeqFw_Di_Dto_Resolver_Config_Factory();
        /** @type {TeqFw_Di_Resolver|undefined} */
        let resolver;
        /** @type {TeqFw_Di_Container_Lifecycle|undefined} */
        let lifecycle;
        /** @type {TeqFw_Di_Internal_Logger_Contract} */
        let logger = TeqFw_Di_Internal_Logger_Noop;
        /** @type {TeqFw_Di_Container_Instantiate} */
        const instantiator = new TeqFw_Di_Container_Instantiate();
        /** @type {TeqFw_Di_Container_Executor} */
        const wrapperExecutor = new TeqFw_Di_Container_Executor();
        /** @type {WeakSet<object>} */
        const runtimeOwnedNamespaces = new WeakSet();

        const getKey = buildDependencyKey;
        const getMockKey = buildDependencyKey;

        /**
         * Records one native ES Module Namespace Object returned by the runtime.
         *
         * @param {object} namespace
         * @returns {void}
         */
        const registerRuntimeOwnedNamespace = function (namespace) {
            runtimeOwnedNamespaces.add(namespace);
        };

        /**
         * Applies default shallow hardening at the Container boundary.
         *
         * Primitives, already hardened values, and Resolver-proven native ES
         * Module Namespace Objects pass through. Ordinary object and function
         * values must freeze successfully or propagate a Dependency Resolution
         * failure.
         *
         * @param {unknown} value
         * @returns {TeqFw_Di_Container_Hardening_Result}
         */
        const applyDefaultHardening = function (value) {
            if ((value === null) || (value === undefined)) return {value, mode: 'primitive'};
            const type = typeof value;
            if ((type !== 'object') && (type !== 'function')) return {value, mode: 'primitive'};
            if (Object.isFrozen(value)) return {value, mode: 'already-frozen'};
            if (runtimeOwnedNamespaces.has(/** @type {object} */ (value))) return {value, mode: 'runtime-owned'};
            return {value: Object.freeze(value), mode: 'frozen'};
        };

        /** @type {((value: unknown) => unknown)|null} */
        let configuredHardener = null;

        /**
         * Applies the selected hardening policy and returns its actual mode.
         *
         * @param {unknown} value
         * @returns {TeqFw_Di_Container_Hardening_Result}
         */
        const applyHardening = function (value) {
            if (configuredHardener !== null) {
                return {value: configuredHardener(value), mode: 'configured'};
            }
            return applyDefaultHardening(value);
        };

        /**
         * Applies registered preprocessing hooks in registration order.
         *
         * @param {TeqFw_Di_Dto_DepId} depId
         * @param {readonly TeqFw_Di_Dto_DepId[]} ancestors
         * @returns {{effective: TeqFw_Di_Dto_DepId, preprocessing: {index: number, before: TeqFw_Di_Dto_DepId, after: TeqFw_Di_Dto_DepId, changed: boolean}[]}}
         */
        const applyPreprocess = function (depId, ancestors) {
            /** @type {TeqFw_Di_Dto_DepId} */
            let current = depId;
            /** @type {{index: number, before: TeqFw_Di_Dto_DepId, after: TeqFw_Di_Dto_DepId, changed: boolean}[]} */
            const preprocessing = [];
            for (const [index, fn] of preprocess.entries()) {
                const before = current;
                current = depIdFactory.create(fn(current, createResolutionContext(current, ancestors)));
                preprocessing.push({
                    index,
                    before,
                    after: current,
                    changed: getKey(before) !== getKey(current),
                });
            }
            return {effective: current, preprocessing};
        };

        /**
         * Parses and normalizes one Dependency Identifier through the preprocessing pipeline.
         *
         * @param {string} specifier
         * @param {readonly TeqFw_Di_Dto_DepId[]} [ancestors]
         * @param {(() => void)|null} [onPreprocess]
         * @returns {{requested: TeqFw_Di_Dto_DepId, effective: TeqFw_Di_Dto_DepId, preprocessing: {index: number, before: TeqFw_Di_Dto_DepId, after: TeqFw_Di_Dto_DepId, changed: boolean}[]}}
         */
        const canonicalize = function (specifier, ancestors = [], onPreprocess = null) {
            const requested = parser.parse(specifier);
            if (onPreprocess) onPreprocess();
            return {requested, ...applyPreprocess(requested, ancestors)};
        };

        /**
         * Looks up a registered mock for the dependency identity.
         *
         * @param {TeqFw_Di_Dto_DepId} depId
         * @returns {{found: boolean, value: unknown}}
         */
        const findMock = function (depId) {
            const key = getMockKey(depId);
            return {found: testMode === true && mockRegistry.has(key), value: mockRegistry.get(key)};
        };

        /**
         * Applies registered postprocessing hooks in registration order.
         *
         * @param {unknown} value
         * @param {TeqFw_Di_Container_ResolutionContext} context
         * @returns {unknown}
         */
        const applyPostprocess = function (value, context) {
            /** @type {unknown} */
            let current = value;
            for (const fn of postprocess) {
                current = fn(current, context);
                if (current instanceof Promise) {
                    throw new Error('Postprocess callback must return synchronously (non-Promise).');
                }
            }
            return current;
        };

        /**
         * @returns {void}
         */
        const assertBuilderStage = function () {
            if (state !== 'notConfigured') throw new Error('Container configuration is locked.');
        };

        /**
         * @param {string} message
         * @returns {void}
         */
        const logBuilder = function (message) {
            if (!loggingEnabled) return;
            logger.log(`Container.builder: ${message}`);
        };

        /**
         * @param {() => void} onOperational
         * @returns {void}
         */
        const initializeInfrastructure = function (onOperational) {
            if (state !== 'notConfigured') return;
            logger.log('Container.transition: notConfigured -> operational.');
            state = 'operational';
            onOperational();
            const resolverConfig = configFactory.create({namespaces: namespaceRoots});
            if (typeof parser.setLogger === 'function') parser.setLogger(logger);
            resolver = new TeqFw_Di_Resolver({config: resolverConfig, logger});
            lifecycle = new TeqFw_Di_Container_Lifecycle(logger);
        };

        /**
         * Copies observation data into an immutable, machine-readable snapshot value.
         *
         * @param {unknown} value
         * @returns {unknown}
         */
        const copyObservation = function (value) {
            if (Array.isArray(value)) return Object.freeze(value.map(copyObservation));
            if ((value !== null) && (typeof value === 'object')) {
                /** @type {Record<string, unknown>} */
                const copy = {};
                for (const [key, item] of Object.entries(/** @type {Record<string, unknown>} */ (value))) {
                    copy[key] = copyObservation(item);
                }
                return Object.freeze(copy);
            }
            return value;
        };

        /**
         * Creates one inert-on-failure collector for a resolution attempt.
         *
         * @param {string} specifier
         * @returns {{addNode(data: Record<string, unknown>): void, addEdge(data: Record<string, unknown>): void, record(kind: string, data: Record<string, unknown>): void, complete(outcome: 'success'|'failure', state: TeqFw_Di_Container_State): void}}
         */
        const createObserver = function (specifier) {
            /** @type {object[]} */
            const nodes = [];
            /** @type {object[]} */
            const edges = [];
            /** @type {object[]} */
            const trace = [];
            /** @type {Map<string, Record<string, unknown>>} */
            const resolutions = new Map();
            /** @type {object[]} */
            const stateTransitions = [];
            /** @type {object|null} */
            let failure = null;

            /**
             * @param {() => void} action
             * @returns {void}
             */
            const safely = function (action) {
                try {
                    action();
                } catch {
                    // Observation must not alter the resolution it describes.
                }
            };

            return {
                addNode(data) {
                    safely(function () {
                        const payload = /** @type {Record<string, unknown>} */ (copyObservation(data));
                        nodes.push(payload);
                        const nodeId = /** @type {string} */ (payload.nodeId);
                        resolutions.set(nodeId, {
                            nodeId,
                            key: payload.key,
                            parentNodeId: payload.parentNodeId,
                            dependencyName: payload.dependencyName,
                            requested: payload.requested,
                            effective: payload.effective,
                            preprocessing: [],
                            children: [],
                        });
                    });
                },
                addEdge(data) {
                    safely(function () {
                        const payload = /** @type {Record<string, unknown>} */ (copyObservation(data));
                        edges.push(payload);
                        const parent = resolutions.get(/** @type {string} */ (payload.parentNodeId));
                        if (parent) {
                            /** @type {object[]} */
                            const children = /** @type {object[]} */ (parent.children);
                            children.push(Object.freeze({
                                nodeId: payload.childNodeId,
                                dependencyName: payload.dependencyName,
                                requested: payload.requested,
                                effective: payload.effective,
                            }));
                        }
                    });
                },
                record(kind, data) {
                    safely(function () {
                        const payload = /** @type {Record<string, unknown>} */ (copyObservation(data));
                        trace.push(Object.freeze({index: trace.length, kind, ...payload}));
                        if (kind === 'state') {
                            stateTransitions.push(Object.freeze({...payload}));
                            return;
                        }
                        const nodeId = payload.nodeId;
                        const resolution = typeof nodeId === 'string' ? resolutions.get(nodeId) : undefined;
                        if (kind === 'failure') {
                            const entry = Object.freeze({
                                nodeId: payload.nodeId ?? null,
                                key: payload.key ?? null,
                                stage: payload.stage ?? null,
                                cause: payload.cause ?? payload.message ?? null,
                            });
                            if (resolution) resolution.failure = entry;
                            if (failure === null) failure = entry;
                            return;
                        }
                        if (!resolution) return;
                        if (kind === 'preprocess') {
                            /** @type {object[]} */
                            const preprocessing = /** @type {object[]} */ (resolution.preprocessing);
                            preprocessing.push(Object.freeze({
                                index: payload.index,
                                before: payload.before,
                                after: payload.after,
                                changed: payload.changed,
                            }));
                        } else if (kind === 'cache') {
                            resolution.cache = payload.outcome;
                        } else if (kind === 'route') {
                            resolution.route = Object.freeze({
                                addressKind: payload.addressKind,
                                moduleSpecifier: payload.moduleSpecifier,
                                moduleCache: payload.moduleCache,
                                ...(payload.mapping ? {mapping: payload.mapping} : {}),
                            });
                        } else if (kind === 'export') {
                            resolution.exportName = payload.exportName;
                        } else if (kind === 'acquisition') {
                            resolution.acquisition = payload.mode;
                        } else if (kind === 'postprocess') {
                            resolution.postprocessors = payload.count;
                        } else if (kind === 'wrappers') {
                            resolution.wrappers = payload.wrappers;
                        } else if (kind === 'hardening') {
                            resolution.hardening = Object.freeze({mode: payload.mode});
                        }
                    });
                },
                complete(outcome, nextState) {
                    safely(function () {
                        lastIntrospection = Object.freeze({
                            graph: Object.freeze({
                                nodes: Object.freeze([...nodes]),
                                edges: Object.freeze([...edges]),
                            }),
                            trace: Object.freeze([...trace]),
                            explanation: Object.freeze({
                                requestedSpecifier: specifier,
                                outcome,
                                containerState: nextState,
                                stateTransitions: Object.freeze([...stateTransitions]),
                                resolutions: Object.freeze([...resolutions.values()].map(copyObservation)),
                                ...(failure ? {failure} : {}),
                            }),
                        });
                    });
                },
            };
        };

        /**
         * Adds a preprocessing hook.
         *
         * @param {(depId: TeqFw_Di_Dto_DepId, context: TeqFw_Di_Container_ResolutionContext) => TeqFw_Di_Dto_DepId} fn
         * @returns {void}
         */
        this.addPreprocess = function (fn) {
            assertBuilderStage();
            logBuilder('addPreprocess().');
            preprocess.push(fn);
        };

        /**
         * Adds a postprocessing hook.
         *
         * @param {(value: unknown, context: TeqFw_Di_Container_ResolutionContext) => unknown} fn
         * @returns {void}
         */
        this.addPostprocess = function (fn) {
            assertBuilderStage();
            logBuilder('addPostprocess().');
            postprocess.push(fn);
        };


        /**
         * Sets the host hardening policy for every resolved value and mock.
         *
         * @param {(value: unknown) => unknown} fn
         * @returns {void}
         */
        this.setHardener = function (fn) {
            assertBuilderStage();
            logBuilder('setHardener().');
            configuredHardener = fn;
        };

        /**
         * Registers namespace root mapping.
         *
         * @param {string} prefix
         * @param {string} target
         * @param {string} defaultExt
         * @returns {void}
         */
        this.addNamespaceRoot = function (prefix, target, defaultExt) {
            assertBuilderStage();
            logBuilder(`addNamespaceRoot('${prefix}').`);
            namespaceRoots.push({prefix, target, defaultExt});
        };

        /**
         * Enables test mode.
         *
         * @returns {void}
         */
        this.enableTestMode = function () {
            assertBuilderStage();
            logBuilder('enableTestMode().');
            testMode = true;
        };

        /**
         * Enables diagnostic logging.
         *
         * @returns {void}
         */
        this.enableLogging = function () {
            assertBuilderStage();
            if (loggingEnabled) return;
            loggingEnabled = true;
            logger = new TeqFw_Di_Internal_Logger();
            if (typeof parser.setLogger === 'function') parser.setLogger(logger);
            logger.log('Container.builder: enableLogging().');
        };

        /**
         * Enables machine-readable resolution observation for subsequent requests.
         *
         * @returns {void}
         */
        this.enableIntrospection = function () {
            assertBuilderStage();
            logBuilder('enableIntrospection().');
            introspectionEnabled = true;
        };

        /**
         * Returns the immutable observation for the latest observed resolution.
         *
         * @returns {object|null}
         */
        this.getIntrospection = function () {
            return lastIntrospection;
        };

        /**
         * Registers a mock value for a Dependency Identifier.
         *
         * @param {string} specifier
         * @param {any} mock
         * @returns {void}
         */
        this.register = function (specifier, mock) {
            assertBuilderStage();
            logBuilder(`register('${specifier}').`);
            if (testMode !== true) throw new Error('Container test mode is disabled.');
            const depId = canonicalize(specifier).effective;
            mockRegistry.set(getMockKey(depId), mock);
        };

        /**
         * Resolves a Dependency Identifier into a hardened Resolved Value.
         *
         * @param {string} specifier
         * @returns {Promise<any>}
         */
        this.get = async function (specifier) {
            const observer = introspectionEnabled ? createObserver(specifier) : null;
            if (state === 'failed') {
                logger.error(`Container.get: rejected in failed state specifier='${specifier}'.`);
                if (observer) {
                    observer.record('failure', {
                        stage: 'Container state',
                        cause: 'Container is in failed state.',
                    });
                    observer.complete('failure', state);
                }
                throw new Error('Container is in failed state.');
            }

            try {
                initializeInfrastructure(function () {
                    if (observer) observer.record('state', {from: 'notConfigured', to: 'operational'});
                });
                logger.log(`Container.state: '${state}'.`);
                const value = await executeContainerPipeline({
                    resolver,
                    lifecycle,
                    instantiator,
                    wrapperExecutor,
                    logger,
                    harden: applyHardening,
                    registerRuntimeOwnedNamespace,
                    canonicalize,
                    findMock,
                    applyPostprocess,
                    postprocessCount: postprocess.length,
                    observer,
                }, specifier);
                if (observer) observer.complete('success', state);
                return value;
            } catch (error) {
                const transitioned = state === 'operational';
                if (transitioned) {
                    logger.error(`Container.transition: operational -> failed.`, error);
                    state = 'failed';
                }
                if (observer) {
                    if (transitioned) observer.record('state', {from: 'operational', to: state});
                    observer.complete('failure', state);
                }
                throw error;
            }
        };
    }
}
