/**
 * The preprocessor handles object keys after the parsing but before creating any objects.
 * A replacement rules can be implemented here.
 * Every handler is a function with 2 arguments:
 *  - objectKey: current key after processing with other handlers;
 *  - originalKey: the key before any processing;
 *
 *  @implements TeqFw_Di_Api_Container_PreProcessor
 */
export default class TeqFw_Di_Container_PreProcessor {

    constructor() {
        // VARS
        /**
         * The array of handlers in the dependency order (from the basic (di) up to the app).
         * @type {Array<function(TeqFw_Di_DepId, TeqFw_Di_DepId):TeqFw_Di_DepId>}
         */
        const _handlers = [];

        /**
         * The array of the chunks to modify dependency IDs.
         * @type {TeqFw_Di_Api_Container_PreProcessor_Chunk[]}
         */
        const _chunks = [];

        // INSTANCE METHODS

        this.addChunk = function (chunk) {
            _chunks.push(chunk);
        };

        /**
         * Get all pre-processing handlers.
         * @return {Array<function(TeqFw_Di_DepId, TeqFw_Di_DepId): TeqFw_Di_DepId>}
         * @deprecated remove it
         */
        this.getHandlers = () => _handlers;

        this.modify = function (depId) {
            let res = depId;
            for (const one of _chunks)
                res = one.modify(res, depId);
            return res;
        };
    }
};