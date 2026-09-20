export const __deps__ = {
    basename: 'node:path__basename',
};

/**
 * @param {{basename: (path: string) => string}} deps
 * @returns {{name: string, basename: string}}
 */
export default function Fx_NodeChild({basename}) {
    return {name: 'node-child', basename: basename('/tmp/child-node.txt')};
}
