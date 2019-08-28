import Normalizer from "../Normalizer.mjs";

/**
 * Proxy object to analyze dependencies specification and to return required dependencies.
 * This proxy adds constructed instances into container's `_instances` object.
 *
 * This code is too much coupled to `TeqFw_Di_Container` and extracted to separate class just for decreasing
 * of nesting levels.
 *
 * @class
 */
class TeqFw_Di_Container_SpecProxy {

    /**
     * @param {string} main_id ID of the constructing object ("Vendor_Module_Class", "dbCfg$pg", ...).
     * @param {Set<string>} deps_stack All incomplete dependencies in current construction process
     * (to prevent circular dependencies).
     * @param {Map} container_instances Container level registry with created instances (with ids "...$[...]").
     * @param {Object<string, Function>} make_funcs constructing process level registry to save functions that
     * construct main object & nested dependencies.
     * @param {Function} fn_get_dependency `TeqFw_Di_Container.get_object` function to get/create required dependencies.
     * @param {Function} fn_get_object_reject TeqFw_Di_Container.get_object@Promise.reject to interrupt
     * construction process on some error (import error or circular dependency, for example).
     * @return {{}} Proxy object to resolve dependencies.
     */
    constructor(main_id,
                deps_stack,
                container_instances,
                make_funcs,
                fn_get_dependency,
                fn_get_object_reject) {

        /**
         * Resolved dependencies for currently constructing object.
         *
         * @type {Object<string, Object>}
         */
        const deps = {};

        return new Proxy({}, {
            get(target, prop) {
                // convert property name of the `spec` object in `constructor(spec)` to dependency id string.
                const dep_id = String(prop);
                if (deps[dep_id]) {
                    // use dependency from local registry (it is possible on second, third, ... usage
                    // of the `constructor` after exception on un-existing dependency)
                    return deps[dep_id];
                } else {
                    // we have no dependency in the local cache yet
                    // look up dependency in container's registry
                    const parsed = Normalizer.parseId(dep_id);
                    if (parsed.is_instance && container_instances.has(dep_id)) {
                        // requested dependency is an instance and is created before
                        // save dependency to local registry & return
                        deps[dep_id] = container_instances.get(dep_id);
                        return deps[dep_id];
                    } else {
                        // check stack of incomplete dependencies
                        if (deps_stack.has(dep_id)) {
                            // `dep_id` is already requested to be created, so we report it as "main"
                            throw new Error(`Circular dependencies (main: ${dep_id}; dep: ${main_id})`);
                        }
                        // ... and register new one
                        deps_stack.add(dep_id);
                        // create new required dependency for this object
                        fn_get_dependency(dep_id, deps_stack).then((obj) => {
                            // save created `dep_id` instance to local dependencies registry
                            deps[dep_id] = obj;
                            // remove created dependency from circular registry
                            deps_stack.delete(dep_id);
                            // call to failed construction function to create main object
                            // see `fn_make` in `TeqFw_Di_Container.get`
                            const fn_make_main = make_funcs[main_id];
                            fn_make_main();
                        }).catch(err => {
                            fn_get_object_reject(err);
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

/**
 * Marker for construction exceptions that should be stolen.
 *
 * @type {string}
 * @memberOf TeqFw_Di_Container_SpecProxy
 */
TeqFw_Di_Container_SpecProxy.EXCEPTION_TO_STEALTH = "TeqFw_Di_Container_SpecProxy.exception_to_stealth";

export default TeqFw_Di_Container_SpecProxy;