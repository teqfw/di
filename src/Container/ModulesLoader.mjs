import Resolver from "./ModulesLoader/Resolver.mjs"
import Normalizer from "../Normalizer.mjs"

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
        const _sources = {};

        this.addNamespaceRoot = function ({ns, path, ext, is_absolute = true}) {
            _resolver.addNamespaceRoot({ns, path, ext, is_absolute});
        };

        this.delete = function (obj_id) {
            const parsed = Normalizer.parseId(obj_id);
            delete _sources[parsed.source_part];
        };

        this.get = function (obj_id) {
            return new Promise(function (resolve, reject) {
                const parsed = Normalizer.parseId(obj_id);
                const source_id = parsed.source_part;
                if (_sources[source_id]) {
                    resolve(_sources[source_id]);
                } else {
                    const source_file = _resolver.getSourceById(source_id);
                    import(source_file).then(imported => {
                        _sources[source_id] = imported.default;
                        resolve(_sources[source_id]);
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

        this.has = function (obj_id) {
            const parsed = Normalizer.parseId(obj_id);
            return _sources.hasOwnProperty(parsed.source_part);
        };

        this.list = function () {
            const result = Array.from(Object.keys(_sources));
            return result.sort();
        };

        this.set = function (obj_id, source) {
            const parsed = Normalizer.parseId(obj_id);
            if (parsed.is_instance) throw new Error("Cannot load module source as instance (remove '$' from `id`).");
            _sources[obj_id] = source;
        };

    }
}