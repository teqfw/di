import spec from './spec.js';
import fService from './service.js';

const serv = await fService(spec);
serv({name: 'The Basics of Spec Proxy'});