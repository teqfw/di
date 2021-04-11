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
    constructor() {

    }

    // DEFINE PROTO METHODS

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

}

// MODULE'S FUNCTIONS
// MODULE'S FUNCTIONALITY
// MODULE'S EXPORT
export {
    TeqFw_Di_Util_PluginScanner as default
}
