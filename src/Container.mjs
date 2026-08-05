// @ts-check

/**
 * @namespace TeqFw_Di_Container
 * @description DI container orchestration entry point.
 */

import TeqFw_Di_Parser from './Parser.mjs';
import {Factory as TeqFw_Di_Dto_Resolver_Config_Factory} from './Dto/Resolver/Config.mjs';
import TeqFw_Di_Resolver from './Container/Resolver.mjs';
import TeqFw_Di_Container_GraphResolver from './Container/GraphResolver.mjs';
import TeqFw_Di_Container_Instantiate from './Container/Instantiate.mjs';
import TeqFw_Di_Container_Lifecycle from './Container/Lifecycle.mjs';
import TeqFw_Di_Container_Executor from './Container/Executor.mjs';
import {executeContainerPipeline} from './Container/Pipeline.mjs';
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
        /** @type {((depId: TeqFw_Di_Dto_DepId) => TeqFw_Di_Dto_DepId)[]} */
        const preprocess = [];
        /** @type {((value: unknown, context: TeqFw_Di_Container_Postprocess_Context) => unknown)[]} */
        const postprocess = [];
        /** @type {TeqFw_Di_Dto_Resolver_Config_Namespace[]} */
        const namespaceRoots = [];
        /** @type {Map<string, unknown>} */
        const mockRegistry = new Map();
        let testMode = false;
        let loggingEnabled = false;
        /** @type {TeqFw_Di_Parser} */
        let parser = new TeqFw_Di_Parser();
        /** @type {TeqFw_Di_Dto_Resolver_Config__Factory} */
        const configFactory = new TeqFw_Di_Dto_Resolver_Config_Factory();
        /** @type {TeqFw_Di_Resolver|undefined} */
        let resolver;
        /** @type {TeqFw_Di_Container_GraphResolver|undefined} */
        let graphResolver;
        /** @type {TeqFw_Di_Container_Lifecycle|undefined} */
        let lifecycle;
        /** @type {TeqFw_Di_Internal_Logger_Contract} */
        let logger = TeqFw_Di_Internal_Logger_Noop;
        /** @type {TeqFw_Di_Container_Instantiate} */
        const instantiator = new TeqFw_Di_Container_Instantiate();
        /** @type {TeqFw_Di_Container_Executor} */
        const wrapperExecutor = new TeqFw_Di_Container_Executor();

        const getKey = buildDependencyKey;
        const getMockKey = buildDependencyKey;

        /**
         * Applies the host hardening policy to a resolved value.
         *
         * @param {unknown} value
         * @returns {unknown}
         */
        let freeze = function (value) {
            if ((value === null) || (value === undefined)) return value;
            const type = typeof value;
            if ((type !== 'object') && (type !== 'function')) return value;
            if (Object.prototype.toString.call(value) === '[object Module]') return value;
            if (Object.isFrozen(value)) return value;
            return Object.freeze(value);
        };

        /**
         * Applies registered preprocessing hooks in registration order.
         *
         * @param {TeqFw_Di_Dto_DepId} depId
         * @returns {TeqFw_Di_Dto_DepId}
         */
        const applyPreprocess = function (depId) {
            /** @type {TeqFw_Di_Dto_DepId} */
            let current = depId;
            for (const fn of preprocess) current = fn(current);
            return current;
        };

        /**
         * Parses and normalizes one Dependency Specifier through the preprocessing pipeline.
         *
         * @param {string} specifier
         * @returns {TeqFw_Di_Dto_DepId}
         */
        const canonicalize = function (specifier) {
            return applyPreprocess(parser.parse(specifier));
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
         * @param {TeqFw_Di_Dto_DepId} depId
         * @returns {unknown}
         */
        const applyPostprocess = function (value, depId) {
            /** @type {unknown} */
            let current = value;
            /** @type {TeqFw_Di_Container_Postprocess_Context} */
            const context = Object.freeze({depId});
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
         * @returns {void}
         */
        const initializeInfrastructure = function () {
            if (state !== 'notConfigured') return;
            logger.log('Container.transition: notConfigured -> operational.');
            state = 'operational';
            const resolverConfig = configFactory.create({namespaces: namespaceRoots});
            if (typeof parser.setLogger === 'function') parser.setLogger(logger);
            resolver = new TeqFw_Di_Resolver({config: resolverConfig, logger});
            graphResolver = new TeqFw_Di_Container_GraphResolver({canonicalize, parser, findMock, resolver, logger});
            lifecycle = new TeqFw_Di_Container_Lifecycle(logger);
        };

        /**
         * Adds a preprocessing hook.
         *
         * @param {(depId: TeqFw_Di_Dto_DepId) => TeqFw_Di_Dto_DepId} fn
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
         * @param {(value: unknown, context: TeqFw_Di_Container_Postprocess_Context) => unknown} fn
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
            freeze = fn;
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
         * Registers a mock value for a Dependency Specifier.
         *
         * @param {string} specifier
         * @param {any} mock
         * @returns {void}
         */
        this.register = function (specifier, mock) {
            assertBuilderStage();
            logBuilder(`register('${specifier}').`);
            if (testMode !== true) throw new Error('Container test mode is disabled.');
            const depId = canonicalize(specifier);
            mockRegistry.set(getMockKey(depId), mock);
        };

        /**
         * Resolves a Dependency Specifier into a frozen Resolved Value.
         *
         * @param {string} specifier
         * @returns {Promise<any>}
         */
        this.get = async function (specifier) {
            if (state === 'failed') {
                logger.error(`Container.get: rejected in failed state specifier='${specifier}'.`);
                throw new Error('Container is in failed state.');
            }

            try {
                initializeInfrastructure();
                logger.log(`Container.state: '${state}'.`);
                return await executeContainerPipeline({
                    resolver,
                    graphResolver,
                    lifecycle,
                    instantiator,
                    wrapperExecutor,
                    logger,
                    testMode,
                    mockRegistry,
                    freeze,
                    canonicalize,
                    applyPostprocess,
                }, specifier);
            } catch (error) {
                logger.error(`Container.transition: operational -> failed.`, error);
                state = 'failed';
                throw error;
            }
        };
    }
}
