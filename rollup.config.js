import {nodeResolve} from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

/**
 * The @rollup/plugin-terser declaration is interpreted as CommonJS by the
 * nodenext module-resolution mode, so its default export is typed as the module
 * namespace rather than the plugin factory; bridge it to the callable form.
 *
 * @type {() => import('rollup').Plugin}
 */
const terserPlugin = /** @type {() => import('rollup').Plugin} */ (/** @type {unknown} */ (terser));

/**
 * Fails the browser distribution build if its import graph reaches Node.js-only composition code.
 *
 * @returns {{name: string, moduleParsed(moduleInfo: {id: string}): void}}
 */
export function createBrowserBundleBoundaryGuard() {
    /**
     * @param {string} id
     * @returns {boolean}
     */
    const isNodeOnlyModule = function (id) {
        const normalized = id.replaceAll('\\', '/');
        return normalized.includes('/src/Node/')
            || normalized.startsWith('src/Node/');
    };

    return {
        name: 'browser-bundle-boundary',
        /**
         * @this {import('rollup').PluginContext}
         * @param {{id: string}} moduleInfo
         * @returns {void}
         */
        moduleParsed(moduleInfo) {
            if (isNodeOnlyModule(moduleInfo.id)) {
                this.error('Browser bundle must not include Node.js-only composition module: ' + moduleInfo.id + '.');
            }
        },
    };
}

export default {
    input: 'src/Container.mjs',
    output: [
        {
            file: 'dist/esm.js',
            format: 'es'
        },
        {
            file: 'dist/umd.js',
            format: 'umd',
            name: 'TeqFw_Di_Container',
        }
    ],
    plugins: [
        createBrowserBundleBoundaryGuard(),
        nodeResolve(),
        terserPlugin()
    ]
};
