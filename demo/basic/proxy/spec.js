// workaround to load 'logger' dep
import fLogger from './logger.js';

const logger = await fLogger();
// end of workaround

export default new Proxy({}, {
    get(target, prop) {
        console.log(`proxy: ${prop}`);
        return (prop === './logger.js') ? logger : target[prop];
    }
});