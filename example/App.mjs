export default class Vendor_Module_App {
    constructor(spec) {
        /** @type {Vendor_Module_Config} */
        const _config = spec.Vendor_Module_Config;
        /** @type {Vendor_Module_Service} */
        const _service = spec.Vendor_Module_Service;
        this.name = "Vendor_Module_App";

        /**
         * @memberOf Vendor_Module_App.prototype
         */
        this.run = function () {
            console.log(`Application '${this.name}' is running (deps: [${_config.name}, ${_service.name}]).`);
        }
    }
}