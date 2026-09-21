// @ts-check

/**
 * @namespace TeqFw_Di_Container
 * @description Public DI Container facade and one-root resolution boundary.
 */

import TeqFw_Di_Parser from './Parser.mjs';
import {Factory as TeqFw_Di_Dto_Container_Config_Factory} from './Dto/Container/Config.mjs';
import {Factory as TeqFw_Di_Dto_DepId_Factory} from './Dto/DepId.mjs';
import {Factory as TeqFw_Di_Dto_ModuleRouter_Config_Factory} from './Dto/ModuleRouter/Config.mjs';
import TeqFw_Di_Container_Canonicalizer from './Container/Canonicalizer.mjs';
import {configureContainer} from './Container/Configurator.mjs';
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
import TeqFw_Di_Internal_Logger, {TeqFw_Di_Internal_Logger_Noop} from './Internal/Logger.mjs';
import {buildDependencyKey} from './Internal/DependencyKey.mjs';

/** @typedef {'Configuring'|'Preparing'|'Resolving'|'Resolved'|'Failed'} TeqFw_Di_Container_State */
/** @typedef {import('./Dto/Container/Config.mjs').default} TeqFw_Di_Dto_Container_Config */
/** @typedef {import('./Dto/Container/Config.mjs').Factory} TeqFw_Di_Dto_Container_Config__Factory */
/** @typedef {import('./Dto/ModuleRouter/Config.mjs').Factory} TeqFw_Di_Dto_ModuleRouter_Config__Factory */

/**
 * Public Container facade. Construction captures immutable declarative policy;
 * its first public `get()` materializes policy and resolves the only root.
 */
