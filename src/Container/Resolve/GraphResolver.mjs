// @ts-check

/**
 * @namespace TeqFw_Di_Container_Resolve_GraphResolver
 * @description Dependency graph resolver for container preloading.
 */

/**
 * Resolve-stage graph builder.
 *
 * Recursively resolves module namespaces and their declared `__deps__`
 * into a deterministic map keyed by structural DepId identity.
 */

/**
 * @typedef {object} TeqFw_Di_Container_Resolve_GraphResolver_Dependencies
 * @property {TeqFw_Di_Def_Parser} parser
 * @property {TeqFw_Di_Resolver} resolver
 * @property {{log(message: string): void}|null} [logger]
 */

/**
 * @typedef {{depId: TeqFw_Di_DepId__DTO, namespace: object}} TeqFw_Di_Container_Resolve_GraphResolver_Node
 */

export default class TeqFw_Di_Container_Resolve_GraphResolver {

    /**
     * @param {TeqFw_Di_Container_Resolve_GraphResolver_Dependencies} deps
     */
    constructor({parser, resolver, logger = null}) {
        /** @type {{log(message: string): void}|null} */
        const log = logger;

        /**
         * @param {TeqFw_Di_DepId__DTO} depId
         * @returns {string}
         */
        const makeNodeKey = function (depId) {
            /** @type {string} */
            const wrappers = Array.isArray(depId.wrappers) ? depId.wrappers.join('|') : '';
            return [
                depId.platform,
                depId.moduleName,
                depId.exportName === null ? '' : depId.exportName,
                depId.composition,
                depId.life === null ? '' : depId.life,
                wrappers,
            ].join('::');
        };

        /**
         * @param {TeqFw_Di_DepId__DTO} depId
         * @param {Map<string, TeqFw_Di_Container_Resolve_GraphResolver_Node>} out
         * @param {Set<string>} stack
         * @param {string[]} chain
         * @returns {Promise<void>}
         */
        const walk = async function (depId, out, stack, chain) {
            /** @type {string} */
            const identity = makeNodeKey(depId);
            if (stack.has(identity)) {
                /** @type {string} */
                const cycle = [...chain, identity].join(' -> ');
                throw new Error(`Cyclic dependency detected: ${cycle}`);
            }

            /** @type {string} */
            const key = makeNodeKey(depId);
            if (out.has(key)) return;

            stack.add(identity);
            chain.push(identity);
            try {
                /** @type {object} */
                const namespace = await resolver.resolve(depId);
                if (log) log.log(`GraphResolver.walk: resolved '${key}'.`);
                out.set(key, {depId, namespace});

                /** @type {unknown} */
                const depsDecl = Reflect.get(namespace, '__deps__');
                if (depsDecl === undefined) return;
                /** @type {Record<string, unknown>} */
                let depsMap = /** @type {Record<string, unknown>} */ (depsDecl);
                if ((depsDecl !== null) && (typeof depsDecl === 'object') && !Array.isArray(depsDecl)) {
                    const exportName = depId.exportName === null ? 'default' : depId.exportName;
                    const exportScoped = Reflect.get(/** @type {object} */ (depsDecl), exportName);
                    if ((exportScoped !== undefined) && (exportScoped !== null) && (typeof exportScoped === 'object') && !Array.isArray(exportScoped)) {
                        depsMap = /** @type {Record<string, unknown>} */ (exportScoped);
                    }
                }
                for (const [, cdc] of Object.entries(depsMap)) {
                    /** @type {string} */
                    const nextCdc = /** @type {string} */ (cdc);
                    /** @type {TeqFw_Di_DepId__DTO} */
                    const nextDepId = parser.parse(nextCdc);
                    if (log) log.log(`GraphResolver.walk: edge '${key}' -> '${nextDepId.platform}::${nextDepId.moduleName}'.`);
                    await walk(nextDepId, out, stack, chain);
                }
            } finally {
                chain.pop();
                stack.delete(identity);
            }
        };

        /**
         * Resolves full dependency graph for a root depId.
         *
         * @param {TeqFw_Di_DepId__DTO} depId
         * @returns {Promise<Map<string, TeqFw_Di_Container_Resolve_GraphResolver_Node>>}
         */
        this.resolve = async function (depId) {
            /** @type {Map<string, TeqFw_Di_Container_Resolve_GraphResolver_Node>} */
            const out = new Map();
            /** @type {Set<string>} */
            const stack = new Set();
            /** @type {string[]} */
            const chain = [];
            await walk(depId, out, stack, chain);
            return out;
        };
    }
}
