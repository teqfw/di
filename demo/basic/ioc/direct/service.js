import logger from './logger.js';

export default class Service {
    exec(opts) {
        logger.info(`Service is running with: ${JSON.stringify(opts)}`);
    }
}