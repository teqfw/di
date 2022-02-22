/**
 * Scanner to lookup for Teq-plugins in given folder and 'node_modules' subfolder and to compose array with
 * 'TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Autoload' data.
 */
// MODULE'S IMPORT
import ScanData from '../Api/Dto/Scanned.mjs';
import {existsSync, readdirSync, readFileSync, statSync} from 'fs';
import {join} from 'path';

// MODULE'S VARS
const PACKAGE = 'package.json';
const TEQFW = 'teqfw.json';

// MODULE'S CLASSES
export default class TeqFw_Di_Back_Plugin_Scanner {

    constructor(spec) {
        // DEPS
        /** @type {TeqFw_Di_Back_Defaults} */
        const DEF = spec['TeqFw_Di_Back_Defaults$'];
        /** @type {TeqFw_Di_Back_Api_Dto_Plugin_Desc.Factory} */
        const fDesc = spec['TeqFw_Di_Back_Api_Dto_Plugin_Desc#Factory$'];
        /** @type {TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Autoload.Factory} */
        const fAutoload = spec['TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Autoload#Factory$'];

        // DEFINE INSTANCE METHODS

        this.getDescriptors = async function (path) {
            const result = [];
            const plugins = await this.scanFilesystem(path);
            for (const [, one] of Object.entries(plugins)) {
                if (one.teqfw?.[DEF.NAME]) {
                    /** @type {TeqFw_Di_Back_Api_Dto_Plugin_Desc} */
                    const desc = fDesc.create(one.teqfw[DEF.NAME]);
                    Object.freeze(desc);
                    result.push(desc);
                }
            }
            return result;
        }

        /**
         *  Scan given 'path' to get namespaces mapping for TeqFW plugins.
         * @param {String} path
         * @return {Promise<Object.<string, TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Autoload>>}
         */
        this.getNamespaces = async function (path) {
            const result = {};
            const plugins = await this.scanFilesystem(path);
            for (const [path, one] of Object.entries(plugins)) {
                if (one.teqfw?.[DEF.NAME]) {
                    /** @type {TeqFw_Di_Back_Api_Dto_Plugin_Desc} */
                    const desc = fDesc.create(one.teqfw[DEF.NAME]);
                    if (desc?.autoload?.ns) {
                        // make a copy, setup and freeze it
                        /** @type {TeqFw_Di_Shared_Api_Dto_Plugin_Desc_Autoload} */
                        const item = fAutoload.create(desc.autoload);
                        item.path = join(path, item.path);
                        Object.freeze(item);
                        result[item.ns] = item;
                    }
                }
            }
            return result;
        }
    }

    // DEFINE PROTO METHODS

    /**
     * Scan given 'path' to get JSON descriptors for TeqFW plugins ('teqfw.json')
     * and for corresponded 'package.json' files.
     *
     * @param {String} path
     * @return {Promise<Object.<string, TeqFw_Di_Back_Api_Dto_Scanned>>} Object-to-path map for found plugins
     */
    async scanFilesystem(path) {
        // FUNCS
        function readData(path) {
            // FUNCS
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

            // MAIN
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

        // MAIN
        const result = {};
        // get scan data for root folder (application itself)
        const dataRoot = readData(path);
        if (dataRoot !== null) result[path] = dataRoot;
        // scan 'node modules' packages for TeqFW plugins
        const pathNodeMods = join(path, 'node_modules');
        if (existsSync(pathNodeMods)) {
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
        }
        return result;
    }

}
