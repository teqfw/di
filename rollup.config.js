import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

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
        resolve(),
        terser()
    ]
};
