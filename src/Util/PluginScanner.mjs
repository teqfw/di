/**
 * Scanner to lookup for Teq-plugins in given folder and 'node_modules' subfolder and to compose array with
 * 'TeqFw_Di_Api_ResolveDetails' data.
 */
// MODULE'S IMPORT
import Details from '../Api/ResolveDetails.mjs';
import {existsSync, readdirSync, readFileSync, statSync} from 'fs';
import {join} from 'path';

// MODULE'S VARS
const DESCRIPTOR = 'teqfw.json';

// MODULE'S CLASSES
class TeqFw_Di_Util_PluginScanner {

    // DEFINE PROTO METHODS

    /**
     * Scan given 'path' to get JSON descriptors for TeqFW plugins.
     * @param {String} path
     * @return {Promise<Object.<string, Object>>} Object-to-path map for found plugins
     */
    async scanDescriptors(path) {
        // PARSE INPUT & DEFINE WORKING VARS
        /**
         * Check existence of plugin descriptor, read content, parse JSON and return data.
         * @param {String} filename
         * @returns {Promise<Object|null>}
         */
        async function checkPlugin(filename) {
            let result = null;
            try {
                const stat = statSync(filename);
                if (stat.isFile()) {
                    const buffer = readFileSync(filename);
                    const content = buffer.toString();
                    const json = JSON.parse(content);
                    if (typeof json === 'object') {
                        result = json;
                    }
                }
            } catch (e) {
                // stealth exception if TeqFW descriptor does not exist for the package
                if (e.code !== 'ENOENT') {
                    // transit other exceptions
                    throw e;
                }
            }
            return result;
        }

        // MAIN FUNCTIONALITY
        const result = {};
        // get 'teqfw.json' for root folder (application itself)
        const rootDesc = join(path, DESCRIPTOR);
        const rootData = await checkPlugin(rootDesc);
        if (rootData !== null) result[rootDesc] = rootData;
        // scan 'node modules' packages for TeqFW plugins
        const pathNodeMods = join(path, 'node_modules');
        const packages = readdirSync(pathNodeMods);
        for (const pack of packages) {
            if (pack[0] === '@') {
                // scan scope for nested packages
                const pathScope = join(pathNodeMods, pack);
                const scopedPackages = readdirSync(pathScope);
                for (const sub of scopedPackages) {
                    const packageDesc = join(pathScope, sub, DESCRIPTOR);
                    const data = await checkPlugin(packageDesc);
                    if (data !== null) result[packageDesc] = data;
                }
            } else {
                // check package
                const packageDesc = join(pathNodeMods, pack, DESCRIPTOR);
                const data = await checkPlugin(packageDesc);
                if (data !== null) result[packageDesc] = data;
            }
        }

        return result;
    }

    /**
     *  Scan given 'path' to get namespaces mapping for TeqFW plugins.
     * @param {String} path
     * @return {Promise<Object.<string, TeqFw_Di_Api_ResolveDetails>>}
     */
    async scanNamespaces(path) {
        const result = {};
        const descriptors = await this.scanDescriptors(path);
        for (const [path, one] of Object.entries(descriptors)) {
            if (one.autoload?.ns && one.autoload?.path) {
                const item = new Details();
                item.path = join(path, one.autoload.path);
                item.ns = one.autoload.ns;
                // default values (would be overwritten in descriptor)
                item.isAbsolute = one.autoload.isAbsolute ?? true;
                item.ext = one.autoload.ext ?? 'mjs';
                result[item.ns] = item;
            }
        }
        return result;
    }

}

// MODULE'S FUNCTIONS
// MODULE'S FUNCTIONALITY
// MODULE'S EXPORT
export {
    TeqFw_Di_Util_PluginScanner as default
}
