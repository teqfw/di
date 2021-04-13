/**
 * Scanner to lookup for Teq-plugins in given folder and 'node_modules' subfolder and to compose array with
 * 'TeqFw_Di_Api_ResolveDetails' data.
 */
// MODULE'S IMPORT
import Details from '../Api/ResolveDetails.mjs';
import ScanData from '../Api/ScanData.mjs';
import {existsSync, readdirSync, readFileSync, statSync} from 'fs';
import {join} from 'path';

// MODULE'S VARS
const PACKAGE = 'package.json';
const TEQFW = 'teqfw.json';

// MODULE'S CLASSES
class TeqFw_Di_Util_PluginScanner {

    // DEFINE PROTO METHODS

    /**
     *  Scan given 'path' to get namespaces mapping for TeqFW plugins.
     * @param {String} path
     * @return {Promise<Object.<string, TeqFw_Di_Api_ResolveDetails>>}
     */
    async getNamespaces(path) {
        const result = {};
        const descriptors = await this.scanFilesystem(path);
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

    /**
     * Scan given 'path' to get JSON descriptors for TeqFW plugins ('teqfw.json')
     * and for corresponded 'package.json' files.
     *
     * @param {String} path
     * @return {Promise<Object.<string, TeqFw_Di_Api_ScanData>>} Object-to-path map for found plugins
     */
    async scanFilesystem(path) {
        // DEFINE INNER FUNCTIONS
        function readData(path) {
            // DEFINE INNER FUNCTIONS
            /**
             * Check existence of JSON file, read content, parse JSON and return data.
             *
             * @param {String} filename
             * @returns {Object|null}
             */
            function readJson(filename) {
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
                    // stealth exception if JSON file does not exist.
                    if (e.code !== 'ENOENT' && e.code !== 'ENOTDIR') {
                        // re-throw other exceptions (wrong format or something else)
                        throw e;
                    }
                }
                return result;
            }

            // MAIN FUNCTIONALITY
            let result = null;
            const pathTeqfw = join(path, TEQFW);
            const pathPkg = join(path, PACKAGE);
            const dataTeqfw = readJson(pathTeqfw);
            const dataPkg = readJson(pathPkg);
            if ((dataTeqfw !== null) && (dataPkg !== null)) {
                result = new ScanData();
                result.teqfw = dataTeqfw;
                result.package = dataPkg;
                result.path = path;
            }
            return result;
        }

        // MAIN FUNCTIONALITY
        const result = {};
        // get scan data for root folder (application itself)
        const dataRoot = readData(path);
        if (dataRoot !== null) result[path] = dataRoot;
        // scan 'node modules' packages for TeqFW plugins
        const pathNodeMods = join(path, 'node_modules');
        const packages = readdirSync(pathNodeMods);
        for (const pack of packages) {
            if (pack[0] === '@') {
                // scan scope for nested packages
                const pathScope = join(pathNodeMods, pack);
                const scopedPackages = readdirSync(pathScope);
                for (const sub of scopedPackages) {
                    const pathNested = join(pathScope, sub);
                    const dataNested = readData(pathNested);
                    if (dataNested !== null) result[pathNested] = dataNested;
                }
            } else {
                // check package
                const pathNested = join(pathNodeMods, pack);
                const dataNested = readData(pathNested);
                if (dataNested !== null) result[pathNested] = dataNested;
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
