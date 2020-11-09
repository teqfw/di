import IdParser from './IdParser.mjs';

const $parser = new IdParser();

/**
 * Proxy object for constructors specification ('spec' argument in constructor) to analyze dependencies and to collect
 * required dependencies. This proxy adds constructed instances into container's `_instances` object.
 *
 * This code is too much coupled to `TeqFw_Di_Container` and extracted to separate class just for decreasing
 * of nesting levels.
 *
 * @class
 */
export default class TeqFw_Di_Container_SpecProxy {
    /** Marker for construction exceptions that should be stolen. */
    static EXCEPTION_TO_STEALTH = Symbol('exception_to_stealth')

    /**
     * @param {string} mainId ID of the constructing object ('Vendor_Module$', 'Vendor_Module$$', 'dbCfg').
     * @param {Object.<string, Boolean>} depsStack All incomplete dependencies in current construction process
     * (to prevent circular dependencies).
     * @param {Map} containerInstances Container level registry with created singletons (ids: 'dbCfg', 'Module$$').
     * @param {Map} containerConstructors Container level registry with loaded constructors (ids: 'Module$').
     * @param {Map} containerModules Container level registry with loaded modules (ids: 'Module').
     * @param {Object<string, Function>} makeFuncs constructing process level registry to save functions that
     * construct main object & nested dependencies.
     * @param {Function} fnGetObject `TeqFw_Di_Container.getObject` function to get/create required dependencies.
     * @param {Function} fnMainObjectReject TeqFw_Di_Container.get_object@Promise.reject to interrupt
     * construction process on some error (import error or circular dependency, for example).
     * @return {{}} Proxy object to resolve dependencies.
     */
    constructor(
        mainId,
        depsStack,
        containerInstances,
        containerConstructors,
        containerModules,
        makeFuncs,
        fnGetObject,
        fnMainObjectReject
    ) {

        /**
         * Resolved dependencies for currently constructing object (with `mainId`).
         *
         * @type {Object<string, Object>}
         */
        const deps = {};

        return new Proxy({}, {
            get(target, prop) {
                // convert property name of the `spec` object in `constructor(spec)` to dependency id string.
                const depId = String(prop);
                if (deps[depId]) {
                    // use dependency from local registry (it is possible on second, third, ... usage
                    // of the `constructor` after exception on un-existing dependency)
                    return deps[depId];
                } else {
                    // we have no dependency in the local cache yet
                    // look up dependency in container's registry
                    const parsed = $parser.parse(depId);
                    if (parsed.isSingleton && containerInstances.has(depId)) {
                        // requested dependency is an instance and is created before
                        // save dependency to local registry & return
                        deps[depId] = containerInstances.get(depId);
                        return deps[depId];
                    } else {
                        // check stack of incomplete dependencies
                        if (depsStack[depId]) {
                            // `dep_id` is already requested to be created, so we report it as 'main'
                            throw new Error(`Circular dependencies (main: ${depId}; dep: ${mainId})`);
                        }
                        // ... and register new one
                        depsStack[depId] = true;
                        // create new required dependency for this object
                        fnGetObject(depId, depsStack).then((obj) => {
                            // save created `dep_id` instance to local dependencies registry
                            deps[depId] = obj;
                            // remove created dependency from circular registry
                            depsStack[depId] = false;
                            // call to failed construction function to create main object
                            // see `fn_make` in `TeqFw_Di_Container.get`
                            const fnMakeMain = makeFuncs[mainId];
                            fnMakeMain();
                        }).catch(err => {
                            fnMainObjectReject(err);
                        });
                    }
                    // interrupt construction process until new dependency will be created
                    // and new construction process will be started
                    throw TeqFw_Di_Container_SpecProxy.EXCEPTION_TO_STEALTH;
                }
            }
        });
    }
}
