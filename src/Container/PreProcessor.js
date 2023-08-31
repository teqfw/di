/**
 * The preprocessor handles object keys after the parsing but before creating any objects.
 * A replacement rules can be implemented here.
 * Every handler is a function with 2 arguments:
 *  - objectKey: current key after processing with other handlers;
 *  - originalKey: the key before any processing;
 */
export default class TeqFw_Di_Container_PreProcessor {

    constructor() {
        // VARS
        /**
         * The array of handlers in the dependency order (from the basic (di) up to the app).
         * @type {Array<function(TeqFw_Di_DepId, TeqFw_Di_DepId):TeqFw_Di_DepId>}
         */
        const _handlers = [];

        // INSTANCE METHODS

        /**
         *
         * @param {function(TeqFw_Di_DepId, TeqFw_Di_DepId):TeqFw_Di_DepId} hndl
         */
        this.addHandler = function (hndl) {
            _handlers.push(hndl);
        };

        /**
         * Get all pre-processing handlers.
         * @return {Array<function(TeqFw_Di_DepId, TeqFw_Di_DepId): TeqFw_Di_DepId>}
         */
        this.getHandlers = () => _handlers;

        /**
         * @param {TeqFw_Di_DepId} objectKey
         * @return {TeqFw_Di_DepId}
         */
        this.process = function (objectKey) {
            let res = objectKey;
            for (const one of _handlers)
                res = one(res, objectKey);
            return res;
        };
    }
};