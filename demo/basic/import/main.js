const {default: fService} = await import('./service.js');
const serv = await fService({logger: './logger.js'});
serv({name: 'The Basics of Import'});