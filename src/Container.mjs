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
        /** @type {((depId: TeqFw_Di_DepId__DTO) => TeqFw_Di_DepId__DTO)[]} */
        const preprocess = [];
        /** @type {((value: unknown) => unknown)[]} */
        const postprocess = [];
        /** @type {TeqFw_Di_Dto_Resolver_Config_Namespace__DTO[]} */
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
        /** @type {{log(message: string): void, error(message: string, error?: unknown): void}} */
        let logger = TeqFw_Di_Internal_Logger_Noop;
        /** @type {TeqFw_Di_Container_Instantiate} */
        const instantiator = new TeqFw_Di_Container_Instantiate();
        /** @type {TeqFw_Di_Container_Executor} */
        const wrapperExecutor = new TeqFw_Di_Container_Executor();

        const getKey = buildDependencyKey;
        const getMockKey = buildDependencyKey;

        const freeze = function (value) {
            if ((value === null) || (value === undefined)) return value;
            const type = typeof value;
            if ((type !== 'object') && (type !== 'function')) return value;
            if (Object.prototype.toString.call(value) === '[object Module]') return value;
            if (Object.isFrozen(value)) return value;
            try {
                Object.freeze(value);
            } catch (error) {
                logger.log(`Container.freeze: skipped (${String(error)}).`);
            }
            return value;
        };

        const applyPreprocess = function (depId) {
            /** @type {TeqFw_Di_DepId__DTO} */
            let current = depId;
            for (const fn of preprocess) current = fn(current);
            return current;
        };

        const applyPostprocess = function (value) {
            /** @type {unknown} */
            let current = value;
            for (const fn of postprocess) current = fn(current);
            return current;
        };

        const assertBuilderStage = function () {
            if (state !== 'notConfigured') throw new Error('Container configuration is locked.');
        };

        const logBuilder = function (message) {
            if (!loggingEnabled) return;
            logger.log(`Container.builder: ${message}`);
        };

        const initializeInfrastructure = function () {
            if (state !== 'notConfigured') return;
            logger.log('Container.transition: notConfigured -> operational.');
            state = 'operational';
            const resolverConfig = configFactory.create({namespaces: namespaceRoots});
            if (typeof parser.setLogger === 'function') parser.setLogger(logger);
            resolver = new TeqFw_Di_Resolver({config: resolverConfig, logger});
            graphResolver = new TeqFw_Di_Container_GraphResolver({parser, resolver, logger});
            lifecycle = new TeqFw_Di_Container_Lifecycle(logger);
        };

        /**
         * Adds a preprocessing hook.
         *
         * @param {(depId: TeqFw_Di_DepId__DTO) => TeqFw_Di_DepId__DTO} fn
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
         * @param {(value: unknown) => unknown} fn
         * @returns {void}
         */
        this.addPostprocess = function (fn) {
            assertBuilderStage();
            logBuilder('addPostprocess().');
            postprocess.push(fn);
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
         * Registers a mock value for a CDC.
         *
         * @param {string} cdc
         * @param {any} mock
         * @returns {void}
         */
        this.register = function (cdc, mock) {
            assertBuilderStage();
            logBuilder(`register('${cdc}').`);
            if (testMode !== true) throw new Error('Container test mode is disabled.');
            const depId = parser.parse(cdc);
            mockRegistry.set(getMockKey(depId), mock);
        };

        /**
         * Resolves a CDC into a frozen linked instance.
         *
         * @param {string} cdc
         * @returns {Promise<any>}
         */
        this.get = async function (cdc) {
            if (state === 'failed') {
                logger.error(`Container.get: rejected in failed state cdc='${cdc}'.`);
                throw new Error('Container is in failed state.');
            }

            try {
                initializeInfrastructure();
                logger.log(`Container.state: '${state}'.`);
                return await executeContainerPipeline({
                    parser,
                    resolver,
                    graphResolver,
                    lifecycle,
                    instantiator,
                    wrapperExecutor,
                    logger,
                    testMode,
                    mockRegistry,
                    freeze,
                    applyPreprocess,
                    applyPostprocess,
                }, cdc);
            } catch (error) {
                logger.error(`Container.transition: operational -> failed.`, error);
                state = 'failed';
                throw error;
            }
        };
    }
}