export default class TeqFw_Di_Container {
    /**
     * @param {{namespaces?: Array<{prefix: string, target: string, defaultExt: string}>, preprocessors?: string[], postprocessors?: string[], hardener?: string|null, logging?: boolean, introspection?: boolean, mocks?: Array<{specifier: string, value: unknown}>}} [data]
     */
    constructor(data = {}) {
        /** @type {TeqFw_Di_Container_State} */
        let state = 'Configuring';
        /** @type {Map<string, unknown>} */
        const mockRegistry = new Map();
        /** @type {Array<{key: string, value: unknown}>} */
        const legacyMocks = [];
        /** @type {Array<{prefix: string, target: string, defaultExt: string}>} */
        const namespaceRoots = [];
        /** @type {Array<(depId: TeqFw_Di_Dto_DepId, context: TeqFw_Di_Container_ResolutionContext) => TeqFw_Di_Dto_DepId>} */
        const legacyPreprocessors = [];
        /** @type {Array<(value: unknown, context: TeqFw_Di_Container_ResolutionContext) => unknown>} */
        const legacyPostprocessors = [];
        /** @type {((value: unknown) => unknown)|null} */
        let legacyHardener = null;
        let testMode = false;
        /** @type {ReturnType<typeof createObserver>|null} */
        let lastObserver = null;
        /** @type {TeqFw_Di_Dto_Container_Config__Factory} */
        const containerConfigFactory = new TeqFw_Di_Dto_Container_Config_Factory();
        const config = containerConfigFactory.create(data);
        namespaceRoots.splice(0, namespaceRoots.length, ...config.namespaces);
        /** @type {TeqFw_Di_Dto_ModuleRouter_Config__Factory} */
        const moduleRouterConfigFactory = new TeqFw_Di_Dto_ModuleRouter_Config_Factory();
        /** @type {TeqFw_Di_Parser} */
        const parser = new TeqFw_Di_Parser();
        /** @type {TeqFw_Di_Dto_DepId__Factory} */
        const depIdFactory = new TeqFw_Di_Dto_DepId_Factory();
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
        /** @type {TeqFw_Di_Internal_Logger_Contract} */
        let logger = config.logging ? new TeqFw_Di_Internal_Logger() : TeqFw_Di_Internal_Logger_Noop;
        let introspectionEnabled = config.introspection;
        if (typeof parser.setLogger === 'function') parser.setLogger(logger);

        /**
         * Looks up a test substitution by effective identity.
         *
         * @param {TeqFw_Di_Dto_DepId} depId
         * @returns {{found: boolean, value: unknown}}
         */
        const findMock = function (depId) {
            const key = buildDependencyKey(depId);
            return {found: mockRegistry.has(key), value: mockRegistry.get(key)};
        };

        /** @returns {void} */
        const installMocks = function () {
            for (const mock of config.mocks) {
                const depId = canonicalizer.canonicalize(mock.specifier).effective;
                mockRegistry.set(buildDependencyKey(depId), mock.value);
            }
            for (const mock of legacyMocks) {
                mockRegistry.set(mock.key, mock.value);
            }
        };

        /** @returns {void} */
        const assertConfigurationStage = function () {
            if (state !== 'Configuring') throw new Error('Container configuration is locked.');
        };

        /**
         * @param {(depId: TeqFw_Di_Dto_DepId, context: TeqFw_Di_Container_ResolutionContext) => TeqFw_Di_Dto_DepId} fn
         * @returns {void}
         * @deprecated Supply a producer identifier through configuration instead.
         */
        this.addPreprocess = function (fn) {
            assertConfigurationStage();
            legacyPreprocessors.push(fn);
        };

        /**
         * @param {(value: unknown, context: TeqFw_Di_Container_ResolutionContext) => unknown} fn
         * @returns {void}
         * @deprecated Supply a producer identifier through configuration instead.
         */
        this.addPostprocess = function (fn) {
            assertConfigurationStage();
            legacyPostprocessors.push(fn);
        };

        /**
         * @param {(value: unknown) => unknown} fn
         * @returns {void}
         * @deprecated Supply a producer identifier through configuration instead.
         */
        this.setHardener = function (fn) {
            assertConfigurationStage();
            legacyHardener = fn;
        };

        /**
         * @param {string} prefix
         * @param {string} target
         * @param {string} defaultExt
         * @returns {void}
         * @deprecated Supply namespace mappings through configuration instead.
         */
        this.addNamespaceRoot = function (prefix, target, defaultExt) {
            assertConfigurationStage();
            namespaceRoots.push({prefix, target, defaultExt});
        };

        /** @returns {void} @deprecated Supply mocks through configuration instead. */
        this.enableTestMode = function () {
            assertConfigurationStage();
            testMode = true;
        };

        /** @returns {void} @deprecated Supply logging through configuration instead. */
        this.enableLogging = function () {
            assertConfigurationStage();
            logger = new TeqFw_Di_Internal_Logger();
            if (typeof parser.setLogger === 'function') parser.setLogger(logger);
        };

        /** @returns {void} @deprecated Supply introspection through configuration instead. */
        this.enableIntrospection = function () {
            assertConfigurationStage();
            introspectionEnabled = true;
        };

        /**
         * @param {string} specifier
         * @param {unknown} value
         * @returns {void}
         * @deprecated Supply JSON-safe mocks through configuration instead.
         */
        this.register = function (specifier, value) {
            assertConfigurationStage();
            if (testMode !== true) throw new Error('Container test mode is disabled.');
            const depId = canonicalizer.canonicalize(specifier).effective;
            legacyMocks.push({key: buildDependencyKey(depId), value});
        };

        /**
         * Returns the immutable snapshot of the Container's one public root.
         *
         * @returns {object|null}
         */
        this.getIntrospection = function () {
            return lastObserver ? lastObserver.getSnapshot() : null;
        };

        /**
         * Materializes configured policy, then resolves the Container's one
         * public root Dependency Identifier.
         *
         * @param {string} specifier
         * @returns {Promise<any>}
         */
        this.get = async function (specifier) {
            if (state !== 'Configuring') {
                throw new Error('Container root has already been claimed; a second root is not allowed.');
            }
            state = 'Preparing';
            const observer = introspectionEnabled ? createObserver(specifier) : createNoopObserver();
            if (introspectionEnabled) lastObserver = observer;

            try {
                logger.log('Container.configuration: materializing declared policy.');
                const moduleRouterConfig = moduleRouterConfigFactory.create({namespaces: [...namespaceRoots]});
                const moduleRouter = new TeqFw_Di_Container_ModuleRouter({config: moduleRouterConfig, logger});
                const moduleLoader = new TeqFw_Di_Container_ModuleLoader({logger});
                const lifecycle = new TeqFw_Di_Container_Lifecycle(logger);
                await configureContainer({
                    config,
                    canonicalizer,
                    moduleRouter,
                    moduleLoader,
                    producer,
                    wrapper,
                    hardener,
                    postprocessor,
                    logger,
                });
                for (const fn of legacyPreprocessors) canonicalizer.add(fn);
                for (const fn of legacyPostprocessors) postprocessor.add(fn);
                if (legacyHardener !== null) hardener.setConfigured(legacyHardener);
                installMocks();
                logger.log('Container.transition: Preparing -> Resolving.');
                state = 'Resolving';
                observer.record(TeqFw_Di_Enum_ObservationEvent.STATE, {
                    from: 'Preparing',
                    to: 'Resolving',
                });
                const value = await executeResolution({
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
                }, specifier);
                logger.log('Container.transition: Resolving -> Resolved.');
                state = 'Resolved';
                observer.record(TeqFw_Di_Enum_ObservationEvent.STATE, {
                    from: 'Resolving',
                    to: 'Resolved',
                });
                observer.complete('success', state);
                return value;
            } catch (error) {
                const from = state;
                logger.error(`Container.transition: ${from} -> Failed.`, error);
                state = 'Failed';
                observer.record(TeqFw_Di_Enum_ObservationEvent.FAILURE, {
                    nodeId: null,
                    stage: from === 'Preparing' ? 'configuration' : 'resolution',
                    cause: error instanceof Error ? error.message : String(error),
                });
                observer.record(TeqFw_Di_Enum_ObservationEvent.STATE, {from, to: state});
                observer.complete('failure', state);
                throw error;
            }
        };
    }
}

export {Factory as ConfigFactory} from './Dto/Container/Config.mjs';
