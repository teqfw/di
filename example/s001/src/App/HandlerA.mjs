export default class Sample_App_HandlerA {
    /**
     * Handler gets new instance of 'Sample_App_Service' in constructor.
     *
     * @param {Sample_App_Service} Sample_App_Service
     */
    constructor({Sample_App_Service$}) {
        this.name = "Sample_App_HandlerA";
        console.log(`'${this.name}' instance is created.`);

        /**
         * @memberOf Sample_App_HandlerA.prototype
         */
        this.process = function () {
            Sample_App_Service$.exec(this.name);
        }
    }
}
