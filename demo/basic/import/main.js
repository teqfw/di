import fLogger from './logger.js';
import fService from './service.js';

const logger = await fLogger();
const serv = await fService({['./logger.js']: logger});
serv({name: 'The Basics of Import'});