/**
 * `TeqFw/DI` container.
 *
 * Root object for the package.
 *
 * @namespace TeqFw_Di
 */
import Normalizer from "./Normalizer.mjs";
import Resolver from "./Resolver.mjs";

/**
 * Dependency Injection container.
 *
 * @memberOf TeqFw_Di
 */
class TeqFw_Di_Container {
    constructor() {
        /** Defaults imported from the sources  */
        const _imports = new Map();
        /** Created instances (singletons) */
        const _instances = new Map();
        /** Namespace to path (filesystem or web) mapping */
        const _sources = new Map();
        /** Storage for objects constructors (to restore construction after absent dependency will be created) */
        const _create_funcs = new Map();
        /** Object to resolve path to source by dependency ID */
        const _resolver = new Resolver();

        // set default instance of the DI container
        _instances.set("TeqFw_Di_Container$", this);

        /**
         * Async creation of the object by given object ID. This function instances are placed into `_create` queue
         * to be performed after all deps will be created.
         *
         * @param id
         * @return {Promise<Object>}
         */
        async function create_object(id) {
            const parsed = Normalizer.parseId(id);
            console.log(`Getting data for ID '${parsed.id}'.`);
            if (parsed.is_singleton) {
                // get required instance from `_instances` or check sources import and create new one
                const inst_by_id = _instances.get(parsed.id);
                if (inst_by_id !== undefined) {
                    // instance with required `id` was created before, just return it
                    return inst_by_id;
                } else {
                    // TODO: create new instance then save it to `_instance` registry.
                }
            } else {
                // get imported data from `_imports` (or load sources) then create new object
                const imported_src = _imports.get(parsed.id);
                const import_type = typeof imported_src;
                if (import_type === "object") {
                    // imported data is object, just return this object on every call
                    return imported_src;
                } else if (import_type === "function") {
                    // https://stackoverflow.com/a/29094018/4073821
                    const has_constructor = imported_src["constructor"];
                    if (imported_src["constructor"] !== undefined) {
                        return "this is class sources";
                    } else {
                        return "this is function sources";
                    }
                } else if (import_type === "undefined") {
                } else {
                    throw new Error("Unexpected type of stored import.");
                }
            }
            // if (parsed.is_singleton && _instances.get(parsed.id)) {
            //     // singleton object is created before
            //     return _instances.get(parsed.id);
            // } else if (!parsed.is_singleton && _imports.get(parsed.id)) {
            //     // object sources were imported before
            //     const foo = typeof _imports.get(parsed.id);
            //     if (typeof _imports.get(parsed.id) === "object") {
            //         resolve(_imports.get(parsed.id));
            //     } else {
            //         const Type = _imports.get(parsed.id);
            //         resolve(Type());
            //     }
            //
            // } else {
            //     // load sources and create new object
            //     const src = _resolver.getSourceById(norm_id);
            //     import(src).then((module) => {
            //         const Type = module.default;
            //         // create function with closure of the currently creating object ID
            //         const fn_create = function () {
            //             // proxy object to intercept deps called from object constructor
            //             const proxySpec = new Proxy({}, {
            //                 get(target, p) {
            //                     // analyze property name and create deps here...
            //                     if (_objects.has(p)) {
            //                         return _objects.get(p);
            //                     } else {
            //                         create_object(p).then(() => {
            //                             // we need to call to failed function to create parent object
            //                             const fn_parent = _create_funcs.get(norm_id);
            //                             fn_parent();
            //                         });
            //                         throw `There is no dependency with id '${p}' yet.`;
            //                     }
            //                 }
            //             });
            //             try {
            //                 const result = new Type(proxySpec);
            //                 _objects.set(norm_id, result);
            //                 _create_funcs.delete(norm_id);
            //                 resolve(result);
            //             } catch (e) {
            //                 console.log(e);
            //             }
            //         };
            //         _create_funcs.set(id, fn_create);
            //         try {
            //             fn_create();
            //         } catch (e) {
            //             console.log(e);
            //         }
            //     });
            // }
        }

        /**
         *
         * @type {function(*=): Promise<Object>}
         * @memberOf TeqFw_Di_Container.prototype
         */
        this.get = create_object;

        /**
         * Check existence of singleton or imported data in container.
         *
         * @param {string} id
         * @return {boolean} 'true' if
         * @memberOf TeqFw_Di_Container.prototype
         */
        this.has = function (id) {
        };

        /**
         * Delete stored object by `id` (if exist).
         *
         * @param {string} id
         * @memberOf TeqFw_Di_Container.prototype
         */
        this.delete = function (id) {
        };

        /**
         * Place object instance (singleton) into the container. Replace existing object with the same ID.
         *
         * @param {string} id - ID for (named) singleton ("Vendor_Module_Object$", "Vendor_Module_Object$name").
         * @param {Object} object
         * @memberOf TeqFw_Di_Container.prototype
         */
        this.put = function (id, object) {
            const parsed = Normalizer.parseId(id);
            if (parsed.is_singleton) {
                _instances.set(parsed.id, object);
            } else {
                _imports.set(parsed.id, object);
            }
        };

        /**
         *
         * @param {string} namespace
         * @param {string} path
         * @param {string} [ext]
         * @memberOf TeqFw_Di_Container.prototype
         */
        this.addSourceMapping = function (namespace, path, ext = "mjs") {
            const parsed = Normalizer.parseId(namespace);
            if (parsed.is_singleton) throw new Error(`Namespace cannot contain '$' symbol.`);
            _resolver.addNamespaceRoot({ns: parsed.source_part, path, ext});
        }
    }
}

export default TeqFw_Di_Container;