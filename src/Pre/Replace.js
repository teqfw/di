/**
 * Pre-processor chunk that replaces module addresses during dependency resolution.
 *
 * This chunk allows dynamically overriding the module namespace used to resolve source code
 * for a given dependency ID. Only the `moduleName` field of the `depId` is modified.
 * All other metadata (such as lifestyle, export type, etc.) remains unchanged.
 *
 * This mechanism enables redirecting from one module implementation to another
 * without changing aliases or component registration.
 *
 * Example:
 *     Replace module path 'Fl32_Cms_Back_Api_Adapter' with 'App_Cms_Adapter_Custom',
 *     while keeping the lifestyle and export configuration intact.
 *
 * @implements {TeqFw_Di_Api_Container_PreProcessor_Chunk}
 */
export default class TeqFw_Di_Pre_Replace {

    constructor() {
        // VARS

        /**
         * Mapping of source module namespaces to their replacements.
         * Keys and values are strings without export/lifestyle suffixes.
         *
         * Example:
         * {
         *   'Fl32_Cms_Back_Api_Adapter': 'App_Cms_Adapter_Custom'
         * }
         *
         * This means: when resolving a module with `moduleName === 'Fl32_Cms_Back_Api_Adapter'`,
         * use source code from `'App_Cms_Adapter_Custom'` instead.
         *
         * @type {Object<string, string>}
         */
        const map = {};

        // INSTANCE METHODS

        /**
         * Register a single module address replacement.
         *
         * @param {string} orig - Original module namespace (e.g. 'X_Y_Z')
         * @param {string} alter - Replacement module namespace (e.g. 'A_B_C')
         */
        this.add = function (orig, alter) {
            map[orig] = alter;
        };

        /* eslint-disable no-unused-vars */
        /**
         * Replace the `moduleName` of the dependency ID if a mapping exists.
         *
         * This function does not alter any other part of the `depId` (e.g. lifestyle, export kind).
         *
         * @param {TeqFw_Di_DepId} depId - Dependency ID after previous transformations.
         * @param {TeqFw_Di_DepId} originalId - Original dependency ID before any processing.
         * @param {string[]} stack - Stack of parent dependency IDs (for trace/debug).
         * @returns {TeqFw_Di_DepId} - Transformed `depId` with updated `moduleName` if replaced.
         */
        this.modify = function (depId, originalId, stack) {
            let module = depId.moduleName;
            const seen = new Set();

            while (map[module] && !seen.has(module)) {
                seen.add(module);
                module = map[module];
            }

            if (module !== depId.moduleName) {
                return {
                    ...depId,
                    moduleName: module,
                };
            }

            return depId;
        };
    }
}
