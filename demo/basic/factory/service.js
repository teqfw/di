export default async function Factory({logger}) {
    // this code should be in the Container
    // const mod = await import(logger);
    // const depLogger = mod.default;
    // end of Container code
    return function (opts) {
        logger.info(`Service is running with: ${JSON.stringify(opts)}`);
    };
}