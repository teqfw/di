export default async function Factory({['./logger.js']: logger}) {
    return function (opts) {
        logger.info(`Service is running with: ${JSON.stringify(opts)}`);
    };
}