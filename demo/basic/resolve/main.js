import resolver from './resolver.js';
import container from './container.js';

container.setResolver(resolver);
/** @type {function(Object)} */
const serv = await container.get('service');
serv({name: 'The Basics of Resolver'});