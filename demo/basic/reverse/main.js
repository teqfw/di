// import and create dependency
const pathToLogger = './logger.js';
const {default: fLogger} = await import(pathToLogger);
const logger = await fLogger();

// import and create service
const {default: fService} = await import('./service.js');
const serv = await fService({[pathToLogger]: logger});
serv({name: 'The Basics of Spec Reverse'});