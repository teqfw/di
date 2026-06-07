// @ts-check

/**
 * @namespace TeqFw_Di_Container_Runtime
 * @description Internal runtime coordinator for container orchestration.
 */

import TeqFw_Di_Parser from '../Parser.mjs';
import {Factory as TeqFw_Di_Dto_Resolver_Config_Factory} from '../Dto/Resolver/Config.mjs';
import TeqFw_Di_Resolver from './Resolver.mjs';
import TeqFw_Di_Container_Resolve_GraphResolver from './Resolve/GraphResolver.mjs';
import TeqFw_Di_Container_Instantiate_Instantiator from './Instantiate/Instantiator.mjs';
import TeqFw_Di_Container_Lifecycle_Registry from './Lifecycle/Registry.mjs';
import TeqFw_Di_Container_Wrapper_Executor from './Wrapper/Executor.mjs';
import TeqFw_Di_Internal_Logger, {TeqFw_Di_Internal_Logger_Noop} from '../Internal/Logger.mjs';
import {buildDependencyKey} from '../Internal/DependencyKey.mjs';
import {readDepsDecl} from '../Internal/DepsDecl.mjs';
import {makePromiseSafe} from '../Internal/PromiseSafe.mjs';

/**
 * @typedef {'notConfigured'|'operational'|'failed'} TeqFw_Di_Container_State
 */

