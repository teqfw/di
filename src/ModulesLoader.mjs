import Resolver from "./ModulesLoader/Resolver.mjs"

/**
 * Load modules and save export results inside.
 *
 * @class
 */
export default class TeqFw_Di_ModulesLoader {
    /**
     *
     * @param {Object} [spec]
     * @param {TeqFw_Di_ModulesLoader_Resolver} [spec.resolver]
     */
    constructor(spec = {}) {
        const _resolver = spec.resolver || new Resolver();
        const _imports = {};

        this.get = function (id) {
            return new Promise(function (resolve, reject) {
                if (_imports[id]) {
                    resolve(_imports[id]);
                } else {
                    const source_file = _resolver.getSourceById(id);
                    import(source_file).then(imported => {
                        _imports[id] = imported.default;
                        resolve(_imports[id]);
                    }).catch(err => {
                        reject(err);
                    });
                }
            });
        }

        this.set = function (id, imported) {
            _imports[id] = imported;
        };

        this.addNamespaceRoot = function ({ns, path, ext, is_absolute = true}) {
            _resolver.addNamespaceRoot({ns, path, ext, is_absolute});
        }

        /**
         * @return {TeqFw_Di_ModulesLoader_Resolver}
         */
        this.getResolver = function () {
            return _resolver;
        }
    }
}