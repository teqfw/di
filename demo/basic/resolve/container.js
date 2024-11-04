const deps = {}; // all created deps
const map = {}; // abstractions-to-details map

function parser(def) {
    const res = [];
    const parts = /function Factory\s*\(\{(.*)}\).*/s.exec(def);
    if (parts?.[1]) {  //  {logger, config}
        const deps = parts[1].split(',');
        for (const dep of deps)
            res.push(dep.trim());
    }
    return res;
}

/**
 * @param {string} key - logical name of the object
 * @returns {Promise<*>}
 */
async function get(key) {
    if (deps[key]) return deps[key];
    else {
        const path = map[key];
        const {default: factory} = await import(path);
        const def = factory.toString();
        const names = parser(def);
        const spec = {};
        for (const name of names)
            spec[name] = await get(name);
        const res = factory(spec);
        deps[key] = res;
        return res;
    }
}

export default {get, setMap: (data) => Object.assign(map, data)};