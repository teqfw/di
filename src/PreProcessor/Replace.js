/**
 * Pre-processor handler to replace one object key with another.
 * @namespace TeqFw_Di_PreProcessor_Replace
 */

/**
 * Factory function to create pre-processor handler.
 * @return {function(*): *}
 */
export default function () {
    // VARS
    /**
     * Storage for ES modules replacements (interface => implementation).
     * Sample: {['Vnd_Plug_Interface']:'Vnd_Plug_Impl', ...}
     * @type {Object<string, string>}
     */
    const replacements = {};

    // FUNCS
    /**
     * @param {TeqFw_Di_Api_ObjectKey} objectKey
     * @param {TeqFw_Di_Api_ObjectKey} originalKey
     * @return {TeqFw_Di_Api_ObjectKey}
     */
    function TeqFw_Di_PreProcessor_Replace(objectKey, originalKey) {
        let module = objectKey.moduleName;
        while (replacements[module]) module = replacements[module];
        if (module !== objectKey.moduleName) {
            const res = Object.assign({}, objectKey);
            res.moduleName = module;
            return res;
        } else
            return objectKey;
    }

    /**
     * Add replacement for ES6 modules.
     *
     * @param {string} orig ('Vnd_Plug_Interface')
     * @param {string} alter ('Vnd_Plug_Impl')
     */
    TeqFw_Di_PreProcessor_Replace.add = function (orig, alter) {
        replacements[orig] = alter;
    };

    // MAIN
    return TeqFw_Di_PreProcessor_Replace;
}