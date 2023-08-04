// ./main.js
import container from './container.js';

const map = {
    service: './service.js',
    logger: './logger.js',
    config: './config.js',
};

container.setMap(map);
/** @type {function(Object)} */
const serv = await container.get('service');
serv({name: 'The Basics of Resolver'});