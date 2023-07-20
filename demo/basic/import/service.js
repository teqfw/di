export default async function Factory({logger: pathToLogger}) {
    // begin of DI functionality
    const {default: fLogger} = await import(pathToLogger);
    const logger = await fLogger();
    // end of DI functionality
    return function (opts) {
        logger.info(`Service is running with: ${JSON.stringify(opts)}`);
    };
}