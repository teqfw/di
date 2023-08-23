/**
 * Class to create new instances of the service.
 */
export default class Sample_App_Service {
    /**
     * @param {Sample_App_Config} config
     * @param {Sample_App_Logger|function(string)} logger
     */
    constructor(
        {
            Sample_App_Config: config,
            Sample_App_Logger$: logger,
        }
    ) {

        logger(`Service '${this.constructor.name}' is created for app '${config.name}'.`);

        /**
         * @param {string} param
         * @memberOf Sample_App_Service.prototype
         */
        this.exec = function (param) {
            logger(`Service running with '${param}' param.`);
        }
    }
}