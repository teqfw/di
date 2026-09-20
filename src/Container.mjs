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
import TeqFw_Di_Container_Hardener from './Container/Hardener.mjs';
import {createObserver, publishObservation} from './Container/Observer.mjs';
import {executeContainerPipeline} from './Container/Pipeline.mjs';
import {createResolutionContext} from './Container/ResolutionContext.mjs';
import TeqFw_Di_Enum_ObservationEvent from './Enum/ObservationEvent.mjs';
import TeqFw_Di_Internal_Logger, {TeqFw_Di_Internal_Logger_Noop} from './Internal/Logger.mjs';
import {buildDependencyKey} from './Internal/DependencyKey.mjs';

/**
 * @typedef {'notConfigured'|'operational'|'failed'} TeqFw_Di_Container_State
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
        /** @type {ReturnType<typeof createObserver>|null} */
        let lastObserver = null;
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
        /** @type {TeqFw_Di_Container_Hardener} */
        const hardener = new TeqFw_Di_Container_Hardener();

        const getKey = buildDependencyKey;
        const getMockKey = buildDependencyKey;

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
            hardener.setConfigured(fn);
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
            return lastObserver ? lastObserver.getSnapshot() : null;
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
            if (observer) lastObserver = observer;
            if (state === 'failed') {
                logger.error(`Container.get: rejected in failed state specifier='${specifier}'.`);
                publishObservation(observer, (collector) => {
                    collector.record(TeqFw_Di_Enum_ObservationEvent.FAILURE, {
                        stage: 'Container state',
                        cause: 'Container is in failed state.',
                    });
                });
                publishObservation(observer, (collector) => collector.complete('failure', state));
                throw new Error('Container is in failed state.');
            }

            try {
                initializeInfrastructure(function () {
                    publishObservation(observer, (collector) => collector.record(
                        TeqFw_Di_Enum_ObservationEvent.STATE,
                        {from: 'notConfigured', to: 'operational'}
                    ));
                });
                logger.log(`Container.state: '${state}'.`);
                const value = await executeContainerPipeline({
                    resolver,
                    lifecycle,
                    instantiator,
                    wrapperExecutor,
                    logger,
                    harden: hardener.harden,
                    registerRuntimeOwned: hardener.registerRuntimeOwned,
                    canonicalize,
                    findMock,
                    applyPostprocess,
                    postprocessCount: postprocess.length,
                    observer,
                }, specifier);
                publishObservation(observer, (collector) => collector.complete('success', state));
                return value;
            } catch (error) {
                const transitioned = state === 'operational';
                if (transitioned) {
                    logger.error(`Container.transition: operational -> failed.`, error);
                    state = 'failed';
                }
                if (transitioned) {
                    publishObservation(observer, (collector) => collector.record(
                        TeqFw_Di_Enum_ObservationEvent.STATE,
                        {from: 'operational', to: state}
                    ));
                }
                publishObservation(observer, (collector) => collector.complete('failure', state));
                throw error;
            }
        };
    }
}
