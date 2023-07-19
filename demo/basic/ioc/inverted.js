import logger from './inverted/logger.js';
import Service from './inverted/service.js';

const serv = new Service(logger);
serv.exec({name: 'Inverted control'});