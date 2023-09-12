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
         * The array of the chunks to modify dependency IDs.
         * @type {TeqFw_Di_Api_Container_PreProcessor_Chunk[]}
         */
        const _chunks = [];

        // INSTANCE METHODS

        this.addChunk = function (chunk) {
            _chunks.push(chunk);
        };

        this.modify = function (depId, stack) {
            let res = depId;
            for (const one of _chunks)
                res = one.modify(res, depId, stack);
            return res;
        };
    }
};