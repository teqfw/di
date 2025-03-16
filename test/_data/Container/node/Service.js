export default class App_Service {
    constructor(
        {
            App_Logger$: logger,
            App_Config: config,
        }
    ) {
        return function (opts) {
            logger.info(`Service '${config.appName}' is running with: ${JSON.stringify(opts)}`);
        };
    }
}