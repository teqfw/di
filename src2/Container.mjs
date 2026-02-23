// @ts-check

import TeqFw_Di_Def_Parser from './Def/Parser.mjs';
import TeqFw_Di_Dto_Resolver_Config from './Dto/Resolver/Config.mjs';
import TeqFw_Di_Resolver from './Resolver.mjs';
import TeqFw_Di_Container_Resolve_GraphResolver from './Container/Resolve/GraphResolver.mjs';
import TeqFw_Di_Container_Instantiate_Instantiator from './Container/Instantiate/Instantiator.mjs';
import TeqFw_Di_Container_Lifecycle_Registry from './Container/Lifecycle/Registry.mjs';
import TeqFw_Di_Container_Wrapper_Executor from './Container/Wrapper/Executor.mjs';

/**
 * @typedef {'notConfigured'|'operational'|'failed'} TeqFw_Di_Container_State
 */

/**
 * Container orchestration boundary.
 *
 * Executes immutable linking pipeline:
 * parse -> preprocess -> resolve graph -> instantiate -> postprocess ->
 * lifecycle -> freeze -> return.
 */
export default class TeqFw_Di_Container {
    /**
     * Creates container instance in `notConfigured` state.
     */
    constructor() {
        /** @type {TeqFw_Di_Container_State} */
        let state = 'notConfigured';
        /** @type {((depId: TeqFw_Di_DepId$DTO) => TeqFw_Di_DepId$DTO)[]} */
        const preprocess = [];
        /** @type {((value: unknown) => unknown)[]} */
        const postprocess = [];

        /** @type {TeqFw_Di_Def_Parser} */
        let parser = new TeqFw_Di_Def_Parser();
        /** @type {TeqFw_Di_Dto_Resolver_Config} */
        const configFactory = new TeqFw_Di_Dto_Resolver_Config();
        /** @type {TeqFw_Di_Resolver} */
        const resolver = new TeqFw_Di_Resolver({
            config: configFactory.create({}),
        });
        /** @type {TeqFw_Di_Container_Resolve_GraphResolver} */
        let graphResolver = new TeqFw_Di_Container_Resolve_GraphResolver({parser, resolver});
        /** @type {TeqFw_Di_Container_Instantiate_Instantiator} */
        const instantiator = new TeqFw_Di_Container_Instantiate_Instantiator();
        /** @type {TeqFw_Di_Container_Lifecycle_Registry} */
        const lifecycle = new TeqFw_Di_Container_Lifecycle_Registry();
        /** @type {TeqFw_Di_Container_Wrapper_Executor} */
        const wrapperExecutor = new TeqFw_Di_Container_Wrapper_Executor();

        /**
         * @param {TeqFw_Di_DepId$DTO} depId
         * @returns {string}
         */
        const getKey = function (depId) {
            return `${depId.platform}::${depId.moduleName}`;
        };

        /**
         * Freezes values that support freezing.
         *
         * @param {unknown} value
         * @returns {unknown}
         */
        const freeze = function (value) {
            if ((value === null) || (value === undefined)) return value;
            const type = typeof value;
            if ((type !== 'object') && (type !== 'function')) return value;
            if (Object.prototype.toString.call(value) === '[object Module]') return value;
            if (Object.isFrozen(value)) return value;
            Object.freeze(value);
            return value;
        };

        /**
         * Applies ordered preprocess pipeline.
         *
         * @param {TeqFw_Di_DepId$DTO} depId
         * @returns {TeqFw_Di_DepId$DTO}
         */
        const applyPreprocess = function (depId) {
            /** @type {TeqFw_Di_DepId$DTO} */
            let current = depId;
            for (const fn of preprocess) {
                current = fn(current);
            }
            return current;
        };

        /**
         * Applies ordered postprocess pipeline.
         *
         * @param {unknown} value
         * @returns {unknown}
         */
        const applyPostprocess = function (value) {
            /** @type {unknown} */
            let current = value;
            for (const fn of postprocess) {
                current = fn(current);
            }
            return current;
        };

        /**
         * @param {object} namespace
         * @returns {Record<string, unknown>}
         */
        const readDepsDecl = function (namespace) {
            /** @type {unknown} */
            const deps = Reflect.get(namespace, '__deps__');
            if (deps === undefined) return {};
            if (!deps || (typeof deps !== 'object') || Array.isArray(deps)) {
                throw new Error('Invalid \'__deps__\' declaration: object expected.');
            }
            return /** @type {Record<string, unknown>} */ (deps);
        };

        /**
         * Registers preprocess extension before first resolution.
         *
         * @param {(depId: TeqFw_Di_DepId$DTO) => TeqFw_Di_DepId$DTO} fn
         * @returns {void}
         */
        this.addPreprocess = function (fn) {
            if (state !== 'notConfigured') throw new Error('Container configuration is locked.');
            preprocess.push(fn);
        };

        /**
         * Registers postprocess extension before first resolution.
         *
         * @param {(value: unknown) => unknown} fn
         * @returns {void}
         */
        this.addPostprocess = function (fn) {
            if (state !== 'notConfigured') throw new Error('Container configuration is locked.');
            postprocess.push(fn);
        };

        /**
         * Replaces default parser before first resolution.
         *
         * @param {TeqFw_Di_Def_Parser} next
         * @returns {void}
         */
        this.setParser = function (next) {
            if (state !== 'notConfigured') throw new Error('Container configuration is locked.');
            parser = next;
            graphResolver = new TeqFw_Di_Container_Resolve_GraphResolver({parser, resolver});
        };

        /**
         * Resolves dependency by CDC and returns frozen linked value.
         *
         * @param {string} cdc
         * @returns {Promise<unknown>}
         */
        this.get = async function (cdc) {
            if (state === 'failed') throw new Error('Container is in failed state.');
            if (state === 'notConfigured') state = 'operational';

            try {
                /** @type {TeqFw_Di_DepId$DTO} */
                const parsed = parser.parse(cdc);
                /** @type {TeqFw_Di_DepId$DTO} */
                const root = applyPreprocess(parsed);
                /** @type {Map<string, {depId: TeqFw_Di_DepId$DTO, namespace: object}>} */
                const graph = await graphResolver.resolve(root);
                /** @type {Map<string, unknown>} */
                const built = new Map();

                /**
                 * @param {string} key
                 * @returns {unknown}
                 */
                const build = function (key) {
                    if (built.has(key)) return built.get(key);
                    if (!graph.has(key)) throw new Error(`Resolved graph node is missing for '${key}'.`);

                    const node = graph.get(key);
                    const value = lifecycle.apply(node.depId, function () {
                        /** @type {Record<string, unknown>} */
                        const deps = {};
                        /** @type {Record<string, unknown>} */
                        const depsDecl = readDepsDecl(node.namespace);
                        for (const [name, edd] of Object.entries(depsDecl)) {
                            if (typeof edd !== 'string') {
                                throw new Error(`Invalid '__deps__' entry '${name}': EDD string expected.`);
                            }
                            /** @type {TeqFw_Di_DepId$DTO} */
                            const childDepId = parser.parse(edd);
                            deps[name] = build(getKey(childDepId));
                        }
                        /** @type {unknown} */
                        const instantiated = instantiator.instantiate(node.depId, node.namespace, deps);
                        /** @type {unknown} */
                        const postprocessed = applyPostprocess(instantiated);
                        /** @type {unknown} */
                        const wrapped = wrapperExecutor.execute(node.depId, postprocessed, node.namespace);
                        return freeze(wrapped);
                    });
                    built.set(key, value);
                    return value;
                };

                return build(getKey(root));
            } catch (error) {
                state = 'failed';
                throw error;
            }
        };
    }
}
