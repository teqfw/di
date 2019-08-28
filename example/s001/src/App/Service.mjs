export default class Sample_App_Service {
    constructor({Sample_App_Config$}) {
        this.name = "Sample_App_Service";
        console.log(`'${this.name}' instance is created.`);

        /**
         * @param {string} param
         * @memberOf Sample_App_Service.prototype
         */
        this.exec = function (param) {
            console.log(`Service running with '${param}' param.`);
        }
    }
}