/**
 * @namespace TeqFw_Di
 */
import Normalizer from "./Normalizer.mjs";
import Resolver from "./Resolver.mjs";

/**
 * @memberOf TeqFw_Di
 */
class TeqFw_Di_Container {
    constructor() {
        const _objects = new Map();
        const _create = new Map();
        const _resolver = new Resolver();

        /**
         * Async creation of the object by given object ID. This function instances are placed into `_create` queue
         * to be performed after all deps will be created.
         *
         * @param id
         * @return {Promise<Object>}
         */
        function create_object(id) {
            const norm_id = Normalizer.parseId(id);
            console.log(`Create object with ID '${norm_id}'.`);

            return new Promise(function (resolve) {
                if (_objects.get(norm_id)) {
                    // object is created before
                    resolve(_objects.get(norm_id));
                } else {
                    // load sources and create new object
                    const src = _resolver.getSourceById(norm_id);
                    import(src).then((module) => {
                        const Type = module.default;
                        // create function with closure of the currently creating object ID
                        const fn_create = function () {
                            // proxy object to intercept deps called from object constructor
                            const proxySpec = new Proxy({}, {
                                get(target, p) {
                                    // analyze property name and create deps here...
                                    if (_objects.has(p)) {
                                        return _objects.get(p);
                                    } else {
                                        create_object(p).then(() => {
                                            // we need to call to failed function to create parent object
                                            const fn_parent = _create.get(norm_id);
                                            fn_parent();
                                        });
                                        throw `There is no dependency with id '${p}' yet.`;
                                    }
                                }
                            });
                            try {
                                const result = new Type(proxySpec);
                                _objects.set(norm_id, result);
                                _create.delete(norm_id);
                                resolve(result);
                            } catch (e) {
                                console.log(e);
                            }
                        };
                        _create.set(id, fn_create);
                        try {
                            fn_create();
                        } catch (e) {
                            console.log(e);
                        }
                    })
                }
            });
        }

        this.get = create_object;

        this.has = async function (id) {
        };

        this.addSourceMapping = function (namespace, path, ext = "mjs") {
            const ns_norm = Normalizer.parseId(namespace);
            _resolver.addNamespaceRoot({ns: ns_norm, path, ext});
        }
    }
}

export default TeqFw_Di_Container;