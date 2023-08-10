export default async function (
    {
        ['app.Logger']: logger, // use default export as factory to create the singleton
        ['app.Config']: config, // use default export as factory to create the singleton
        ['app.Logger?mod']: module, // return ES6 module itself
        ['app.Logger?export=default&inst']: inst, // use named export as factory to create an instance
    }
) {
    return function (opts) {
        logger.info(`Service '${config.appName}' is running with: ${JSON.stringify(opts)}`);
    };
}