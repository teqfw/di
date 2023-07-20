/** @implements IResolver */
export default {
    map: function (key) {
        if (key === 'service') return './service.js';
        else if (key === 'logger') return './logger.js';
        else if (key === 'config') return './config.js';
        else return key;
    }
};