export default class TeqFw_Sample_Service {
    constructor({TeqFw_Sample_Config}) {
        /** @type {TeqFw_Sample_Config} */
        const _config = TeqFw_Sample_Config;
        this.name = "TeqFw_Sample_Service";
        console.log(`'${this.name}' instance is created (deps: [${_config.name}]).`);
    }
}