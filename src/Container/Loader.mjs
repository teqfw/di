import Resolver from './Loader/Resolver.mjs';
import Util from '../Util.mjs';

const $util = new Util();
/**
 * Load ES modules and store `export` results inside.
 */
export default class TeqFw_Di_Container_Loader {
    /** @type {TeqFw_Di_Container_Loader_Resolver} */
    resolver
    modules = {}

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
        delete this.modules[parsed.source_part];
    }

    async get(depId) {
        let result;
        const parsed = $util.parseId(depId);
        const sourceId = parsed.source_part;
        if (this.modules[sourceId]) {
            result = this.modules[sourceId];
        } else {
            const sourceFile = this.resolver.getSourceById(sourceId);
            const imported = await import(sourceFile);
            this.modules[sourceId] = imported.default;
            result = this.modules[sourceId];
        }
        return result;
    }

    /**
     * @return {TeqFw_Di_Container_Loader_Resolver}
     */
    getResolver() {
        return this.resolver;
    }

    has(depId) {
        const parsed = $util.parseId(depId);
        return Object.prototype.hasOwnProperty.call(this.modules, parsed.source_part);
    }

    list() {
        const result = Array.from(Object.keys(this.modules));
        return result.sort();
    }

    set(depId, source) {
        const parsed = $util.parseId(depId);
        if (parsed.is_instance) throw new Error('Cannot load module source as instance (remove \'$\' from `id`).');
        this.modules[depId] = source;
    }
}
