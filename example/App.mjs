export default class TeqFw_Sample_App {
    constructor(spec) {
        /** @type {TeqFw_Sample_Config} */
        const _config = spec.TeqFw_Sample_Config;
        /** @type {TeqFw_Sample_Service} */
        const _service = spec.TeqFw_Sample_Service;
        this.name = "TeqFw_Sample_App";
        console.log(`'${this.name}' instance is created (deps: [${_config.name}, ${_service.name}]).`);

        this.run = function () {
            console.log(`Application '${_config.name}' is running.`);
        }
    }
}