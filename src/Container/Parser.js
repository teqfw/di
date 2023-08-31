/**
 * The parser for the runtime dependency ID contains multiple chunks. Each npm package can have its own format for
 * a `depId`. The parser calls the chunks one by one to parse the string ID as a structure and returns the first result.
 * If none of the chunks processed the `depId`, the parser calls the default chunk.
 */
import DefChunk from './Parser/Chunk/Def.js';

/**
 * @implements TeqFw_Di_Api_Container_Parser
 */
export default class TeqFw_Di_Container_Parser {
    constructor() {
        // VARS
        /**
         * The default chunk to parse the depId if no other chunks have parsed this depId.
         *
         * @type {TeqFw_Di_Api_Container_Parser_Chunk}
         */
        let _defaultChunk = new DefChunk();
        /**
         * The array of the chunks to parse dependency IDs.
         * @type {TeqFw_Di_Api_Container_Parser_Chunk[]}
         */
        const _chunks = [];

        // INSTANCE METHODS

        this.addChunk = function (chunk) {
            _chunks.push(chunk);
        };

        this.parse = function (depId) {
            let res;
            for (const one of _chunks)
                if (one.canParse(depId)) {
                    res = one.parse(depId);
                    break;
                }
            if (!res)
                res = _defaultChunk?.parse(depId);
            return res;
        };

        this.setDefaultChunk = function (chunk) {
            _defaultChunk = chunk;
        };
    }
};