export default class TeqFw_Di_Container_Runtime {
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
        /** @type {TeqFw_Di_Container_Resolve_GraphResolver|undefined} */
        let graphResolver;
        /** @type {TeqFw_Di_Container_Lifecycle_Registry|undefined} */
        let lifecycle;
        /** @type {{log(message: string): void, error(message: string, error?: unknown): void}} */
        let logger = TeqFw_Di_Internal_Logger_Noop;
        /** @type {TeqFw_Di_Container_Instantiate_Instantiator} */
        const instantiator = new TeqFw_Di_Container_Instantiate_Instantiator();
        /** @type {TeqFw_Di_Container_Wrapper_Executor} */
        const wrapperExecutor = new TeqFw_Di_Container_Wrapper_Executor();

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
            graphResolver = new TeqFw_Di_Container_Resolve_GraphResolver({parser, resolver, logger});
            lifecycle = new TeqFw_Di_Container_Lifecycle_Registry(logger);
        };

        this.addPreprocess = function (fn) {
            assertBuilderStage();
            logBuilder('addPreprocess().');
            preprocess.push(fn);
        };

        this.addPostprocess = function (fn) {
            assertBuilderStage();
            logBuilder('addPostprocess().');
            postprocess.push(fn);
        };

        this.setParser = function (next) {
            assertBuilderStage();
            parser = next;
            if (typeof parser.setLogger === 'function') parser.setLogger(loggingEnabled ? logger : null);
            logBuilder('setParser().');
        };

        this.addNamespaceRoot = function (prefix, target, defaultExt) {
            assertBuilderStage();
            logBuilder(`addNamespaceRoot('${prefix}').`);
            namespaceRoots.push({prefix, target, defaultExt});
        };

        this.enableTestMode = function () {
            assertBuilderStage();
            logBuilder('enableTestMode().');
            testMode = true;
        };

        this.enableLogging = function () {
            assertBuilderStage();
            if (loggingEnabled) return;
            loggingEnabled = true;
            logger = new TeqFw_Di_Internal_Logger();
            if (typeof parser.setLogger === 'function') parser.setLogger(logger);
            logger.log('Container.builder: enableLogging().');
        };

        this.register = function (cdc, mock) {
            assertBuilderStage();
            logBuilder(`register('${cdc}').`);
            if (testMode !== true) throw new Error('Container test mode is disabled.');
            const depId = parser.parse(cdc);
            mockRegistry.set(getMockKey(depId), mock);
        };

        this.get = async function (cdc) {
            if (state === 'failed') {
                logger.error(`Container.get: rejected in failed state cdc='${cdc}'.`);
                throw new Error('Container is in failed state.');
            }

            /** @type {string} */
            let stage = 'start';
            try {
                logger.log(`Container.get: cdc='${cdc}'.`);
                initializeInfrastructure();
                logger.log(`Container.state: '${state}'.`);
                stage = 'parse';
                logger.log('Container.pipeline: parse:entry.');
                const parsed = parser.parse(cdc);
                logger.log(`Container.pipeline: parse:exit '${parsed.platform}::${parsed.moduleName}'.`);
                stage = 'preprocess';
                logger.log('Container.pipeline: preprocess:entry.');
                const root = applyPreprocess(parsed);
                logger.log(`Container.pipeline: preprocess:exit '${root.platform}::${root.moduleName}'.`);
                if (testMode === true) {
                    stage = 'mock';
                    logger.log('Container.pipeline: mock-lookup:entry.');
                    const key = getMockKey(root);
                    if (mockRegistry.has(key)) {
                        logger.log(`Container.pipeline: mock-lookup:hit '${key}'.`);
                        stage = 'freeze';
                        logger.log('Container.pipeline: freeze:entry.');
                        const frozenMock = freeze(mockRegistry.get(key));
                        logger.log('Container.pipeline: freeze:exit.');
                        logger.log('Container.pipeline: return:success.');
                        return makePromiseSafe(frozenMock);
                    }
                    logger.log(`Container.pipeline: mock-lookup:miss '${key}'.`);
                } else {
                    logger.log('Container.pipeline: mock-lookup:disabled.');
                }
                stage = 'resolve';
                logger.log('Container.pipeline: resolve:entry.');
                const graph = await graphResolver.resolve(root);
                logger.log(`Container.pipeline: resolve:exit nodes=${graph.size}.`);
                /** @type {Map<string, unknown>} */
                const built = new Map();

                const build = function (key) {
                    if (built.has(key)) return built.get(key);
                    if (!graph.has(key)) throw new Error(`Resolved graph node is missing for '${key}'.`);
                    const node = graph.get(key);
                    stage = 'lifecycle';
                    logger.log(`Container.pipeline: lifecycle:entry '${node.depId.platform}::${node.depId.moduleName}'.`);
                    const value = lifecycle.apply(node.depId, function () {
                        stage = 'instantiate';
                        logger.log(`Container.pipeline: instantiate:entry '${node.depId.platform}::${node.depId.moduleName}'.`);
                        /** @type {Record<string, unknown>} */
                        const deps = {};
                        /** @type {Record<string, unknown>} */
                        const depsDecl = readDepsDecl(node.namespace, node.depId);
                        for (const [name, cdcValue] of Object.entries(depsDecl)) {
                            const childDepId = parser.parse(/** @type {string} */ (cdcValue));
                            deps[name] = build(getKey(childDepId));
                        }
                        const instantiated = instantiator.instantiate(node.depId, node.namespace, deps);
                        logger.log(`Container.pipeline: instantiate:exit '${node.depId.platform}::${node.depId.moduleName}'.`);
                        stage = 'postprocess';
                        logger.log(`Container.pipeline: postprocess:entry '${node.depId.platform}::${node.depId.moduleName}'.`);
                        const postprocessed = applyPostprocess(instantiated);
                        logger.log(`Container.pipeline: postprocess:exit '${node.depId.platform}::${node.depId.moduleName}'.`);
                        const wrapped = wrapperExecutor.execute(node.depId, postprocessed, node.namespace);
                        stage = 'freeze';
                        logger.log(`Container.pipeline: freeze:entry '${node.depId.platform}::${node.depId.moduleName}'.`);
                        const frozen = freeze(wrapped);
                        logger.log(`Container.pipeline: freeze:exit '${node.depId.platform}::${node.depId.moduleName}'.`);
                        return frozen;
                    });
                    logger.log(`Container.pipeline: lifecycle:exit '${node.depId.platform}::${node.depId.moduleName}'.`);
                    built.set(key, value);
                    return value;
                };

                const result = build(getKey(root));
                logger.log('Container.pipeline: return:success.');
                return makePromiseSafe(result);
            } catch (error) {
                logger.error(`Container.pipeline: failed at stage='${stage}'.`, error);
                logger.log('Container.transition: operational -> failed.');
                state = 'failed';
                throw error;
            }
        };
    }
}
