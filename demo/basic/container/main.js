import container from './container.js';

/** @type {function(Object)} */
const serv = await container.get('./service.js');
serv({name: 'The Basics of Container'});