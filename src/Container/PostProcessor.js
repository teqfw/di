/**
 * The post-processor handles the result object after composition and before returning.
 *
 *  @implements TeqFw_Di_Api_Container_PostProcessor
 */
export default class TeqFw_Di_Container_PostProcessor {

    constructor() {
        // VARS

        /**
         * The array of the chunks to modify dependency IDs.
         * @type {TeqFw_Di_Api_Container_PostProcessor_Chunk[]}
         */
        const _chunks = [];

        // INSTANCE METHODS

        this.addChunk = function (chunk) {
            _chunks.push(chunk);
        };

        this.modify = async function (obj, depId) {
            let res = obj;
            for (const one of _chunks) {
                res = one.modify(res, depId);
                if (res instanceof Promise) res = await res;
            }
            return res;
        };
    }
};