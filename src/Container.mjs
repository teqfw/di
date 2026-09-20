// @ts-check

/**
 * @namespace TeqFw_Di_Container
 * @description Public DI Container facade and Container-scoped composition root.
 */

import TeqFw_Di_Parser from './Parser.mjs';
import {Factory as TeqFw_Di_Dto_DepId_Factory} from './Dto/DepId.mjs';
import {Factory as TeqFw_Di_Dto_Resolver_Config_Factory} from './Dto/Resolver/Config.mjs';
import TeqFw_Di_Container_Canonicalizer from './Container/Canonicalizer.mjs';
import TeqFw_Di_Container_Hardener from './Container/Hardener.mjs';
import TeqFw_Di_Container_Lifecycle from './Container/Lifecycle.mjs';
import TeqFw_Di_Container_ModuleLoader from './Container/ModuleLoader.mjs';
import TeqFw_Di_Container_ModuleRouter from './Container/ModuleRouter.mjs';
import TeqFw_Di_Container_Postprocessor from './Container/Postprocessor.mjs';
import TeqFw_Di_Container_Producer from './Container/Producer.mjs';
import TeqFw_Di_Container_Wrapper from './Container/Wrapper.mjs';
import {createNoopObserver, createObserver} from './Container/Observer.mjs';
import {executeResolution} from './Container/Resolution.mjs';
import TeqFw_Di_Enum_ObservationEvent from './Enum/ObservationEvent.mjs';
import TeqFw_Di_Enum_ResolutionStage from './Enum/ResolutionStage.mjs';
import TeqFw_Di_Internal_Logger, {TeqFw_Di_Internal_Logger_Noop} from './Internal/Logger.mjs';
import {buildDependencyKey} from './Internal/DependencyKey.mjs';

/** @typedef {'notConfigured'|'operational'|'failed'} TeqFw_Di_Container_State */

/**
 * Public Container facade. It owns stable configuration, Container-scoped
 * collaborators and state; one `get()` creates one Resolution session.
 */
