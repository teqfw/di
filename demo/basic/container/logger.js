export default async function Factory({['./config.js']: config}) {
    console.info(`Logger is created with config: '${JSON.stringify(config)}'`);
    return {
        error: (msg) => console.error(msg),
        info: (msg) => console.info(msg),
    };
};