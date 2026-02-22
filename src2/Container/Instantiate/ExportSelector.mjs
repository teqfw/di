// @ts-check

/**
 * Instantiate-stage export selector.
 *
 * Selects exactly one export from an already loaded ES module namespace object
 * using only `depId.exportName`.
 */
export default class TeqFw_Di_Container_Instantiate_ExportSelector {
    /**
     * Selects a raw export value from module namespace.
     *
     * @param {object} namespace Loaded ES module namespace object.
     * @param {TeqFw_Di_DepId$DTO} depId Dependency identity DTO.
     * @returns {unknown} Raw selected export value.
     */
    select(namespace, depId) {
        if (!namespace || (typeof namespace !== 'object')) {
            throw new Error('Namespace must be an object.');
        }

        /** @type {string|null} */
        const exportName = depId.exportName;
        if (exportName === null) {
            throw new Error('Export name must not be null for export selection.');
        }

        if (!(exportName in namespace)) {
            throw new Error(`Export '${exportName}' is not found in module namespace.`);
        }

        return namespace[exportName];
    }
}
