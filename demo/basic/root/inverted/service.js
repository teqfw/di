export default class Service {
    #logger;

    constructor(logger) {
        this.#logger = logger;
    }

    exec(opts) {
        this.#logger.info(`Service is running with: ${JSON.stringify(opts)}`);
    }
}