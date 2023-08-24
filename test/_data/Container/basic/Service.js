export default async function (
    {
        App_Logger$: logger,
        App_Config: config,
    }
) {
    return function (opts) {
        logger.info(`Service '${config.appName}' is running with: ${JSON.stringify(opts)}`);
    };
}