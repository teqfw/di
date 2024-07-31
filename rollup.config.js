import resolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';

export default {
    input: 'src/Container.js',
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
        resolve(),
        terser()
    ]
};
