export default class App_Service {
    constructor(
        {
            App_Logger$: logger,
            App_Config: config,
            'node:http2': http2,
        }
    ) {
        const {constants: {HTTP2_HEADER_CONTENT_TYPE}} = http2;
        return function (opts) {
            logger.info(`Service '${config.appName}' is running with: ${JSON.stringify(opts)}`);
            logger.info(`Header: ${HTTP2_HEADER_CONTENT_TYPE}`);
        };
    }
}