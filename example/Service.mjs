export default class Vendor_Module_Service {
    constructor({Vendor_Module_Config}) {
        /** @type {Vendor_Module_Config} */
        const _config = Vendor_Module_Config;
        this.name = "Vendor_Module_Service";
        console.log(`'${this.name}' instance is created (deps: [${_config.name}]).`);
    }
}