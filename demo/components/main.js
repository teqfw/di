// ./main.js
import analyzer from './di/SpecAnalyzer.js';
import composer from './di/Composer.js';
import container from './di/Container.js';
import parser from './di/Parser.js';
import resolver from './di/Resolver.js';

// setup DI container
composer.setSpecAnalyzer(analyzer);
container.setComposer(composer);
container.setParser(parser);
container.setResolver(resolver);

// get the service object and use it
const serv = await container.get('app.Service');
serv({name: 'The Components'});