export default async function Factory({['./logger.js']: logger, ['./config.js']: config}) {
    return function (opts) {
        logger.info(`Service '${config.appName}' is running with: ${JSON.stringify(opts)}`);
    };
}