export default class TeqFw_Di_Container {
    constructor() {
        /** @type {TeqFw_Di_Container_State} */
        let state = 'notConfigured';
        /** @type {Map<string, unknown>} */
        const mockRegistry = new Map();
        /** @type {TeqFw_Di_Dto_Resolver_Config_Namespace[]} */
        const namespaceRoots = [];
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
        /** @type {TeqFw_Di_Container_Canonicalizer} */
        const canonicalizer = new TeqFw_Di_Container_Canonicalizer({parser, depIdFactory});
        /** @type {TeqFw_Di_Container_Postprocessor} */
        const postprocessor = new TeqFw_Di_Container_Postprocessor();
        /** @type {TeqFw_Di_Container_Producer} */
        const producer = new TeqFw_Di_Container_Producer();
        /** @type {TeqFw_Di_Container_Wrapper} */
        const wrapper = new TeqFw_Di_Container_Wrapper();
        /** @type {TeqFw_Di_Container_Hardener} */
        const hardener = new TeqFw_Di_Container_Hardener();
        /** @type {TeqFw_Di_Container_ModuleRouter|undefined} */
        let moduleRouter;
        /** @type {TeqFw_Di_Container_ModuleLoader|undefined} */
        let moduleLoader;
        /** @type {TeqFw_Di_Container_Lifecycle|undefined} */
        let lifecycle;
        /** @type {TeqFw_Di_Internal_Logger_Contract} */
        let logger = TeqFw_Di_Internal_Logger_Noop;

        /**
         * Looks up a test substitution by effective identity.
         *
         * @param {TeqFw_Di_Dto_DepId} depId
         * @returns {{found: boolean, value: unknown}}
         */
        const findMock = function (depId) {
            const key = buildDependencyKey(depId);
            return {found: testMode === true && mockRegistry.has(key), value: mockRegistry.get(key)};
        };

        /** @returns {void} */
        const assertBuilderStage = function () {
            if (state !== 'notConfigured') throw new Error('Container configuration is locked.');
        };

        /** @param {string} message @returns {void} */
        const logBuilder = function (message) {
            if (loggingEnabled) logger.log(`Container.builder: ${message}`);
        };

        /**
         * Freezes configuration and creates all Container-scoped runtime owners.
         *
         * @param {() => void} onOperational
         * @returns {void}
         */
        const initializeInfrastructure = function (onOperational) {
            if (state !== 'notConfigured') return;
            logger.log('Container.transition: notConfigured -> operational.');
            state = 'operational';
            onOperational();
            const config = configFactory.create({namespaces: namespaceRoots});
            if (typeof parser.setLogger === 'function') parser.setLogger(logger);
            moduleRouter = new TeqFw_Di_Container_ModuleRouter({config, logger});
            moduleLoader = new TeqFw_Di_Container_ModuleLoader({logger});
            lifecycle = new TeqFw_Di_Container_Lifecycle(logger);
        };

        /**
         * Adds an ordered requested-to-effective substitution.
         *
         * @param {(depId: TeqFw_Di_Dto_DepId, context: TeqFw_Di_Container_ResolutionContext) => TeqFw_Di_Dto_DepId} fn
         * @returns {void}
         */
        this.addPreprocess = function (fn) {
            assertBuilderStage();
            logBuilder('addPreprocess().');
            canonicalizer.add(fn);
        };

        /**
         * Adds an ordered final-value Postprocessor.
         *
         * @param {(value: unknown, context: TeqFw_Di_Container_ResolutionContext) => unknown} fn
         * @returns {void}
         */
        this.addPostprocess = function (fn) {
            assertBuilderStage();
            logBuilder('addPostprocess().');
            postprocessor.add(fn);
        };

        /**
         * Replaces the default hardening policy.
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
         * Adds one Teq Namespace Mapping root.
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

        /** @returns {void} */
        this.enableTestMode = function () {
            assertBuilderStage();
            logBuilder('enableTestMode().');
            testMode = true;
        };

        /** @returns {void} */
        this.enableLogging = function () {
            assertBuilderStage();
            if (loggingEnabled) return;
            loggingEnabled = true;
            logger = new TeqFw_Di_Internal_Logger();
            if (typeof parser.setLogger === 'function') parser.setLogger(logger);
            logger.log('Container.builder: enableLogging().');
        };

        /** @returns {void} */
        this.enableIntrospection = function () {
            assertBuilderStage();
            logBuilder('enableIntrospection().');
            introspectionEnabled = true;
        };

        /**
         * Returns the immutable snapshot of the latest observed request.
         *
         * @returns {object|null}
         */
        this.getIntrospection = function () {
            return lastObserver ? lastObserver.getSnapshot() : null;
        };

        /**
         * Registers a test substitution under effective identity.
         *
         * @param {string} specifier
         * @param {any} mock
         * @returns {void}
         */
        this.register = function (specifier, mock) {
            assertBuilderStage();
            logBuilder(`register('${specifier}').`);
            if (testMode !== true) throw new Error('Container test mode is disabled.');
            const depId = canonicalizer.canonicalize(specifier).effective;
            mockRegistry.set(buildDependencyKey(depId), mock);
        };

        /**
         * Resolves one Dependency Identifier through a new Resolution session.
         *
         * @param {string} specifier
         * @returns {Promise<any>}
         */
        this.get = async function (specifier) {
            const observer = introspectionEnabled ? createObserver(specifier) : createNoopObserver();
            if (introspectionEnabled) lastObserver = observer;

            if (state === 'failed') {
                logger.error(`Container.get: rejected in failed state specifier='${specifier}'.`);
                observer.record(TeqFw_Di_Enum_ObservationEvent.FAILURE, {
                    stage: TeqFw_Di_Enum_ResolutionStage.CONTAINER_STATE,
                    cause: 'Container is in failed state.',
                });
                observer.complete('failure', state);
                throw new Error('Container is in failed state.');
            }

            try {
                initializeInfrastructure(function () {
                    observer.record(TeqFw_Di_Enum_ObservationEvent.STATE, {
                        from: 'notConfigured',
                        to: 'operational',
                    });
                });
                logger.log(`Container.state: '${state}'.`);
                const value = await executeResolution({
                    canonicalizer,
                    lifecycle: /** @type {TeqFw_Di_Container_Lifecycle} */ (lifecycle),
                    moduleRouter: /** @type {TeqFw_Di_Container_ModuleRouter} */ (moduleRouter),
                    moduleLoader: /** @type {TeqFw_Di_Container_ModuleLoader} */ (moduleLoader),
                    producer,
                    postprocessor,
                    wrapper,
                    hardener,
                    findMock,
                    logger,
                    observer,
                }, specifier);
                observer.complete('success', state);
                return value;
            } catch (error) {
                const transitioned = state === 'operational';
                if (transitioned) {
                    logger.error('Container.transition: operational -> failed.', error);
                    state = 'failed';
                    observer.record(TeqFw_Di_Enum_ObservationEvent.STATE, {
                        from: 'operational',
                        to: state,
                    });
                }
                observer.complete('failure', state);
                throw error;
            }
        };
    }
}
