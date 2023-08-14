/**
 * The root parser for `objectKeys` contains all other parsers.
 * It calls the other parser one by one to parse the object key as a structure.
 * Every npm package can have its own format for an `objectKey`.
 */
import defaultParser from './Parser/Def.js';

// VARS
const KEY_PARSER = 'parser';
const KEY_VALIDATOR = 'validator';

// MAIN
export default class TeqFw_Di_Parser {

    constructor() {
        // VARS
        /**
         * Default parsing function.
         * @type {(function(string): TeqFw_Di_Api_ObjectKey)}
         */
        let _defaultParser = defaultParser;
        /**
         * The array of the pairs {validator, parser} to parse objectKeys.
         * @type {Object<validator:function, parser:function>[]}
         */
        const _parsers = [];

        // INSTANCE METHODS

        /**
         *
         * @param {function:boolean} validator
         * @param {function(string):TeqFw_Di_Api_ObjectKey} parser
         */
        this.addParser = function (validator, parser) {
            _parsers.push({[KEY_VALIDATOR]: validator, [KEY_PARSER]: parser});
        };

        /**
         * @param {string} objectKey
         * @return {TeqFw_Di_Api_ObjectKey}
         */
        this.parse = function (objectKey) {
            let res;
            for (const one of _parsers) {
                if (one[KEY_VALIDATOR](objectKey)) {
                    res = one[KEY_PARSER](objectKey);
                    break;
                }
            }
            if (!res)
                res = _defaultParser(objectKey);
            return res;
        };

        /**
         * @param {function(string):TeqFw_Di_Api_ObjectKey} parser
         */
        this.setDefaultParser = function (parser) {
            _defaultParser = parser;
        };

        // MAIN
    }
};