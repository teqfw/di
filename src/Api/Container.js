/**
 * Public runtime API of the DI container.
 *
 * This is not executable code, it is just for documentation purposes (similar to .h files in the C/C++ language).
 * @interface
 */
export default class TeqFw_Di_Api_Container {

    /**
     * Resolves a dependency by its identifier and returns the result.
     *
     * @param {string} depId
     * @param {string[]} [stack]
     * @returns {Promise<*>}
     */
    get(depId, stack) {
        throw new Error('TeqFw_Di_Api_Container#get is abstract.');
    }
}
