import logger from '../ioc/inverted/logger.js';
import Service from '../ioc/inverted/service.js';

/**
 * @interface
 */
class Container {
    /**
     * Get some object from the Container.
     * @param {string} key
     * @return {Object}
     */
    get(key) {
        // fake creation of the service
        return new Service(logger);
    }

    /**
     * Put some object into the Container.
     * @param {string} key
     * @param {Object} obj
     */
    put(key, obj) {}
}

// initialize the Container
const container = new Container();
container.put('logger', logger);
container.put('service', Service);

// use the Container
/** @type {Service} */
const serv = container.get('service');
serv.exec({name: 'Container'});