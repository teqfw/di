export default class Sample_App {
    /**
     * @param {Sample_App_Config} config
     * @param {Sample_App_Service} service
     */
    constructor(
        {
            Sample_App_Config: config, // default export is an object (singleton)
            Sample_App_Service$: service, // construct a singleton from default export
        }
    ) {
        config.name = 'The BiSex App'; // change the name in the `config` singleton

        this.run = function () {
            service.exec('Running...');
        }
    }
}