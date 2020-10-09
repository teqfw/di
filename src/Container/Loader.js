import Resolver from './Loader/Resolver.js';
import Util from '../Util.js';

const $util = new Util();
/**
 * Load JS sources and save module's `export` results inside.
 */
export default class TeqFw_Di_Container_Loader {
    /** @type {TeqFw_Di_Container_Loader_Resolver} */
    resolver
    sources = {}

    /**
     *
     * @param {Object} [spec]
     * @param {TeqFw_Di_Container_Loader_Resolver} [spec.resolver]
     */
    constructor(spec = {}) {
        this.resolver = spec.resolver || new Resolver();
    }

    addNamespaceRoot({ns, path, ext, is_absolute = true}) {
        this.resolver.addNamespaceRoot({ns, path, ext, is_absolute});
    }

    delete(depId) {
        const parsed = $util.parseId(depId);
        delete this.sources[parsed.source_part];
    }

    get(depId) {
        const me = this;
        return new Promise(function (resolve, reject) {
            const parsed = $util.parseId(depId);
            const sourceId = parsed.source_part;
            if (me.sources[sourceId]) {
                resolve(me.sources[sourceId]);
            } else {
                const sourceFile = me.resolver.getSourceById(sourceId);
                import(sourceFile).then(imported => {
                    me.sources[sourceId] = imported.default;
                    resolve(me.sources[sourceId]);
                }).catch(err => {
                    reject(err);
                });
            }
        });
    }

    /**
     * @return {TeqFw_Di_Container_Loader_Resolver}
     */
    getResolver() {
        return this.resolver;
    }

    has(depId) {
        const parsed = $util.parseId(depId);
        return Object.prototype.hasOwnProperty.call(this.sources, parsed.source_part);
    }

    list() {
        const result = Array.from(Object.keys(this.sources));
        return result.sort();
    }

    set(depId, source) {
        const parsed = $util.parseId(depId);
        if (parsed.is_instance) throw new Error('Cannot load module source as instance (remove \'$\' from `id`).');
        this.sources[depId] = source;
    }
}
