// const path = require('path');
import path from 'node:path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default {
    entry: {
        esm: {import: './index.mjs', filename: 'di.esm.js'},
        cjs: {import: './index.cjs', filename: 'di.cjs.js'},
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'development',
};