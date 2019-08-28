import Resolver from "./ModulesLoader/Resolver.mjs"
import Normalizer from "./Normalizer.mjs"

/**
 * Load modules and save export results inside.
 *
 * @class
 */
export default class TeqFw_Di_Container_ModulesLoader {
    /**
     *
     * @param {Object} [spec]
     * @param {TeqFw_Di_Container_ModulesLoader_Resolver} [spec.resolver]
     */
    constructor(spec = {}) {
        const _resolver = spec.resolver || new Resolver();
        const _imports = {};

        this.addNamespaceRoot = function ({ns, path, ext, is_absolute = true}) {
            _resolver.addNamespaceRoot({ns, path, ext, is_absolute});
        };

        this.delete = function (dep_id) {
            delete _imports[dep_id];
        };

        this.get = function (id) {
            return new Promise(function (resolve, reject) {
                const parsed = Normalizer.parseId(id);
                const source_id = parsed.source_part;
                if (_imports[source_id]) {
                    resolve(_imports[source_id]);
                } else {
                    const source_file = _resolver.getSourceById(source_id);
                    import(source_file).then(imported => {
                        _imports[source_id] = imported.default;
                        resolve(_imports[source_id]);
                    }).catch(err => {
                        reject(err);
                    });
                }
            });
        };

        /**
         * @return {TeqFw_Di_Container_ModulesLoader_Resolver}
         */
        this.getResolver = function () {
            return _resolver;
        };

        this.has = function (dep_id) {
            return _imports.hasOwnProperty(dep_id);
        };

        this.list = function () {
            const result = Array.from(Object.keys(_imports));
            return result.sort();
        };
        this.set = function (id, imported) {
            const parsed = Normalizer.parseId(id);
            if (parsed.is_instance) throw new Error("Cannot load module source as instance (remove '$' from `id`).");
            _imports[id] = imported;
        };


    }
}