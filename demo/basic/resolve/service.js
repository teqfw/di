export default async function Factory({logger, config}) {
    return function (opts) {
        logger.info(`Service '${config.appName}' is running with: ${JSON.stringify(opts)}`);
    };
}