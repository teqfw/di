import parser from './parser.js';
import fService from './service.js';

// analyze service factory and create deps
const deps = parser(fService.toString());
const spec = {};
for (const dep of deps) {
    const {default: factory} = await import(dep);
    spec[dep] = await factory();
}

// create service itself
const serv = await fService(spec);
serv({name: 'The Basics of Parser'});