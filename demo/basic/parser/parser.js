/**
 * @param {string} def
 * @returns {string[]}
 */
export default function (def) {
    const res = [];
    const parts = /function Factory\s*\(\{(.*)}\).*/s.exec(def);
    if (parts?.[1]) {
        // './logger.js': logger, './config.js': config
        const deps = parts[1].split(',');
        for (const dep of deps) {
            const left = dep.split(':')[0];
            const path = left.trim()
                .replace(/'/g, '')
                .replace(/"/g, '')
                .replace('[', '')
                .replace(']', '');
            res.push(path);
        }
    }
    return res;
};