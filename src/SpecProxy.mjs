import IdParser from './IdParser.mjs';
import ParsedId from './Api/ParsedId.mjs';

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
export default class TeqFw_Di_SpecProxy {
    /** Marker for construction exceptions that should be stolen. */
    static EXCEPTION_TO_STEALTH = Symbol('exception_to_stealth')

    /**
     * @param {string} mainId ID of the constructing object ('Vendor_Module$', 'Vendor_Module$$', 'dbCfg').
     * @param {Object.<string, Boolean>} uplineDeps All incomplete dependencies in current construction process
     * (to prevent circular dependencies).
     * @param {Map} containerSingletons Container level registry with created singletons (ids: 'dbCfg', 'Module$$').
     * @param {Function} fnCreate constructing process level registry to save functions that
     * construct main object & nested dependencies.
     * @param {Function} fnGetObject `TeqFw_Di_Container.getObject` function to get/create required dependencies.
     * construction process on some error (import error or circular dependency, for example).
     * @param {Function} fnRejectUseFactory 'reject' function from 'TeqFw_Di_Container.getObject._useFactory' result.
     * @returns {{}} Proxy object to resolve dependencies as `constructor(spec)`.
     */
    constructor(
        mainId,
        uplineDeps,
        containerSingletons,
        fnCreate,
        fnGetObject,
        fnRejectUseFactory
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
                    if (
                        (parsed.typeTarget === ParsedId.TYPE_TARGET_SINGLETON) &&
                        containerSingletons.has(parsed.mapKey)
                    ) {
                        // requested dependency is an instance and is created before
                        // save dependency to local registry & return
                        deps[depId] = containerSingletons.get(parsed.mapKey);
                        return deps[depId];
                    } else if (
                        (parsed.typeId === ParsedId.TYPE_ID_MANUAL) &&
                        (parsed.typeTarget === ParsedId.TYPE_TARGET_SINGLETON) &&
                        !containerSingletons.has(parsed.mapKey)
                    ) {
                        throw new Error(`There is no '${parsed.mapKey}' singleton in the container.`);
                    } else {
                        // check stack of incomplete dependencies
                        if (parsed.nameModule) { // don't process manually inserted singletons
                            if (uplineDeps[parsed.nameModule]) {
                                // `dep_id` is already requested to be created, so we report it as 'main'
                                const err = new Error(`Circular dependencies (main: ${depId}; dep: ${mainId})`);
                                fnRejectUseFactory(err);  // reject async _useFactory
                                throw err;                  // break sync object's constructor
                            }
                            // ... and register new one
                            uplineDeps[parsed.nameModule] = true;
                        }
                        // create new required dependency for this object
                        fnGetObject(depId, uplineDeps).then((obj) => {
                            // save created `dep_id` instance to local dependencies registry
                            deps[depId] = obj;
                            // remove created dependency from circular registry
                            uplineDeps[parsed.nameModule] = false;
                            // re-call main object construction function
                            fnCreate();
                        }).catch(err => {
                            // re-throw error from promise
                            fnRejectUseFactory(err);  // reject async _useFactory
                        });
                    }
                    // interrupt construction process until new dependency will be created
                    // and new construction process will be started (see try-catch block in `fnCreate`)
                    throw TeqFw_Di_SpecProxy.EXCEPTION_TO_STEALTH;
                }
            }
        });
    }
}
